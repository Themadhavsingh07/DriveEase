import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().default('driveease_default_jwt_secret_change_in_prod'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters').default('driveease_access_secret_2026'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters').default('driveease_refresh_secret_2026'),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16, 'COOKIE_SECRET must be at least 16 characters').default('driveease_cookie_secret_key'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@driveease.com'),
  SEED_ADMIN_PASSWORD: z.string().default('admin123'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_DriveEaseTestKey123'),
  RAZORPAY_KEY_SECRET: z.string().default('dummy_rzp_secret'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('rzp_webhook_secret_driveease_2026'),
  SMTP_HOST: z.string().default('smtp.ethereal.email'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  EMAIL_FROM: z.string().default('DriveEase Rentals <no-reply@driveease.com>'),
  TIMEZONE: z.string().default('Asia/Kolkata'),
  BUSINESS_TIMEZONE: z.string().default('Asia/Kolkata'),
  TURNAROUND_BUFFER_MINUTES: z.coerce.number().default(0),
  PENDING_HOLD_MINUTES: z.coerce.number().default(10),
  BOOKING_HOLD_MINUTES: z.coerce.number().default(10),
  TAX_RATE: z.coerce.number().default(0.18),
  CANCELLATION_FREE_WINDOW_HOURS: z.coerce.number().default(24),
  CANCELLATION_LATE_FEE_PERCENTAGE: z.coerce.number().default(20),
});

const rawEnv = {
  PORT: process.env.PORT || process.env.SERVER_PORT || '5001',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5433/driveease',
  JWT_SECRET: process.env.JWT_SECRET || 'driveease_default_jwt_secret_change_in_prod',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'driveease_access_secret_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'driveease_refresh_secret_2026',
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'driveease_cookie_secret_key',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || 'admin@driveease.com',
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || 'admin123',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_DriveEaseTestKey123',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'dummy_rzp_secret',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_driveease_2026',
  SMTP_HOST: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.ethereal.email',
  SMTP_PORT: process.env.SMTP_PORT || process.env.EMAIL_PORT || '587',
  SMTP_USER: process.env.SMTP_USER || process.env.EMAIL_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'DriveEase Rentals <no-reply@driveease.com>',
  TIMEZONE: process.env.BUSINESS_TIMEZONE || process.env.TIMEZONE || 'Asia/Kolkata',
  BUSINESS_TIMEZONE: process.env.BUSINESS_TIMEZONE || process.env.TIMEZONE || 'Asia/Kolkata',
  TURNAROUND_BUFFER_MINUTES: process.env.TURNAROUND_BUFFER_MINUTES || '0',
  PENDING_HOLD_MINUTES: process.env.BOOKING_HOLD_MINUTES || process.env.PENDING_HOLD_MINUTES || '10',
  BOOKING_HOLD_MINUTES: process.env.BOOKING_HOLD_MINUTES || process.env.PENDING_HOLD_MINUTES || '10',
  TAX_RATE: process.env.TAX_RATE || '0.18',
  CANCELLATION_FREE_WINDOW_HOURS: process.env.CANCELLATION_FREE_WINDOW_HOURS || '24',
  CANCELLATION_LATE_FEE_PERCENTAGE: process.env.CANCELLATION_LATE_FEE_PERCENTAGE || '20',
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.error('❌ Environment configuration validation failed:', parsed.error.format());
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Fatal: Invalid production environment variables.');
  }
}

// In production, enforce critical secret hygiene
if (process.env.NODE_ENV === 'production') {
  const unsafeDefaults = [
    'driveease_default_jwt_secret_change_in_prod',
    'driveease_access_secret_2026',
    'driveease_refresh_secret_2026',
    'driveease_cookie_secret_key',
  ];

  if (unsafeDefaults.includes(rawEnv.JWT_ACCESS_SECRET) || unsafeDefaults.includes(rawEnv.JWT_REFRESH_SECRET)) {
    console.warn('⚠️ WARNING: Using default development JWT secrets in production is strongly discouraged.');
  }
}

export const ENV = parsed.success ? parsed.data : (rawEnv as any);
