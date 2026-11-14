import { ENV } from '../config/env';

export interface RentalValidationOptions {
  minHours?: number;
  maxDays?: number;
  minRentalDays?: number;
  maxRentalDays?: number;
  nowBufferMinutes?: number;
}

export interface DateInterval {
  start: Date;
  end: Date;
}

/**
 * Parses an input string (ISO string, date-only "YYYY-MM-DD", or full datetime)
 * safely into a UTC Date object.
 *
 * For date-only strings (e.g. "2026-11-20"), applies explicit local time or business default
 * to prevent accidental UTC-midnight shift bugs across local calendar days.
 */
export const parseDateTimeSafe = (
  input: string | Date | number,
  defaultTime = '10:00:00'
): Date => {
  if (input instanceof Date) {
    if (isNaN(input.getTime())) throw new Error('Invalid Date object');
    return input;
  }

  if (typeof input === 'number') {
    const d = new Date(input);
    if (isNaN(d.getTime())) throw new Error('Invalid timestamp number');
    return d;
  }

  const str = String(input).trim();
  if (!str) throw new Error('Empty date string provided');

  // If date-only format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    // Construct local ISO representation with business timezone or explicit time
    // For India Standard Time (+05:30) or UTC based on ENV
    const tzOffset = ENV.TIMEZONE === 'Asia/Kolkata' ? '+05:30' : 'Z';
    const constructed = `${str}T${defaultTime}${tzOffset === 'Z' ? 'Z' : tzOffset}`;
    const parsed = new Date(constructed);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Unable to parse invalid date string: ${str}`);
  }
  return parsed;
};

/**
 * Checks whether two half-open date-time intervals [startA, endA) and [startB, endB) overlap.
 * Overlap condition: startA < endB && endA > startB
 */
export const hasIntervalOverlap = (
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean => {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
};

/**
 * Adds turnaround buffer (in minutes) to an interval end date.
 */
export const applyTurnaroundBuffer = (date: Date, bufferMinutes: number): Date => {
  if (!bufferMinutes || bufferMinutes <= 0) return date;
  return new Date(date.getTime() + bufferMinutes * 60 * 1000);
};

/**
 * Calculates rental duration in precise decimal hours and ceiling rental days.
 */
export const calculateRentalDuration = (
  pickup: Date,
  dropoff: Date
): { durationHours: number; rentalDays: number } => {
  const diffMs = dropoff.getTime() - pickup.getTime();
  if (diffMs <= 0) {
    return { durationHours: 0, rentalDays: 0 };
  }
  const durationHours = diffMs / (1000 * 60 * 60);
  const rentalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  return { durationHours, rentalDays };
};

/**
 * Validates pickup and dropoff dates against system and vehicle business rules.
 */
export const validateRentalInterval = (
  pickup: Date,
  dropoff: Date,
  options: RentalValidationOptions = {}
): { isValid: boolean; error?: string; rentalDays: number; durationHours: number } => {
  const {
    minHours = 1,
    maxDays = 30,
    minRentalDays = 1,
    maxRentalDays = 30,
    nowBufferMinutes = 15, // 15 mins grace period for network latency
  } = options;

  const now = new Date();
  const pastThreshold = new Date(now.getTime() - nowBufferMinutes * 60 * 1000);

  // 1. Pickup date cannot be in the past
  if (pickup < pastThreshold) {
    return {
      isValid: false,
      error: 'Pickup date and time cannot be in the past.',
      rentalDays: 0,
      durationHours: 0,
    };
  }

  // 2. Return date must be after pickup date
  if (dropoff <= pickup) {
    return {
      isValid: false,
      error: 'Return date and time must be after pickup date and time.',
      rentalDays: 0,
      durationHours: 0,
    };
  }

  const { durationHours, rentalDays } = calculateRentalDuration(pickup, dropoff);

  // 3. Minimum duration in hours (e.g. min 1 hour for same-day rentals)
  if (durationHours < minHours) {
    return {
      isValid: false,
      error: `Minimum rental duration is ${minHours} hour(s).`,
      rentalDays,
      durationHours,
    };
  }

  // 4. Vehicle-specific minimum rental days
  const effectiveMinDays = Math.max(minRentalDays, 1);
  if (rentalDays < effectiveMinDays) {
    return {
      isValid: false,
      error: `This vehicle requires a minimum reservation of ${effectiveMinDays} day(s).`,
      rentalDays,
      durationHours,
    };
  }

  // 5. Vehicle-specific maximum rental days
  const effectiveMaxDays = Math.min(maxRentalDays, maxDays);
  if (rentalDays > effectiveMaxDays) {
    return {
      isValid: false,
      error: `This vehicle allows a maximum reservation of ${effectiveMaxDays} day(s).`,
      rentalDays,
      durationHours,
    };
  }

  return {
    isValid: true,
    rentalDays,
    durationHours,
  };
};

/**
 * Formats a Date object to a calendar date string (YYYY-MM-DD) in the configured business timezone.
 */
export const formatDateKey = (date: Date): string => {
  // Use Intl.DateTimeFormat with configured timezone (e.g. Asia/Kolkata)
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: ENV.TIMEZONE || 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
};

/**
 * Returns the month range (UTC start and end of month) for a given year & month (1-indexed month).
 */
export const getMonthBounds = (
  year: number,
  month: number
): { start: Date; end: Date; daysInMonth: number } => {
  // Note: month is 1-12
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  // End of month is 0th day of next month at 23:59:59.999
  const nextMonthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const end = new Date(nextMonthStart.getTime() - 1);
  const daysInMonth = new Date(year, month, 0).getDate();

  return { start, end, daysInMonth };
};
