import { Prisma, BookingStatus } from '@prisma/client';
import prisma from '../config/db';
import { ENV } from '../config/env';
import { AppError } from '../utils/appError';
import { hasIntervalOverlap, applyTurnaroundBuffer } from '../utils/dateTime';

export interface BookingConflictCheckOptions {
  excludeBookingId?: string;
  bufferMinutes?: number;
  tx?: Prisma.TransactionClient;
}

export interface AssertCarAvailableParams {
  carId: string;
  pickupDateTime: Date;
  returnDateTime: Date;
  excludeBookingId?: string;
  bufferMinutes?: number;
}

export interface ConflictingBookingResult {
  id: string;
  bookingNumber: string;
  pickupDateTime: Date;
  returnDateTime: Date;
  effectiveReturnDateTime: Date;
  bookingStatus: BookingStatus;
  holdExpiresAt?: Date | null;
}

export class BookingConflictService {
  /**
   * Generates Prisma WHERE criteria for reservations that could block a car.
   *
   * Blocking rules:
   * - CONFIRMED: Always blocks
   * - ACTIVE: Always blocks
   * - PENDING: Blocks ONLY when hold has not expired
   * - COMPLETED / CANCELLED: Never blocks
   */
  private static getBlockingCriteria(carId: string, excludeBookingId?: string): Prisma.BookingWhereInput {
    const now = new Date();
    // Default pending hold threshold fallback
    const holdFallbackThreshold = new Date(now.getTime() - ENV.PENDING_HOLD_MINUTES * 60 * 1000);

    return {
      carId,
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      OR: [
        // 1. Confirmed or Active reservations always block
        {
          bookingStatus: {
            in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE],
          },
        },
        // 2. Pending reservations with active explicit hold
        {
          bookingStatus: BookingStatus.PENDING,
          holdExpiresAt: {
            gt: now,
          },
        },
        // 3. Pending reservations without explicit holdExpiresAt, but created within grace period
        {
          bookingStatus: BookingStatus.PENDING,
          holdExpiresAt: null,
          createdAt: {
            gt: holdFallbackThreshold,
          },
        },
      ],
    };
  }

  /**
   * Queries existing blocking bookings and detects any half-open [pickup, return + buffer) overlap.
   */
  static async findConflictingBookings(
    carId: string,
    pickupDateTime: Date,
    returnDateTime: Date,
    options: BookingConflictCheckOptions = {}
  ): Promise<ConflictingBookingResult[]> {
    const client = options.tx || prisma;
    const bufferMinutes = options.bufferMinutes ?? ENV.TURNAROUND_BUFFER_MINUTES;

    // Fetch potentially overlapping bookings for this vehicle
    const candidates = await client.booking.findMany({
      where: this.getBlockingCriteria(carId, options.excludeBookingId),
      select: {
        id: true,
        bookingNumber: true,
        pickupDateTime: true,
        returnDateTime: true,
        bookingStatus: true,
        holdExpiresAt: true,
      },
      orderBy: { pickupDateTime: 'asc' },
    });

    const conflicts: ConflictingBookingResult[] = [];

    for (const b of candidates) {
      const effectiveReturn = applyTurnaroundBuffer(b.returnDateTime, bufferMinutes);
      // Half-open interval overlap: existingPickup < requestedReturn && effectiveReturn > requestedPickup
      if (hasIntervalOverlap(b.pickupDateTime, effectiveReturn, pickupDateTime, returnDateTime)) {
        conflicts.push({
          id: b.id,
          bookingNumber: b.bookingNumber,
          pickupDateTime: b.pickupDateTime,
          returnDateTime: b.returnDateTime,
          effectiveReturnDateTime: effectiveReturn,
          bookingStatus: b.bookingStatus,
          holdExpiresAt: b.holdExpiresAt,
        });
      }
    }

    return conflicts;
  }

  /**
   * TRANSACTION-SAFE RESERVATION GUARD
   *
   * Executes inside a PostgreSQL transaction:
   * 1. Acquires a PostgreSQL transaction-level advisory lock scoped to carId.
   * 2. Reads existing active/confirmed/valid-pending bookings.
   * 3. Checks for overlapping intervals with turnaround buffer.
   * 4. Throws 409 Conflict if occupied; allows if available.
   * 5. Advisory lock is automatically released when the transaction ends (commit or rollback).
   */
  static async assertCarAvailable(
    tx: Prisma.TransactionClient,
    params: AssertCarAvailableParams
  ): Promise<void> {
    const { carId, pickupDateTime, returnDateTime, excludeBookingId, bufferMinutes } = params;

    // 1. Acquire transaction-level advisory lock on this carId
    // hashtext() in PostgreSQL deterministically converts a string to a 32-bit integer, cast to bigint
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${carId})::bigint);`;

    // 2. Query vehicle to ensure it exists and is operational
    const car = await tx.car.findUnique({
      where: { id: carId },
      select: { id: true, isAvailable: true, isActive: true, brand: true, model: true },
    });

    if (!car || !car.isActive) {
      throw new AppError('Vehicle was not found or has been decommissioned.', 404);
    }

    if (!car.isAvailable) {
      throw new AppError(
        `${car.brand} ${car.model} is currently marked unavailable or undergoing maintenance.`,
        409
      );
    }

    // 3. Find any conflicting reservations within the transaction
    const conflicts = await this.findConflictingBookings(carId, pickupDateTime, returnDateTime, {
      excludeBookingId,
      bufferMinutes,
      tx,
    });

    if (conflicts.length > 0) {
      const first = conflicts[0];
      throw new AppError(
        `Vehicle is already reserved from ${first.pickupDateTime.toISOString()} to ${first.returnDateTime.toISOString()}.`,
        409,
        conflicts
      );
    }
  }

  /**
   * Read-only availability check (for queries and UI checks, without advisory locking).
   */
  static async isCarAvailable(
    carId: string,
    pickupDateTime: Date,
    returnDateTime: Date,
    options: BookingConflictCheckOptions = {}
  ): Promise<{ available: boolean; conflicts: ConflictingBookingResult[] }> {
    const conflicts = await this.findConflictingBookings(
      carId,
      pickupDateTime,
      returnDateTime,
      options
    );
    return {
      available: conflicts.length === 0,
      conflicts,
    };
  }
}
