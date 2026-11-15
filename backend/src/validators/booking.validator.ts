import { z } from 'zod';

const isoDateTimeSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Must be a valid date/time string' }
);

export const calculatePriceSchema = z.object({
  carId: z.string().uuid('Valid Car ID is required'),
  pickupDateTime: isoDateTimeSchema,
  returnDateTime: isoDateTimeSchema,
  insuranceType: z.enum(['BASIC', 'PREMIUM', 'COMPREHENSIVE']).default('BASIC'),
  serviceIds: z.array(z.string().uuid()).nullable().optional().transform((v) => v || []),
  couponCode: z.string().nullable().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  subtotal: z.number().positive('Subtotal must be positive'),
});

export const checkAvailabilitySchema = z.object({
  carId: z.string().uuid('Valid Car ID is required'),
  pickupDateTime: isoDateTimeSchema,
  returnDateTime: isoDateTimeSchema,
});

export const createBookingSchema = z.object({
  carId: z.string().uuid('Valid Car ID is required'),
  pickupDateTime: isoDateTimeSchema,
  returnDateTime: isoDateTimeSchema,
  pickupLocation: z.string().min(1, 'Pickup location is required'),
  dropoffLocation: z.string().min(1, 'Drop-off location is required'),
  insuranceType: z.enum(['BASIC', 'PREMIUM', 'COMPREHENSIVE']).default('BASIC'),
  serviceIds: z.array(z.string().uuid()).nullable().optional().transform((v) => v || []),
  couponCode: z.string().nullable().optional(),
  paymentMethod: z.enum(['RAZORPAY', 'CASH_ON_PICKUP', 'CREDIT_CARD']).default('RAZORPAY'),
  driverName: z.string().min(2, 'Driver name is required'),
  driverEmail: z.string().email('Valid driver email is required'),
  driverPhone: z.string().min(5, 'Driver phone is required'),
  driverLicenseNumber: z.string().min(3, "Driver's license number is required"),
  notes: z.string().nullable().optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required'),
});
