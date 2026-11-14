import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import prisma from '../src/config/db';
import { BookingStatus } from '@prisma/client';

const app = createApp();

describe('🗓️ Phase 4 Real-Time Availability & Booking Calendar API Tests', () => {
  let sampleCarId = '';
  let customerUserId = '';
  const testBookingIds: string[] = [];

  beforeAll(async () => {
    await prisma.$connect();

    const car = await prisma.car.findFirst({
      where: { isActive: true, isAvailable: true },
    });
    expect(car).toBeDefined();
    sampleCarId = car!.id;

    const customer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
    });
    expect(customer).toBeDefined();
    customerUserId = customer!.id;
  });

  afterAll(async () => {
    if (testBookingIds.length > 0) {
      await prisma.booking.deleteMany({
        where: { id: { in: testBookingIds } },
      });
    }
    await prisma.$disconnect();
  });

  describe('1. POST /api/v1/availability/check Endpoint', () => {
    it('should return available: true for a valid future interval without conflicting bookings', async () => {
      const pickup = '2027-05-10T10:00:00+05:30';
      const dropoff = '2027-05-13T10:00:00+05:30';

      const res = await request(app)
        .post('/api/v1/availability/check')
        .send({
          carId: sampleCarId,
          pickupDateTime: pickup,
          returnDateTime: dropoff,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.available).toBe(true);
      expect(res.body.data.carId).toBe(sampleCarId);
      expect(res.body.data.message).toContain('available');
    });

    it('should return available: false when a conflicting booking exists in database', async () => {
      const pickupDate = new Date('2027-05-20T10:00:00Z');
      const returnDate = new Date('2027-05-24T10:00:00Z');

      const booking = await prisma.booking.create({
        data: {
          bookingNumber: `AVAIL-TEST-${Date.now()}`,
          userId: customerUserId,
          carId: sampleCarId,
          pickupLocation: 'Downtown',
          dropoffLocation: 'Downtown',
          pickupDateTime: pickupDate,
          returnDateTime: returnDate,
          rentalDays: 4,
          dailyPrice: 2500,
          basePrice: 10000,
          totalAmount: 11800,
          bookingStatus: BookingStatus.CONFIRMED,
          driverName: 'Check Tester',
          driverEmail: 'tester@avail.com',
          driverPhone: '+91 9999999999',
          driverLicenseNumber: 'DL-AVAIL',
        },
      });
      testBookingIds.push(booking.id);

      // Overlapping request: May 22 to May 26
      const res = await request(app)
        .post('/api/v1/availability/check')
        .send({
          carId: sampleCarId,
          pickupDateTime: '2027-05-22T10:00:00Z',
          returnDateTime: '2027-05-26T10:00:00Z',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.available).toBe(false);
      expect(res.body.data.message).toContain('already reserved');
    });

    it('should reject past pickup date with 400 Bad Request', async () => {
      const pastPickup = '2020-01-01T10:00:00Z';
      const pastReturn = '2020-01-04T10:00:00Z';

      const res = await request(app)
        .post('/api/v1/availability/check')
        .send({
          carId: sampleCarId,
          pickupDateTime: pastPickup,
          returnDateTime: pastReturn,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject return date earlier than pickup date with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/availability/check')
        .send({
          carId: sampleCarId,
          pickupDateTime: '2027-06-10T10:00:00Z',
          returnDateTime: '2027-06-08T10:00:00Z',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. GET /api/v1/availability/cars/:carId/calendar Endpoint', () => {
    it('should return monthly calendar with status array for all days', async () => {
      const res = await request(app).get(
        `/api/v1/availability/cars/${sampleCarId}/calendar?month=11&year=2026`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.calendar).toBeDefined();
      expect(Array.isArray(res.body.data.calendar)).toBe(true);
      expect(res.body.data.daysInMonth).toBe(30);
      expect(res.body.data.calendar.length).toBe(30);

      // Verify each calendar day shape
      const firstDay = res.body.data.calendar[0];
      expect(firstDay.date).toBe('2026-11-01');
      expect(firstDay.status).toBeDefined();
      expect(['AVAILABLE', 'PARTIALLY_BOOKED', 'FULLY_BOOKED', 'PAST']).toContain(firstDay.status);
    });

    it('should reject invalid month (>12) with 400 Bad Request', async () => {
      const res = await request(app).get(
        `/api/v1/availability/cars/${sampleCarId}/calendar?month=13&year=2026`
      );

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. GET /api/v1/availability/cars/:carId (Date Range) Endpoint', () => {
    it('should return range breakdown for a requested start and end date', async () => {
      const res = await request(app).get(
        `/api/v1/availability/cars/${sampleCarId}?startDate=2027-07-01&endDate=2027-07-15`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rangeDays).toBe(14);
      expect(typeof res.body.data.available).toBe('boolean');
    });
  });

  describe('4. POST /api/v1/availability/search Endpoint', () => {
    it('should return available fleet matching search interval', async () => {
      const res = await request(app)
        .post('/api/v1/availability/search')
        .send({
          pickupDateTime: '2027-08-01T10:00:00+05:30',
          returnDateTime: '2027-08-05T10:00:00+05:30',
          page: 1,
          limit: 10,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.availableCars)).toBe(true);
      expect(res.body.data.availableCars.length).toBeGreaterThan(0);
      expect(res.body.data.searchInterval).toBeDefined();
    });

    it('should filter available cars by transmission and fuelType', async () => {
      const res = await request(app)
        .post('/api/v1/availability/search')
        .send({
          pickupDateTime: '2027-08-10T10:00:00+05:30',
          returnDateTime: '2027-08-14T10:00:00+05:30',
          transmission: 'AUTOMATIC',
        });

      expect(res.status).toBe(200);
      const cars = res.body.data.availableCars;
      expect(Array.isArray(cars)).toBe(true);
      cars.forEach((c: any) => {
        expect(c.transmission.toUpperCase()).toBe('AUTOMATIC');
      });
    });
  });
});
