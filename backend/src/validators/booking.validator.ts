import { z } from 'zod';

export const calculatePriceSchema = z.object({
  carId: z.string().uuid('Valid Car ID is required'),
  pickupDateTime: z.string().datetime({ message: 'Pickup date must be a valid ISO string' }),
  returnDateTime: z.string().datetime({ message: 'Return date must be a valid ISO string' }),
  insuranceType: z.enum(['BASIC', 'PREMIUM', 'COMPREHENSIVE']).default('BASIC'),
  serviceIds: z.array(z.string().uuid()).default([]),
  couponCode: z.string().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  subtotal: z.number().positive('Subtotal must be positive'),
});

export const checkAvailabilitySchema = z.object({
  carId: z.string().uuid('Valid Car ID is required'),
  pickupDateTime: z.string().datetime(),
  returnDateTime: z.string().datetime(),
});

export const createBookingSchema = z.object({
  carId: z.string().uuid('Valid Car ID is required'),
  pickupDateTime: z.string().datetime(),
  returnDateTime: z.string().datetime(),
  pickupLocation: z.string().min(2, 'Pickup location is required'),
  dropoffLocation: z.string().min(2, 'Drop-off location is required'),
  insuranceType: z.enum(['BASIC', 'PREMIUM', 'COMPREHENSIVE']).default('BASIC'),
  serviceIds: z.array(z.string().uuid()).default([]),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['RAZORPAY', 'CASH_ON_PICKUP', 'CREDIT_CARD']).default('RAZORPAY'),
  driverName: z.string().min(2, 'Driver name is required'),
  driverEmail: z.string().email('Driver email is required'),
  driverPhone: z.string().min(8, 'Driver phone is required'),
  driverLicenseNumber: z.string().min(4, "Driver's license number is required"),
  notes: z.string().optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required'),
});
