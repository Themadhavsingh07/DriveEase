import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // Max 25 auth requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
    errors: [],
  },
  skip: () => process.env.NODE_ENV === 'test',
});

export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40, // Max 40 payment attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many payment requests from this IP, please try again later.',
    errors: [],
  },
  skip: () => process.env.NODE_ENV === 'test',
});

export const webhookRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 150, // Webhook calls from payment providers
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Webhook rate limit exceeded.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please slow down.',
    errors: [],
  },
  skip: () => process.env.NODE_ENV === 'test',
});
