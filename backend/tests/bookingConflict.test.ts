import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../src/config/db';
import { BookingConflictService } from '../src/services/bookingConflict.service';
import { hasIntervalOverlap, applyTurnaroundBuffer } from '../src/utils/dateTime';
import { BookingStatus } from '@prisma/client';

describe('🛡️ Booking Conflict Engine & Concurrency Guard Tests', () => {
  let carAId = '';
  let carBId = '';
  let customerUserId = '';
  const testBookingIds: string[] = [];

  beforeAll(async () => {
    await prisma.$connect();

    // Fetch two active test cars
    const cars = await prisma.car.findMany({
      where: { isActive: true },
      take: 2,
    });
    expect(cars.length).toBeGreaterThanOrEqual(2);
    carAId = cars[0].id;
    carBId = cars[1].id;

    // Fetch customer user
    const customer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
    });
    expect(customer).toBeDefined();
    customerUserId = customer!.id;
  });

  afterAll(async () => {
    // Clean up created test bookings
    if (testBookingIds.length > 0) {
      await prisma.booking.deleteMany({
        where: { id: { in: testBookingIds } },
      });
    }
    await prisma.$disconnect();
  });

  describe('1. Half-Open Interval Overlap Logic [pickup, return)', () => {
    const t1 = new Date('2026-11-20T10:00:00Z');
    const t2 = new Date('2026-11-22T10:00:00Z');

    it('should detect overlap when requested start is within existing reservation', () => {
      const reqStart = new Date('2026-11-21T10:00:00Z');
      const reqEnd = new Date('2026-11-24T10:00:00Z');
      expect(hasIntervalOverlap(t1, t2, reqStart, reqEnd)).toBe(true);
    });

    it('should NOT detect overlap when requested start exactly equals existing return (half-open boundary)', () => {
      const reqStart = new Date('2026-11-22T10:00:00Z');
      const reqEnd = new Date('2026-11-25T10:00:00Z');
      expect(hasIntervalOverlap(t1, t2, reqStart, reqEnd)).toBe(false);
    });

    it('should NOT detect overlap when requested return exactly equals existing pickup', () => {
      const reqStart = new Date('2026-11-18T10:00:00Z');
      const reqEnd = new Date('2026-11-20T10:00:00Z');
      expect(hasIntervalOverlap(t1, t2, reqStart, reqEnd)).toBe(false);
    });

    it('should respect turnaround buffer when calculating effective return', () => {
      // 120 minutes buffer
      const effectiveReturn = applyTurnaroundBuffer(t2, 120); // 12:00:00Z
      const reqStart = new Date('2026-11-22T11:00:00Z'); // Inside buffer
      const reqEnd = new Date('2026-11-25T10:00:00Z');

      expect(hasIntervalOverlap(t1, effectiveReturn, reqStart, reqEnd)).toBe(true);
    });
  });

  describe('2. Booking Status Blocking Rules in Database', () => {
    it('CONFIRMED booking should block overlapping intervals', async () => {
      const pickup = new Date('2026-12-10T10:00:00Z');
      const returnDate = new Date('2026-12-13T10:00:00Z');

      const booking = await prisma.booking.create({
        data: {
          bookingNumber: `TEST-CONF-${Date.now()}`,
          userId: customerUserId,
          carId: carAId,
          pickupLocation: 'Hub A',
          dropoffLocation: 'Hub A',
          pickupDateTime: pickup,
          returnDateTime: returnDate,
          rentalDays: 3,
          dailyPrice: 2000,
          basePrice: 6000,
          totalAmount: 7080,
          bookingStatus: BookingStatus.CONFIRMED,
          driverName: 'Test Driver',
          driverEmail: 'test@driver.com',
          driverPhone: '+91 9999999999',
          driverLicenseNumber: 'DL-999',
        },
      });
      testBookingIds.push(booking.id);

      // Overlapping query: Dec 11 to Dec 14
      const res = await BookingConflictService.isCarAvailable(
        carAId,
        new Date('2026-12-11T10:00:00Z'),
        new Date('2026-12-14T10:00:00Z')
      );

      expect(res.available).toBe(false);
      expect(res.conflicts.length).toBeGreaterThan(0);
      expect(res.conflicts[0].id).toBe(booking.id);
    });

    it('CANCELLED booking should NOT block overlapping intervals', async () => {
      const pickup = new Date('2026-12-15T10:00:00Z');
      const returnDate = new Date('2026-12-18T10:00:00Z');

      const cancelledBooking = await prisma.booking.create({
        data: {
          bookingNumber: `TEST-CANC-${Date.now()}`,
          userId: customerUserId,
          carId: carAId,
          pickupLocation: 'Hub A',
          dropoffLocation: 'Hub A',
          pickupDateTime: pickup,
          returnDateTime: returnDate,
          rentalDays: 3,
          dailyPrice: 2000,
          basePrice: 6000,
          totalAmount: 7080,
          bookingStatus: BookingStatus.CANCELLED,
          driverName: 'Test Driver',
          driverEmail: 'test@driver.com',
          driverPhone: '+91 9999999999',
          driverLicenseNumber: 'DL-999',
        },
      });
      testBookingIds.push(cancelledBooking.id);

      const res = await BookingConflictService.isCarAvailable(carAId, pickup, returnDate);
      expect(res.available).toBe(true);
    });

    it('COMPLETED booking should NOT block overlapping intervals', async () => {
      const pickup = new Date('2026-12-20T10:00:00Z');
      const returnDate = new Date('2026-12-23T10:00:00Z');

      const completedBooking = await prisma.booking.create({
        data: {
          bookingNumber: `TEST-COMP-${Date.now()}`,
          userId: customerUserId,
          carId: carAId,
          pickupLocation: 'Hub A',
          dropoffLocation: 'Hub A',
          pickupDateTime: pickup,
          returnDateTime: returnDate,
          rentalDays: 3,
          dailyPrice: 2000,
          basePrice: 6000,
          totalAmount: 7080,
          bookingStatus: BookingStatus.COMPLETED,
          driverName: 'Test Driver',
          driverEmail: 'test@driver.com',
          driverPhone: '+91 9999999999',
          driverLicenseNumber: 'DL-999',
        },
      });
      testBookingIds.push(completedBooking.id);

      const res = await BookingConflictService.isCarAvailable(carAId, pickup, returnDate);
      expect(res.available).toBe(true);
    });

    it('EXPIRED pending reservation hold should NOT block availability', async () => {
      const pickup = new Date('2026-12-25T10:00:00Z');
      const returnDate = new Date('2026-12-28T10:00:00Z');

      // Hold expired 1 hour ago
      const expiredHold = new Date(Date.now() - 60 * 60 * 1000);

      const expiredBooking = await prisma.booking.create({
        data: {
          bookingNumber: `TEST-EXP-${Date.now()}`,
          userId: customerUserId,
          carId: carAId,
          pickupLocation: 'Hub A',
          dropoffLocation: 'Hub A',
          pickupDateTime: pickup,
          returnDateTime: returnDate,
          holdExpiresAt: expiredHold,
          rentalDays: 3,
          dailyPrice: 2000,
          basePrice: 6000,
          totalAmount: 7080,
          bookingStatus: BookingStatus.PENDING,
          driverName: 'Test Driver',
          driverEmail: 'test@driver.com',
          driverPhone: '+91 9999999999',
          driverLicenseNumber: 'DL-999',
        },
      });
      testBookingIds.push(expiredBooking.id);

      const res = await BookingConflictService.isCarAvailable(carAId, pickup, returnDate);
      expect(res.available).toBe(true);
    });

    it('ACTIVE pending reservation hold (unexpired) SHOULD block availability', async () => {
      const pickup = new Date('2027-01-05T10:00:00Z');
      const returnDate = new Date('2027-01-08T10:00:00Z');

      // Hold expires 1 hour in the future
      const futureHold = new Date(Date.now() + 60 * 60 * 1000);

      const activePendingBooking = await prisma.booking.create({
        data: {
          bookingNumber: `TEST-ACTP-${Date.now()}`,
          userId: customerUserId,
          carId: carAId,
          pickupLocation: 'Hub A',
          dropoffLocation: 'Hub A',
          pickupDateTime: pickup,
          returnDateTime: returnDate,
          holdExpiresAt: futureHold,
          rentalDays: 3,
          dailyPrice: 2000,
          basePrice: 6000,
          totalAmount: 7080,
          bookingStatus: BookingStatus.PENDING,
          driverName: 'Test Driver',
          driverEmail: 'test@driver.com',
          driverPhone: '+91 9999999999',
          driverLicenseNumber: 'DL-999',
        },
      });
      testBookingIds.push(activePendingBooking.id);

      const res = await BookingConflictService.isCarAvailable(carAId, pickup, returnDate);
      expect(res.available).toBe(false);
    });
  });

  describe('3. Concurrency Protection & Advisory Lock Guard (assertCarAvailable)', () => {
    it('assertCarAvailable should pass when interval is open', async () => {
      const pickup = new Date('2027-02-01T10:00:00Z');
      const returnDate = new Date('2027-02-04T10:00:00Z');

      await prisma.$transaction(async (tx) => {
        await expect(
          BookingConflictService.assertCarAvailable(tx, {
            carId: carAId,
            pickupDateTime: pickup,
            returnDateTime: returnDate,
          })
        ).resolves.toBeUndefined();
      });
    });

    it('assertCarAvailable should throw 409 Conflict when interval has a confirmed booking', async () => {
      const pickup = new Date('2027-02-10T10:00:00Z');
      const returnDate = new Date('2027-02-14T10:00:00Z');

      const existingBooking = await prisma.booking.create({
        data: {
          bookingNumber: `TEST-CONF-LOCK-${Date.now()}`,
          userId: customerUserId,
          carId: carAId,
          pickupLocation: 'Hub A',
          dropoffLocation: 'Hub A',
          pickupDateTime: pickup,
          returnDateTime: returnDate,
          rentalDays: 4,
          dailyPrice: 2500,
          basePrice: 10000,
          totalAmount: 11800,
          bookingStatus: BookingStatus.CONFIRMED,
          driverName: 'Advisory Tester',
          driverEmail: 'advisory@test.com',
          driverPhone: '+91 9999999999',
          driverLicenseNumber: 'DL-LOCK',
        },
      });
      testBookingIds.push(existingBooking.id);

      await prisma.$transaction(async (tx) => {
        await expect(
          BookingConflictService.assertCarAvailable(tx, {
            carId: carAId,
            pickupDateTime: new Date('2027-02-12T10:00:00Z'),
            returnDateTime: new Date('2027-02-16T10:00:00Z'),
          })
        ).rejects.toThrow(/already reserved/i);
      });
    });

    it('Two simultaneous overlapping reservation attempts on the SAME vehicle should result in only ONE winner', async () => {
      const pickup = new Date('2027-03-01T10:00:00Z');
      const returnDate = new Date('2027-03-05T10:00:00Z');

      // Attempt two concurrent transactions attempting to book the same vehicle over the same dates
      const tryBook = async (tag: string) => {
        return prisma.$transaction(async (tx) => {
          // Advisory lock serializes execution for carAId
          await BookingConflictService.assertCarAvailable(tx, {
            carId: carAId,
            pickupDateTime: pickup,
            returnDateTime: returnDate,
          });

          // Insert confirmed booking inside transaction
          const created = await tx.booking.create({
            data: {
              bookingNumber: `CONC-${tag}-${Date.now()}`,
              userId: customerUserId,
              carId: carAId,
              pickupLocation: 'Hub A',
              dropoffLocation: 'Hub A',
              pickupDateTime: pickup,
              returnDateTime: returnDate,
              rentalDays: 4,
              dailyPrice: 2000,
              basePrice: 8000,
              totalAmount: 9440,
              bookingStatus: BookingStatus.CONFIRMED,
              driverName: `Concurrent Driver ${tag}`,
              driverEmail: `driver.${tag}@test.com`,
              driverPhone: '+91 9999999999',
              driverLicenseNumber: 'DL-CONC',
            },
          });
          return created;
        });
      };

      const results = await Promise.allSettled([tryBook('A'), tryBook('B')]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      // Exactly ONE transaction must succeed, and the other MUST be rejected with 409
      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);

      // Track created booking for cleanup
      if (fulfilled[0].status === 'fulfilled') {
        testBookingIds.push((fulfilled[0] as PromiseFulfilledResult<any>).value.id);
      }
    });

    it('Reservations for two DIFFERENT vehicles at the same time should both succeed without blocking', async () => {
      const pickup = new Date('2027-04-01T10:00:00Z');
      const returnDate = new Date('2027-04-05T10:00:00Z');

      const bookCar = async (carId: string, tag: string) => {
        return prisma.$transaction(async (tx) => {
          await BookingConflictService.assertCarAvailable(tx, {
            carId,
            pickupDateTime: pickup,
            returnDateTime: returnDate,
          });

          return tx.booking.create({
            data: {
              bookingNumber: `DIFF-${tag}-${Date.now()}`,
              userId: customerUserId,
              carId,
              pickupLocation: 'Hub A',
              dropoffLocation: 'Hub A',
              pickupDateTime: pickup,
              returnDateTime: returnDate,
              rentalDays: 4,
              dailyPrice: 2000,
              basePrice: 8000,
              totalAmount: 9440,
              bookingStatus: BookingStatus.CONFIRMED,
              driverName: `Driver ${tag}`,
              driverEmail: `driver.${tag}@test.com`,
              driverPhone: '+91 9999999999',
              driverLicenseNumber: 'DL-DIFF',
            },
          });
        });
      };

      const [resA, resB] = await Promise.all([
        bookCar(carAId, 'CarA'),
        bookCar(carBId, 'CarB'),
      ]);

      expect(resA.id).toBeDefined();
      expect(resB.id).toBeDefined();
      testBookingIds.push(resA.id, resB.id);
    });
  });
});
