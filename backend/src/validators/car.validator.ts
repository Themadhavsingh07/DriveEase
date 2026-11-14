import { z } from 'zod';

export const carQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  seats: z.coerce.number().int().optional(),
  minSeats: z.coerce.number().int().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  availability: z.enum(['all', 'available', 'reserved']).optional(),
  sortBy: z.enum(['recommended', 'price_asc', 'price_desc', 'newest', 'rating', 'popular', 'pricePerDay']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const createCarSchema = z.object({
  brand: z.string().min(2, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  name: z.string().optional(),
  year: z.number().int().min(2010).max(2030),
  categoryId: z.string().uuid('Invalid Category ID'),
  transmission: z.enum(['AUTOMATIC', 'MANUAL', 'Automatic', 'Manual']).transform((val) => val.toUpperCase() as 'AUTOMATIC' | 'MANUAL'),
  fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG', 'Petrol', 'Diesel', 'Electric', 'Hybrid', 'Cng']).transform((val) => val.toUpperCase() as 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'CNG'),
  seatingCapacity: z.number().int().min(2).max(12),
  mileage: z.string().min(1),
  doors: z.number().int().min(2).max(6).default(4),
  numberOfDoors: z.number().int().optional(),
  luggageCapacity: z.number().int().min(1).max(8).default(3),
  engineCapacity: z.string().optional(),
  horsepower: z.number().int().optional(),
  dailyPrice: z.number().positive('Daily price must be positive'),
  pricePerDay: z.number().optional(),
  securityDeposit: z.number().nonnegative().default(3000),
  minRentalDays: z.number().int().min(1).default(1),
  maxRentalDays: z.number().int().min(1).default(30),
  pickupLocation: z.string().min(3).default('Downtown Hub, Mumbai'),
  dropoffLocation: z.string().min(3).default('Downtown Hub, Mumbai'),
  location: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  isAvailable: z.boolean().default(true),
  availabilityStatus: z.string().default('Available'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z
    .array(
      z.object({
        url: z.string().url('Image must be a valid URL'),
        imageUrl: z.string().url().optional(),
        publicId: z.string().optional(),
        isPrimary: z.boolean().default(false),
        caption: z.string().optional(),
        order: z.number().int().default(0),
        displayOrder: z.number().int().optional(),
      })
    )
    .min(1, 'At least one image is required'),
});

export const updateCarSchema = createCarSchema.partial();
