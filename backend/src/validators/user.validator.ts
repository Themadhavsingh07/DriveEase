import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters').optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  phone: z.string().min(7).optional().or(z.literal('')),
  avatar: z.string().url('Avatar must be a valid image URL').optional().or(z.literal('')),
  drivingLicenseNumber: z.string().optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'New password must contain at least one number'),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive boolean flag is required' }),
});
