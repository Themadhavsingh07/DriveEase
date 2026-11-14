import { z } from 'zod';

export const checkAvailabilitySchema = z.object({
  carId: z.string().min(1, 'Car ID is required'),
  pickupDateTime: z.string().min(1, 'Pickup date and time is required'),
  returnDateTime: z.string().min(1, 'Return date and time is required'),
  bufferMinutes: z.coerce.number().int().nonnegative().optional(),
});

export const monthlyCalendarSchema = z.object({
  month: z.coerce.number().int().min(1, 'Month must be between 1 and 12').max(12, 'Month must be between 1 and 12'),
  year: z.coerce.number().int().min(2024).max(2035),
});

export const dateRangeQuerySchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

export const searchAvailableCarsSchema = z.object({
  pickupLocation: z.string().optional(),
  pickupDateTime: z.string().min(1, 'Pickup date and time is required'),
  returnDateTime: z.string().min(1, 'Return date and time is required'),
  category: z.string().optional(),
  brand: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  seatingCapacity: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sortBy: z.enum(['recommended', 'price_asc', 'price_desc', 'rating']).optional(),
});
