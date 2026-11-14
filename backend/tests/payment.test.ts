import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'crypto';
import { verifyRazorpaySignature, verifyRazorpayWebhookSignature } from '../src/config/razorpay';
import prisma from '../src/config/db';
import { BookingService } from '../src/services/booking.service';
import { BookingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

describe('💳 Phase 5: Payment Gateway, Signature Verification & Webhook Tests', () => {
  let customer: any;
  let car: any;
  let testBooking: any;

  beforeAll(async () => {
    await prisma.$connect();
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    customer = await prisma.user.create({
      data: {
        email: `payuser_${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: 'Bob',
        lastName: 'Williams',
        phone: '+919876543222',
        role: 'CUSTOMER',
      },
    });

    const cat = await prisma.carCategory.upsert({
      where: { slug: 'payment-test-cat' },
      create: { name: 'Payment Test Cat', slug: 'payment-test-cat' },
      update: {},
    });

    car = await prisma.car.create({
      data: {
        brand: 'Kia',
        model: 'Seltos Payment Test',
        year: 2024,
        categoryId: cat.id,
        dailyPrice: 3500,
        securityDeposit: 5000,
        minRentalDays: 1,
        maxRentalDays: 10,
        transmission: 'AUTOMATIC',
        fuelType: 'PETROL',
        seatingCapacity: 5,
        mileage: '16 kmpl',
        isAvailable: true,
        isActive: true,
      },
    });

    const hold = await BookingService.createBookingHold({
      userId: customer.id,
      carId: car.id,
      pickupDateTime: new Date('2026-12-20T10:00:00.000Z'),
      returnDateTime: new Date('2026-12-22T10:00:00.000Z'),
      pickupLocation: 'Downtown Airport',
      dropoffLocation: 'Downtown Airport',
      driverName: 'Bob Williams',
      driverEmail: customer.email,
      driverPhone: customer.phone,
      driverLicenseNumber: 'DL-99887766',
    });

    testBooking = hold.booking;
  });

  afterAll(async () => {
    if (customer?.id) {
      await prisma.invoice.deleteMany({ where: { userId: customer.id } });
    }
    if (testBooking?.id) {
      await prisma.bookingStatusHistory.deleteMany({ where: { bookingId: testBooking.id } });
      await prisma.bookingService.deleteMany({ where: { bookingId: testBooking.id } });
      await prisma.refund.deleteMany({ where: { bookingId: testBooking.id } });
      await prisma.payment.deleteMany({ where: { bookingId: testBooking.id } });
      await prisma.booking.deleteMany({ where: { id: testBooking.id } });
    }
    if (car?.id) {
      await prisma.car.deleteMany({ where: { id: car.id } });
    }
    if (customer?.id) {
      await prisma.user.deleteMany({ where: { id: customer.id } });
    }
    await prisma.$disconnect();
  });

  it('1. Cryptographically generates and validates authentic Razorpay HMAC SHA-256 signature', () => {
    const orderId = 'order_valid_12345';
    const paymentId = 'pay_valid_67890';
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_DriveEase';

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${orderId}|${paymentId}`);
    const validSignature = hmac.digest('hex');

    const result = verifyRazorpaySignature(orderId, paymentId, validSignature);
    expect(result).toBe(true);
  });

  it('2. Rejects tampered or malicious Razorpay payment signatures', () => {
    const orderId = 'order_valid_12345';
    const paymentId = 'pay_valid_67890';
    const forgedSignature = 'deadbeef1234567890abcdefdeadbeef1234567890abcdefdeadbeef12345678';

    const result = verifyRazorpaySignature(orderId, paymentId, forgedSignature);
    expect(result).toBe(false);
  });

  it('3. Verifies authentic Razorpay Webhook signature', () => {
    const webhookSecret = 'whsec_DriveEaseTestSecret_2026';
    const rawPayload = Buffer.from(JSON.stringify({ event: 'payment.captured', entity: { id: 'pay_123' } }));

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawPayload)
      .digest('hex');

    const isValid = verifyRazorpayWebhookSignature(rawPayload, expectedSignature, webhookSecret);
    expect(isValid).toBe(true);

    const isTamperedValid = verifyRazorpayWebhookSignature(rawPayload, 'forged_sig', webhookSecret);
    expect(isTamperedValid).toBe(false);
  });

  it('4. Confirms booking via payment verification idempotently', async () => {
    const confirmed1 = await BookingService.confirmBooking({
      bookingId: testBooking.id,
      razorpayOrderId: 'order_sim_test1',
      razorpayPaymentId: 'pay_sim_test1',
      razorpaySignature: 'sig_sim_test1',
      userId: customer.id,
      changedBy: 'TEST_SUITE',
    });

    expect(confirmed1.bookingStatus).toBe(BookingStatus.CONFIRMED);

    // Call again - should be idempotent
    const confirmed2 = await BookingService.confirmBooking({
      bookingId: testBooking.id,
      razorpayOrderId: 'order_sim_test1',
      razorpayPaymentId: 'pay_sim_test1',
      razorpaySignature: 'sig_sim_test1',
      userId: customer.id,
      changedBy: 'TEST_SUITE',
    });

    expect(confirmed2.bookingStatus).toBe(BookingStatus.CONFIRMED);
  });
});
