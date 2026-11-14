import { createApp } from './app';
import { ENV } from './config/env';
import prisma from './config/db';
import logger from './utils/logger';

const app = createApp();

const startServer = async () => {
  try {
    // Verify database connectivity
    await prisma.$connect();
    logger.info('✅ PostgreSQL Database connected successfully via Prisma');

    const server = app.listen(ENV.PORT, () => {
      logger.info(`🚀 DriveEase API Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
      logger.info(`🚗 Health check available at: http://localhost:${ENV.PORT}/api/v1/health`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Gracefully shutting down DriveEase server...`);
      server.close(async () => {
        try {
          await prisma.$disconnect();
          logger.info('Database connection cleanly disconnected.');
        } catch (err) {
          logger.error('Error disconnecting database during shutdown:', err);
        }
        process.exit(0);
      });

      // Force exit if shutdown takes too long (e.g. 10s)
      setTimeout(() => {
        logger.error('Forceful shutdown triggered after timeout.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection detected:', { reason: reason?.message || reason });
    });

    process.on('uncaughtException', (err: Error) => {
      logger.error('Uncaught Exception detected:', { error: err.message, stack: err.stack });
      process.exit(1);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
