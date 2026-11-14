import prisma from '../config/db';
import { ENV } from '../config/env';
import { AppError } from '../utils/appError';
import {
  parseDateTimeSafe,
  validateRentalInterval,
  formatDateKey,
  getMonthBounds,
  hasIntervalOverlap,
  applyTurnaroundBuffer,
} from '../utils/dateTime';
import { BookingConflictService } from './bookingConflict.service';
import { BookingStatus, Prisma } from '@prisma/client';

export interface CheckAvailabilityParams {
  carId: string;
  pickupDateTime: string | Date;
  returnDateTime: string | Date;
  bufferMinutes?: number;
}

export interface SearchAvailableCarsParams {
  pickupLocation?: string;
  pickupDateTime: string | Date;
  returnDateTime: string | Date;
  category?: string;
  brand?: string;
  fuelType?: string;
  transmission?: string;
  seatingCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export type DayAvailabilityStatus = 'AVAILABLE' | 'PARTIALLY_BOOKED' | 'FULLY_BOOKED' | 'PAST';

export interface CalendarDayAvailability {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0-6 (Sun-Sat)
  status: DayAvailabilityStatus;
  isAvailable: boolean;
  isPast: boolean;
  reservationCount: number;
  occupiedIntervals: {
    pickupDateTime: string;
    returnDateTime: string;
    effectiveReturnDateTime: string;
    status: string;
  }[];
}

export class AvailabilityService {
  /**
   * Checks availability of a single vehicle for a requested date-time interval.
   */
  static async checkAvailability(params: CheckAvailabilityParams) {
    const { carId, bufferMinutes } = params;

    const pickup = parseDateTimeSafe(params.pickupDateTime);
    const dropoff = parseDateTimeSafe(params.returnDateTime);

    // Fetch vehicle specs and rules
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!car || !car.isActive) {
      throw new AppError('Vehicle not found or inactive in the fleet.', 404);
    }

    // Vehicle hardware availability flag (e.g. maintenance deactivation)
    if (!car.isAvailable) {
      return {
        available: false,
        carId,
        pickupDateTime: pickup.toISOString(),
        returnDateTime: dropoff.toISOString(),
        message: 'Vehicle is currently offline for scheduled maintenance.',
        car: {
          id: car.id,
          brand: car.brand,
          model: car.model,
          isAvailable: false,
        },
      };
    }

    // Validate rental interval rules
    const validation = validateRentalInterval(pickup, dropoff, {
      minRentalDays: car.minRentalDays,
      maxRentalDays: car.maxRentalDays,
    });

    if (!validation.isValid) {
      throw new AppError(validation.error || 'Invalid rental period.', 400);
    }

    // Check PostgreSQL database bookings for overlapping reservations
    const { available, conflicts } = await BookingConflictService.isCarAvailable(
      carId,
      pickup,
      dropoff,
      { bufferMinutes }
    );

    if (!available) {
      return {
        available: false,
        carId,
        pickupDateTime: pickup.toISOString(),
        returnDateTime: dropoff.toISOString(),
        rentalDays: validation.rentalDays,
        durationHours: validation.durationHours,
        message: 'Vehicle is already reserved for the selected period.',
        conflicts: conflicts.map((c) => ({
          pickupDateTime: c.pickupDateTime.toISOString(),
          returnDateTime: c.returnDateTime.toISOString(),
          effectiveReturnDateTime: c.effectiveReturnDateTime.toISOString(),
        })),
      };
    }

    return {
      available: true,
      carId,
      pickupDateTime: pickup.toISOString(),
      returnDateTime: dropoff.toISOString(),
      rentalDays: validation.rentalDays,
      durationHours: validation.durationHours,
      message: 'Vehicle is available for the selected period.',
      car: {
        id: car.id,
        brand: car.brand,
        model: car.model,
        dailyPrice: Number(car.dailyPrice),
        category: car.category.name,
      },
    };
  }

  /**
   * Retrieves month-wise calendar availability with day-by-day status breakdown.
   */
  static async getMonthlyAvailability(carId: string, month: number, year: number) {
    if (month < 1 || month > 12) {
      throw new AppError('Month must be between 1 and 12.', 400);
    }
    if (year < 2024 || year > 2035) {
      throw new AppError('Invalid calendar year requested.', 400);
    }

    const car = await prisma.car.findUnique({
      where: { id: carId },
      select: { id: true, brand: true, model: true, isAvailable: true, isActive: true },
    });

    if (!car || !car.isActive) {
      throw new AppError('Vehicle not found.', 404);
    }

    const { start: monthStart, end: monthEnd, daysInMonth } = getMonthBounds(year, month);
    const bufferMinutes = ENV.TURNAROUND_BUFFER_MINUTES;
    const now = new Date();
    const todayKey = formatDateKey(now);

    // Fetch all active/confirmed/valid-pending bookings intersecting this month
    const bookings = await prisma.booking.findMany({
      where: {
        carId,
        OR: [
          { bookingStatus: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE] } },
          {
            bookingStatus: BookingStatus.PENDING,
            OR: [
              { holdExpiresAt: { gt: now } },
              {
                holdExpiresAt: null,
                createdAt: { gt: new Date(now.getTime() - ENV.PENDING_HOLD_MINUTES * 60 * 1000) },
              },
            ],
          },
        ],
        AND: [
          { pickupDateTime: { lte: monthEnd } },
          { returnDateTime: { gte: monthStart } },
        ],
      },
      select: {
        id: true,
        bookingNumber: true,
        pickupDateTime: true,
        returnDateTime: true,
        bookingStatus: true,
      },
      orderBy: { pickupDateTime: 'asc' },
    });

    // Build day-by-day array for this month
    const days: CalendarDayAvailability[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      // Construct day bounds in UTC for consistent overlap calculation
      const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const dayEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = dateKey < todayKey;

      // Find bookings overlapping this calendar day
      const dayBookings = bookings.filter((b) => {
        const effectiveReturn = applyTurnaroundBuffer(b.returnDateTime, bufferMinutes);
        return hasIntervalOverlap(b.pickupDateTime, effectiveReturn, dayStart, dayEnd);
      });

      let status: DayAvailabilityStatus = 'AVAILABLE';

      if (!car.isAvailable) {
        status = 'FULLY_BOOKED';
      } else if (isPast) {
        status = 'PAST';
      } else if (dayBookings.length > 0) {
        // Check if fully booked or partially booked
        // If a booking completely encloses the day (pickup <= dayStart && effectiveReturn >= dayEnd)
        const fullyEnclosed = dayBookings.some((b) => {
          const effectiveReturn = applyTurnaroundBuffer(b.returnDateTime, bufferMinutes);
          return b.pickupDateTime <= dayStart && effectiveReturn >= dayEnd;
        });

        if (fullyEnclosed) {
          status = 'FULLY_BOOKED';
        } else {
          // If total overlapping duration across bookings covers >= 18 hours of the day
          let totalOverlapMs = 0;
          for (const b of dayBookings) {
            const effectiveReturn = applyTurnaroundBuffer(b.returnDateTime, bufferMinutes);
            const overlapStart = Math.max(dayStart.getTime(), b.pickupDateTime.getTime());
            const overlapEnd = Math.min(dayEnd.getTime(), effectiveReturn.getTime());
            if (overlapEnd > overlapStart) {
              totalOverlapMs += overlapEnd - overlapStart;
            }
          }

          if (totalOverlapMs >= 18 * 60 * 60 * 1000) {
            status = 'FULLY_BOOKED';
          } else {
            status = 'PARTIALLY_BOOKED';
          }
        }
      }

      days.push({
        date: dateKey,
        dayOfWeek: dayStart.getUTCDay(),
        status,
        isAvailable: status === 'AVAILABLE' || status === 'PARTIALLY_BOOKED',
        isPast,
        reservationCount: dayBookings.length,
        occupiedIntervals: dayBookings.map((b) => ({
          pickupDateTime: b.pickupDateTime.toISOString(),
          returnDateTime: b.returnDateTime.toISOString(),
          effectiveReturnDateTime: applyTurnaroundBuffer(b.returnDateTime, bufferMinutes).toISOString(),
          status: b.bookingStatus,
        })),
      });
    }

    return {
      carId,
      car: {
        id: car.id,
        brand: car.brand,
        model: car.model,
        isAvailable: car.isAvailable,
      },
      year,
      month,
      daysInMonth,
      calendar: days,
    };
  }

  /**
   * Retrieves availability over an arbitrary date range.
   */
  static async getDateRangeAvailability(carId: string, startDateStr: string, endDateStr: string) {
    const start = parseDateTimeSafe(startDateStr);
    const end = parseDateTimeSafe(endDateStr);

    if (end <= start) {
      throw new AppError('endDate must be after startDate.', 400);
    }

    // Limit range to max 90 days
    const rangeDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (rangeDays > 90) {
      throw new AppError('Requested date range cannot exceed 90 days.', 400);
    }

    const car = await prisma.car.findUnique({
      where: { id: carId },
      select: { id: true, brand: true, model: true, isAvailable: true, isActive: true },
    });

    if (!car || !car.isActive) {
      throw new AppError('Vehicle not found.', 404);
    }

    const bufferMinutes = ENV.TURNAROUND_BUFFER_MINUTES;
    const now = new Date();

    const bookings = await prisma.booking.findMany({
      where: {
        carId,
        OR: [
          { bookingStatus: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE] } },
          {
            bookingStatus: BookingStatus.PENDING,
            OR: [
              { holdExpiresAt: { gt: now } },
              {
                holdExpiresAt: null,
                createdAt: { gt: new Date(now.getTime() - ENV.PENDING_HOLD_MINUTES * 60 * 1000) },
              },
            ],
          },
        ],
        AND: [
          { pickupDateTime: { lte: end } },
          { returnDateTime: { gte: start } },
        ],
      },
      select: {
        id: true,
        bookingNumber: true,
        pickupDateTime: true,
        returnDateTime: true,
        bookingStatus: true,
      },
      orderBy: { pickupDateTime: 'asc' },
    });

    const isAvailableForEntireRange = bookings.length === 0 && car.isAvailable;

    return {
      carId,
      car,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      rangeDays,
      available: isAvailableForEntireRange,
      conflictsCount: bookings.length,
      blockedRanges: bookings.map((b) => ({
        bookingNumber: b.bookingNumber,
        pickupDateTime: b.pickupDateTime.toISOString(),
        returnDateTime: b.returnDateTime.toISOString(),
        effectiveReturnDateTime: applyTurnaroundBuffer(b.returnDateTime, bufferMinutes).toISOString(),
        status: b.bookingStatus,
      })),
    };
  }

  /**
   * Search for available vehicles across the fleet for a requested pickup and return interval.
   */
  static async searchAvailableCars(params: SearchAvailableCarsParams) {
    const pickup = parseDateTimeSafe(params.pickupDateTime);
    const dropoff = parseDateTimeSafe(params.returnDateTime);

    // Validate interval
    const validation = validateRentalInterval(pickup, dropoff);
    if (!validation.isValid) {
      throw new AppError(validation.error || 'Invalid date range.', 400);
    }

    const bufferMinutes = ENV.TURNAROUND_BUFFER_MINUTES;
    const now = new Date();

    // 1. Find all car IDs that are BLOCKED during this interval
    // A car is blocked if it has an active/confirmed/valid-pending booking where:
    // b.pickupDateTime < dropoff && (b.returnDateTime + buffer) > pickup
    const blockingBookings = await prisma.booking.findMany({
      where: {
        OR: [
          { bookingStatus: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE] } },
          {
            bookingStatus: BookingStatus.PENDING,
            OR: [
              { holdExpiresAt: { gt: now } },
              {
                holdExpiresAt: null,
                createdAt: { gt: new Date(now.getTime() - ENV.PENDING_HOLD_MINUTES * 60 * 1000) },
              },
            ],
          },
        ],
      },
      select: {
        carId: true,
        pickupDateTime: true,
        returnDateTime: true,
      },
    });

    // Collect car IDs that overlap with [pickup, dropoff)
    const blockedCarIds = new Set<string>();
    for (const b of blockingBookings) {
      const effectiveReturn = applyTurnaroundBuffer(b.returnDateTime, bufferMinutes);
      if (hasIntervalOverlap(b.pickupDateTime, effectiveReturn, pickup, dropoff)) {
        blockedCarIds.add(b.carId);
      }
    }

    // 2. Build where filter for available cars
    const where: Prisma.CarWhereInput = {
      isActive: true,
      isAvailable: true,
      id: { notIn: Array.from(blockedCarIds) },
    };

    if (params.pickupLocation) {
      where.OR = [
        { pickupLocation: { contains: params.pickupLocation, mode: 'insensitive' } },
        { location: { contains: params.pickupLocation, mode: 'insensitive' } },
      ];
    }

    if (params.category) {
      where.category = {
        name: { equals: params.category, mode: 'insensitive' },
      };
    }

    if (params.brand) {
      where.brand = { equals: params.brand, mode: 'insensitive' };
    }

    if (params.fuelType) {
      where.fuelType = params.fuelType.toUpperCase() as any;
    }

    if (params.transmission) {
      where.transmission = params.transmission.toUpperCase() as any;
    }

    if (params.seatingCapacity) {
      where.seatingCapacity = { gte: params.seatingCapacity };
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.dailyPrice = {};
      if (params.minPrice !== undefined) where.dailyPrice.gte = params.minPrice;
      if (params.maxPrice !== undefined) where.dailyPrice.lte = params.maxPrice;
    }

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 12));
    const skip = (page - 1) * limit;

    let orderBy: Prisma.CarOrderByWithRelationInput = { isFeatured: 'desc' };
    if (params.sortBy === 'price_asc') orderBy = { dailyPrice: 'asc' };
    else if (params.sortBy === 'price_desc') orderBy = { dailyPrice: 'desc' };
    else if (params.sortBy === 'rating') orderBy = { rating: 'desc' };

    const [total, cars] = await Promise.all([
      prisma.car.count({ where }),
      prisma.car.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { order: 'asc' } },
        },
      }),
    ]);

    const formattedCars = cars.map((car) => ({
      ...car,
      dailyPrice: Number(car.dailyPrice),
      pricePerDay: Number(car.dailyPrice),
      securityDeposit: Number(car.securityDeposit),
      category: car.category.name,
      categorySlug: car.category.slug,
      isAvailableForInterval: true,
      images: car.images.map((img) => ({
        id: img.id,
        url: img.url,
        imageUrl: img.url,
        isPrimary: img.isPrimary,
        caption: img.caption,
      })),
    }));

    return {
      availableCars: formattedCars,
      cars: formattedCars,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      searchInterval: {
        pickupDateTime: pickup.toISOString(),
        returnDateTime: dropoff.toISOString(),
        rentalDays: validation.rentalDays,
        durationHours: validation.durationHours,
      },
    };
  }
}
