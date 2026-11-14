import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import prisma from '../src/config/db';
import { calculateRentalPricing } from '../src/utils/priceCalculator';
import { hasDateOverlap, calculateRentalDays } from '../src/utils/dateUtils';

const app = createApp();

describe('🚗 DriveEase Engine Unit & Integration Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Price Calculator Engine Unit Tests', () => {
    it('should correctly calculate base amount, GST (18%), and final payable', () => {
      const breakdown = calculateRentalPricing({
        dailyPrice: 2500,
        securityDeposit: 3000,
        rentalDays: 3,
        insuranceType: 'BASIC',
      });

      expect(breakdown.dailyPrice).toBe(2500);
      expect(breakdown.rentalDays).toBe(3);
      expect(breakdown.baseAmount).toBe(7500);
      expect(breakdown.insuranceAmount).toBe(0);
      // GST: 18% of 7500 = 1350
      expect(breakdown.taxAmount).toBe(1350);
      expect(breakdown.securityDeposit).toBe(3000);
      // Final = 7500 + 1350 + 3000 = 11850
      expect(breakdown.finalPayableAmount).toBe(11850);
    });

    it('should calculate insurance and additional services properly', () => {
      const breakdown = calculateRentalPricing({
        dailyPrice: 5000,
        securityDeposit: 10000,
        rentalDays: 2,
        insuranceType: 'PREMIUM', // 500/day * 2 = 1000
        services: [
          { id: '1', name: 'Child Seat', pricePerDay: 250, isOneTime: false }, // 250 * 2 = 500
          { id: '2', name: 'Cleaning', pricePerDay: 450, isOneTime: true }, // 450
        ],
      });

      expect(breakdown.baseAmount).toBe(10000);
      expect(breakdown.insuranceAmount).toBe(1000);
      expect(breakdown.servicesAmount).toBe(950);
      // Subtotal = 10000 + 1000 + 950 = 11950
      expect(breakdown.subtotal).toBe(11950);
      // GST: 18% of 11950 = 2151
      expect(breakdown.taxAmount).toBe(2151);
      // Final: 11950 + 2151 + 10000 = 24101
      expect(breakdown.finalPayableAmount).toBe(24101);
    });

    it('should apply percentage coupons with caps and minimum amounts', () => {
      const breakdown = calculateRentalPricing({
        dailyPrice: 10000,
        securityDeposit: 5000,
        rentalDays: 2, // base = 20000
        coupon: {
          code: 'TEST10',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minBookingAmount: 5000,
          maxDiscountAmount: 1500,
        },
      });

      expect(breakdown.baseAmount).toBe(20000);
      // 10% of 20000 is 2000, but capped at 1500
      expect(breakdown.discountAmount).toBe(1500);
      // Net taxable = 20000 - 1500 = 18500
      // Tax: 18% of 18500 = 3330
      expect(breakdown.taxAmount).toBe(3330);
      // Final: 18500 + 3330 + 5000 = 26830
      expect(breakdown.finalPayableAmount).toBe(26830);
    });
  });

  describe('2. Date Overlap & Availability Logic', () => {
    it('should accurately detect overlapping intervals', () => {
      const day1 = new Date('2026-12-01T10:00:00Z');
      const day5 = new Date('2026-12-05T10:00:00Z');

      // Fully inside
      expect(hasDateOverlap(new Date('2026-12-02T10:00:00Z'), new Date('2026-12-04T10:00:00Z'), day1, day5)).toBe(true);

      // Overlapping start
      expect(hasDateOverlap(new Date('2026-11-28T10:00:00Z'), new Date('2026-12-02T10:00:00Z'), day1, day5)).toBe(true);

      // Overlapping end
      expect(hasDateOverlap(new Date('2026-12-04T10:00:00Z'), new Date('2026-12-08T10:00:00Z'), day1, day5)).toBe(true);

      // Completely outside (before)
      expect(hasDateOverlap(new Date('2026-11-20T10:00:00Z'), new Date('2026-11-25T10:00:00Z'), day1, day5)).toBe(false);

      // Completely outside (after)
      expect(hasDateOverlap(new Date('2026-12-06T10:00:00Z'), new Date('2026-12-10T10:00:00Z'), day1, day5)).toBe(false);
    });

    it('should calculate rental days correctly (min 1 day)', () => {
      const d1 = new Date('2026-12-01T10:00:00Z');
      const d2 = new Date('2026-12-02T10:00:00Z');
      const d3 = new Date('2026-12-04T12:00:00Z');

      expect(calculateRentalDays(d1, d2)).toBe(1);
      expect(calculateRentalDays(d1, d3)).toBe(4); // 3 days + 2 hours ceil = 4
    });
  });

  describe('3. REST API Endpoints', () => {
    it('GET /api/health should return healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });

    it('POST /api/auth/login with valid credentials should succeed and return JWT', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'customer@driveease.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('customer@driveease.com');
      expect(res.body.data.user.role).toBe('CUSTOMER');
    });

    it('POST /api/auth/login with invalid password should fail with 401', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'customer@driveease.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/cars should list available vehicles with pagination', async () => {
      const res = await request(app).get('/api/cars');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cars.length).toBeGreaterThan(0);
      expect(res.body.data.pagination.total).toBeGreaterThan(0);
    });

    it('GET /api/cars/categories should return car categories', async () => {
      const res = await request(app).get('/api/cars/categories');
      expect(res.status).toBe(200);
      expect(res.body.data.categories.length).toBeGreaterThan(0);
    });

    it('POST /api/pricing/calculate should return itemized price breakdown', async () => {
      const car = await prisma.car.findFirst();
      expect(car).toBeDefined();

      const pickup = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
      const dropoff = new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app).post('/api/pricing/calculate').send({
        carId: car!.id,
        pickupDateTime: pickup,
        returnDateTime: dropoff,
        insuranceType: 'PREMIUM',
        couponCode: 'WELCOME500',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.breakdown.rentalDays).toBeGreaterThanOrEqual(3);
      expect(res.body.data.breakdown.discountAmount).toBe(500);
      expect(res.body.data.breakdown.finalPayableAmount).toBeGreaterThan(0);
    });
  });
});
