import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../src/config/db';
import { BookingService } from '../src/services/booking.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

describe('🚗 Phase 5: Booking Management & Hold Lifecycle Tests', () => {
  let customerUser1: any;
  let customerUser2: any;
  let testCar: any;

  beforeAll(async () => {
    await prisma.$connect();
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Create 2 test customers
    customerUser1 = await prisma.user.create({
      data: {
        email: `cust1_${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+919876543210',
        role: 'CUSTOMER',
      },
    });

    customerUser2 = await prisma.user.create({
      data: {
        email: `cust2_${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: 'Alice',
        lastName: 'Smith',
        phone: '+919876543211',
        role: 'CUSTOMER',
      },
    });

    const cat = await prisma.carCategory.upsert({
      where: { slug: 'booking-test-suv' },
      create: { name: 'Booking Test SUV', slug: 'booking-test-suv' },
      update: {},
    });

    testCar = await prisma.car.create({
      data: {
        brand: 'Hyundai',
        model: 'Creta SX Booking Test',
        year: 2024,
        categoryId: cat.id,
        dailyPrice: 4000,
        securityDeposit: 6000,
        minRentalDays: 1,
        maxRentalDays: 14,
        transmission: 'AUTOMATIC',
        fuelType: 'DIESEL',
        seatingCapacity: 5,
        mileage: '17 kmpl',
        isAvailable: true,
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    const userIds = [customerUser1?.id, customerUser2?.id].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.invoice.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.bookingStatusHistory.deleteMany({
        where: { booking: { userId: { in: userIds } } },
      });
      await prisma.bookingService.deleteMany({
        where: { booking: { userId: { in: userIds } } },
      });
      await prisma.refund.deleteMany({
        where: { booking: { userId: { in: userIds } } },
      });
      await prisma.payment.deleteMany({
        where: { booking: { userId: { in: userIds } } },
      });
      await prisma.booking.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
    }
    if (testCar?.id) {
      await prisma.car.deleteMany({ where: { id: testCar.id } });
    }
    await prisma.$disconnect();
  });

  it('1. Creates a 10-minute temporary booking hold with advisory lock and PENDING state', async () => {
    const pickup = new Date('2026-12-10T10:00:00.000Z');
    const returnDt = new Date('2026-12-13T10:00:00.000Z'); // 3 days

    const result = await BookingService.createBookingHold({
      userId: customerUser1.id,
      carId: testCar.id,
      pickupDateTime: pickup,
      returnDateTime: returnDt,
      pickupLocation: 'Terminal 3 Airport Hub',
      dropoffLocation: 'Downtown City Center',
      insuranceType: 'BASIC',
      driverName: 'John Doe',
      driverEmail: customerUser1.email,
      driverPhone: customerUser1.phone,
      driverLicenseNumber: 'DL-987654321',
    });

    expect(result.booking.id).toBeDefined();
    expect(result.booking.bookingStatus).toBe(BookingStatus.PENDING);
    expect(result.booking.paymentStatus).toBe(PaymentStatus.PENDING);
    expect(result.booking.holdExpiresAt).toBeDefined();
    expect(new Date(result.booking.holdExpiresAt!).getTime()).toBeGreaterThan(Date.now());
    expect(result.razorpayOrder.orderId).toBeDefined();
  });

  it('2. Prevents overlapping booking holds on the same vehicle while active hold exists', async () => {
    const pickupOverlap = new Date('2026-12-11T10:00:00.000Z');
    const returnOverlap = new Date('2026-12-14T10:00:00.000Z');

    await expect(
      BookingService.createBookingHold({
        userId: customerUser2.id,
        carId: testCar.id,
        pickupDateTime: pickupOverlap,
        returnDateTime: returnOverlap,
        pickupLocation: 'Downtown City Center',
        dropoffLocation: 'Downtown City Center',
        driverName: 'Alice Smith',
        driverEmail: customerUser2.email,
        driverPhone: customerUser2.phone,
        driverLicenseNumber: 'DL-11223344',
      })
    ).rejects.toThrow(/already reserved/i);
  });

  it('3. Confirms booking, clears hold, creates tax invoice, and logs status history', async () => {
    const existing = await prisma.booking.findFirst({
      where: { userId: customerUser1.id, bookingStatus: BookingStatus.PENDING },
      include: { payment: true },
    });
    expect(existing).toBeDefined();

    const confirmed = await BookingService.confirmBooking({
      bookingId: existing!.id,
      razorpayOrderId: existing!.payment?.razorpayOrderId || 'order_sim_test',
      razorpayPaymentId: 'pay_test_12345',
      razorpaySignature: 'sig_test_12345',
      userId: customerUser1.id,
      changedBy: 'CUSTOMER_TEST',
    });

    expect(confirmed.bookingStatus).toBe(BookingStatus.CONFIRMED);
    expect(confirmed.paymentStatus).toBe(PaymentStatus.PAID);
    expect(confirmed.holdExpiresAt).toBeNull();

    // Verify invoice created
    const invoice = await prisma.invoice.findUnique({
      where: { bookingId: existing!.id },
    });
    expect(invoice).toBeDefined();
    expect(invoice?.status).toBe('PAID');

    // Verify status history
    const history = await prisma.bookingStatusHistory.findMany({
      where: { bookingId: existing!.id },
    });
    expect(history.length).toBeGreaterThanOrEqual(2); // PENDING then CONFIRMED
    expect(history.some((h) => h.toStatus === BookingStatus.CONFIRMED)).toBe(true);
  });

  it('4. Allows free cancellation with 100% refund when cancelled > 24 hours prior to pickup', async () => {
    const existing = await prisma.booking.findFirst({
      where: { userId: customerUser1.id, bookingStatus: BookingStatus.CONFIRMED },
    });
    expect(existing).toBeDefined();

    const cancelResult = await BookingService.cancelBooking({
      bookingId: existing!.id,
      reason: 'Trip rescheduled by customer',
      userId: customerUser1.id,
    });

    expect(cancelResult.booking.bookingStatus).toBe(BookingStatus.CANCELLED);
    expect(cancelResult.cancellationFee).toBe(0);
    expect(cancelResult.refundAmount).toBe(Number(existing!.totalAmount));
    expect(cancelResult.booking.paymentStatus).toBe(PaymentStatus.REFUNDED);

    // Verify refund entity was created
    const refund = await prisma.refund.findFirst({
      where: { bookingId: existing!.id },
    });
    expect(refund).toBeDefined();
    expect(Number(refund?.amount)).toBe(Number(existing!.totalAmount));
  });

  it('5. Rejects cancellation attempt on already cancelled booking', async () => {
    const existing = await prisma.booking.findFirst({
      where: { userId: customerUser1.id, bookingStatus: BookingStatus.CANCELLED },
    });

    await expect(
      BookingService.cancelBooking({
        bookingId: existing!.id,
        reason: 'Duplicate cancel',
        userId: customerUser1.id,
      })
    ).rejects.toThrow(/already cancelled/i);
  });
});
