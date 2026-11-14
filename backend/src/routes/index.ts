import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import carRoutes from './car.routes';
import availabilityRoutes from './availability.routes';
import pricingRoutes from './pricing.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import reviewRoutes from './review.routes';
import adminRoutes from './admin.routes';
import dashboardRoutes from './dashboard.routes';
import { getCategories } from '../controllers/car.controller';
import prisma from '../config/db';
import { ENV } from '../config/env';

const apiRouter = Router();

// Phase 3 Core Routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/cars', carRoutes);
apiRouter.get('/categories', getCategories);
apiRouter.use('/admin', adminRoutes);

// Existing & Phase 6 Feature Routes
apiRouter.use('/dashboard', dashboardRoutes);

// Existing Feature Routes
apiRouter.use('/', availabilityRoutes);
apiRouter.use('/', pricingRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/', reviewRoutes);

/**
 * Production Health & Diagnostic Endpoint
 * GET /api/v1/health or /api/health
 */
apiRouter.get('/health', async (_req, res) => {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1;`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (error) {
    dbStatus = 'disconnected';
  }

  const isHealthy = dbStatus === 'healthy';
  const memory = process.memoryUsage();

  const healthData = {
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'unhealthy',
    message: isHealthy ? 'DriveEase API is fully operational' : 'Database connectivity issue detected',
    environment: ENV.NODE_ENV,
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      database: dbStatus,
      databaseLatencyMs: dbLatencyMs,
    },
    system: {
      memoryUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
      memoryTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
      nodeVersion: process.version,
    },
    responseTimeMs: Date.now() - startTime,
  };

  return res.status(isHealthy ? 200 : 503).json(healthData);
});

export default apiRouter;
