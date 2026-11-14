import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../src/config/db';
import { PricingService } from '../src/services/pricing.service';

describe('💰 Phase 5: Rental Pricing Engine & Dynamic Calculator Tests', () => {
  let testCarId: string;
  let testService1Id: string;
  let testService2Id: string;
  let percentageCouponCode: string;
  let fixedCouponCode: string;

  beforeAll(async () => {
    await prisma.$connect();

    // Ensure category exists
    const cat = await prisma.carCategory.upsert({
      where: { slug: 'pricing-test-sedan' },
      create: { name: 'Pricing Test Sedan', slug: 'pricing-test-sedan' },
      update: {},
    });

    // Create test vehicle
    const car = await prisma.car.create({
      data: {
        brand: 'Honda',
        model: 'City ZX Pricing Test',
        year: 2024,
        categoryId: cat.id,
        dailyPrice: 3000,
        securityDeposit: 5000,
        minRentalDays: 1,
        maxRentalDays: 30,
        transmission: 'AUTOMATIC',
        fuelType: 'PETROL',
        seatingCapacity: 5,
        mileage: '18 kmpl',
        isAvailable: true,
        isActive: true,
      },
    });
    testCarId = car.id;

    // Create test additional services
    const s1 = await prisma.additionalService.upsert({
      where: { slug: 'gps-unit-pricing-test' },
      create: {
        name: 'GPS Navigator Unit',
        slug: 'gps-unit-pricing-test',
        pricePerDay: 200,
        isOneTime: false,
        isAvailable: true,
      },
      update: {},
    });
    testService1Id = s1.id;

    const s2 = await prisma.additionalService.upsert({
      where: { slug: 'child-safety-seat-pricing-test' },
      create: {
        name: 'Child Safety Seat',
        slug: 'child-safety-seat-pricing-test',
        pricePerDay: 500,
        isOneTime: true,
        isAvailable: true,
      },
      update: {},
    });
    testService2Id = s2.id;

    // Create test coupons
    percentageCouponCode = `TEST_DISC10_${Date.now()}`;
    await prisma.coupon.create({
      data: {
        code: percentageCouponCode,
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minBookingAmount: 5000,
        maxDiscountAmount: 1000,
        isActive: true,
        usageLimit: 100,
      },
    });

    fixedCouponCode = `TEST_FLAT500_${Date.now()}`;
    await prisma.coupon.create({
      data: {
        code: fixedCouponCode,
        discountType: 'FIXED',
        discountValue: 500,
        minBookingAmount: 2000,
        isActive: true,
        usageLimit: 50,
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    if (percentageCouponCode && fixedCouponCode) {
      await prisma.coupon.deleteMany({
        where: { code: { in: [percentageCouponCode, fixedCouponCode] } },
      });
    }
    if (testService1Id && testService2Id) {
      await prisma.additionalService.deleteMany({
        where: { id: { in: [testService1Id, testService2Id] } },
      });
    }
    if (testCarId) {
      await prisma.car.deleteMany({ where: { id: testCarId } });
    }
    await prisma.$disconnect();
  });

  it('1. Calculates single-day rental with basic protection and zero services', async () => {
    const pickup = new Date('2026-12-01T10:00:00.000Z');
    const returnDt = new Date('2026-12-02T10:00:00.000Z');

    const result = await PricingService.calculatePrice({
      carId: testCarId,
      pickupDateTime: pickup,
      returnDateTime: returnDt,
      insuranceType: 'BASIC',
    });

    expect(result.rentalDays).toBe(1);
    expect(result.dailyRate).toBe(3000);
    expect(result.baseAmount).toBe(3000);
    expect(result.insuranceAmount).toBe(0);
    expect(result.servicesAmount).toBe(0);
    expect(result.subtotal).toBe(3000);
    expect(result.discountAmount).toBe(0);
    expect(result.taxRate).toBe(0.18);
    // GST 18% of 3000 = 540
    expect(result.taxAmount).toBe(540);
    // Security deposit: 5000
    expect(result.securityDeposit).toBe(5000);
    // Final payable: 3000 + 540 + 5000 = 8540
    expect(result.finalPayableAmount).toBe(8540);
  });

  it('2. Calculates multi-day rental with PREMIUM protection and add-ons', async () => {
    const pickup = new Date('2026-12-01T10:00:00.000Z');
    const returnDt = new Date('2026-12-04T10:00:00.000Z'); // 3 days

    const result = await PricingService.calculatePrice({
      carId: testCarId,
      pickupDateTime: pickup,
      returnDateTime: returnDt,
      insuranceType: 'PREMIUM', // ₹500/day * 3 = ₹1500
      serviceIds: [testService1Id, testService2Id], // GPS (200*3=600) + Child seat (500 one-time) = 1100
    });

    expect(result.rentalDays).toBe(3);
    expect(result.baseAmount).toBe(9000); // 3000 * 3
    expect(result.insuranceAmount).toBe(1500); // 500 * 3
    expect(result.servicesAmount).toBe(1100); // 600 + 500
    // Gross subtotal = 9000 + 1500 + 1100 = 11600
    expect(result.subtotal).toBe(11600);
    // 18% GST of 11600 = 2088
    expect(result.taxAmount).toBe(2088);
    // Deposit: 5000
    expect(result.securityDeposit).toBe(5000);
    // Final: 11600 + 2088 + 5000 = 18688
    expect(result.finalPayableAmount).toBe(18688);
  });

  it('3. Calculates percentage discount with max discount ceiling', async () => {
    const pickup = new Date('2026-12-01T10:00:00.000Z');
    const returnDt = new Date('2026-12-06T10:00:00.000Z'); // 5 days => base 15,000

    const result = await PricingService.calculatePrice({
      carId: testCarId,
      pickupDateTime: pickup,
      returnDateTime: returnDt,
      insuranceType: 'BASIC',
      couponCode: percentageCouponCode,
    });

    expect(result.rentalDays).toBe(5);
    expect(result.subtotal).toBe(15000);
    // 10% of 15000 is 1500, but capped at maxDiscountAmount = 1000
    expect(result.discountAmount).toBe(1000);
    expect(result.netTaxable).toBe(14000);
    // GST 18% of 14000 = 2520
    expect(result.taxAmount).toBe(2520);
    expect(result.finalPayableAmount).toBe(14000 + 2520 + 5000);
  });

  it('4. Calculates fixed coupon discount', async () => {
    const pickup = new Date('2026-12-01T10:00:00.000Z');
    const returnDt = new Date('2026-12-02T10:00:00.000Z'); // 1 day => 3000

    const result = await PricingService.calculatePrice({
      carId: testCarId,
      pickupDateTime: pickup,
      returnDateTime: returnDt,
      couponCode: fixedCouponCode,
    });

    expect(result.subtotal).toBe(3000);
    expect(result.discountAmount).toBe(500);
    expect(result.netTaxable).toBe(2500);
    // GST 18% of 2500 = 450
    expect(result.taxAmount).toBe(450);
    expect(result.finalPayableAmount).toBe(2500 + 450 + 5000);
  });

  it('5. Rejects coupon when subtotal is below minimum booking amount', async () => {
    const pickup = new Date('2026-12-01T10:00:00.000Z');
    const returnDt = new Date('2026-12-02T10:00:00.000Z'); // 1 day => 3000 (< 5000 threshold for percentage coupon)

    const result = await PricingService.calculatePrice({
      carId: testCarId,
      pickupDateTime: pickup,
      returnDateTime: returnDt,
      couponCode: percentageCouponCode,
    });

    // Discount should not be applied
    expect(result.discountAmount).toBe(0);
    expect(result.couponCode).toBeNull();
  });
});
