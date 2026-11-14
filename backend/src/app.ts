import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env';
import apiRouter from './routes';
import { errorHandler, notFoundHandler } from './middleware/error';
import { apiRateLimiter } from './middleware/rateLimit.middleware';

export const createApp = () => {
  const app = express();

  // Trust reverse proxy (essential for Render / Vercel / Railway / AWS ALB rate limiting & secure cookies)
  app.set('trust proxy', 1);

  // Production Security Headers via Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://checkout.razorpay.com'],
          frameSrc: ["'self'", 'https://api.razorpay.com'],
          connectSrc: ["'self'", 'https://api.razorpay.com', 'https://lumberjack.razorpay.com'],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // CORS Configuration supporting production domain and localhost
  const allowedOrigins = [
    ENV.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          origin.endsWith('.onrender.com')
        ) {
          return callback(null, true);
        }
        return callback(new Error(`CORS origin ${origin} not allowed.`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Razorpay-Signature'],
      exposedHeaders: ['set-cookie'],
    })
  );

  // Body and Cookie Parsers (preserving rawBody for payment webhook signature validation)
  app.use(
    express.json({
      limit: '10mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(ENV.COOKIE_SECRET));

  // Global Rate Limiter
  app.use('/api', apiRateLimiter);

  // Request Logging
  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // Base API Routes: Primary /api/v1 prefix & /api compatibility fallback
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
