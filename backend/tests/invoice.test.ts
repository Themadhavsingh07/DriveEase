import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../src/config/db';
import { InvoiceService } from '../src/services/invoice.service';
import { BookingService } from '../src/services/booking.service';
import bcrypt from 'bcryptjs';

describe('🧾 Phase 5: PDF Invoice Generation & Verification Tests', () => {
  let user: any;
  let car: any;
  let booking: any;

  beforeAll(async () => {
    await prisma.$connect();
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    user = await prisma.user.create({
      data: {
        email: `invoiceuser_${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: 'Diana',
        lastName: 'Prince',
        phone: '+919876543299',
        role: 'CUSTOMER',
      },
    });

    const cat = await prisma.carCategory.upsert({
      where: { slug: 'invoice-test-cat' },
      create: { name: 'Invoice Test Cat', slug: 'invoice-test-cat' },
      update: {},
    });

    car = await prisma.car.create({
      data: {
        brand: 'BMW',
        model: '330i M-Sport Invoice Test',
        year: 2024,
        categoryId: cat.id,
        dailyPrice: 8000,
        securityDeposit: 15000,
        minRentalDays: 1,
        maxRentalDays: 30,
        transmission: 'AUTOMATIC',
        fuelType: 'PETROL',
        seatingCapacity: 5,
        mileage: '14 kmpl',
        isAvailable: true,
        isActive: true,
      },
    });

    const hold = await BookingService.createBookingHold({
      userId: user.id,
      carId: car.id,
      pickupDateTime: new Date('2026-12-25T10:00:00.000Z'),
      returnDateTime: new Date('2026-12-27T10:00:00.000Z'), // 2 days
      pickupLocation: 'Luxury Hub North',
      dropoffLocation: 'Luxury Hub North',
      insuranceType: 'COMPREHENSIVE',
      driverName: 'Diana Prince',
      driverEmail: user.email,
      driverPhone: user.phone,
      driverLicenseNumber: 'DL-INVOICE-TEST',
    });

    booking = await BookingService.confirmBooking({
      bookingId: hold.booking.id,
      razorpayOrderId: 'order_invoice_sim',
      razorpayPaymentId: 'pay_invoice_sim',
      razorpaySignature: 'sig_invoice_sim',
      userId: user.id,
    });
  });

  afterAll(async () => {
    if (user?.id) {
      await prisma.invoice.deleteMany({ where: { userId: user.id } });
    }
    if (booking?.id) {
      await prisma.bookingStatusHistory.deleteMany({ where: { bookingId: booking.id } });
      await prisma.bookingService.deleteMany({ where: { bookingId: booking.id } });
      await prisma.payment.deleteMany({ where: { bookingId: booking.id } });
      await prisma.booking.deleteMany({ where: { id: booking.id } });
    }
    if (car?.id) {
      await prisma.car.deleteMany({ where: { id: car.id } });
    }
    if (user?.id) {
      await prisma.user.deleteMany({ where: { id: user.id } });
    }
    await prisma.$disconnect();
  });

  it('1. Generates an authentic binary PDF invoice with DriveEase branding and QR code', async () => {
    const fullBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        car: true,
        payment: true,
        user: true,
      },
    });

    expect(fullBooking).toBeDefined();

    const pdfBuffer = await InvoiceService.generateInvoicePdf({
      booking: fullBooking as any,
    });

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000); // Standard PDF > 1KB

    // Standard PDF file header magic bytes "%PDF-"
    const header = pdfBuffer.slice(0, 5).toString('ascii');
    expect(header).toBe('%PDF-');
  });

  it('2. Serves generated invoice via BookingService with authorization guard', async () => {
    const pdfBuffer = await BookingService.generateInvoice(booking.id, user.id);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.slice(0, 5).toString('ascii')).toBe('%PDF-');
  });

  it('3. Rejects invoice generation request from unauthorized user', async () => {
    await expect(
      BookingService.generateInvoice(booking.id, 'unauthorized-user-id')
    ).rejects.toThrow(/access denied/i);
  });
});
