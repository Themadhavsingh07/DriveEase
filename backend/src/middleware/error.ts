import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';
import { sendError } from '../utils/apiResponse';

export { AppError };

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on our end';
  let errors: any[] = err.errors || [];

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    const detail = err.errors.map((e) => `${e.path.join('.') || 'field'}: ${e.message}`).join(', ');
    message = detail ? `Validation failed: ${detail}` : 'Validation failed for submitted data';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // 2. Prisma Database Errors
  if (err.code === 'P2002') {
    statusCode = 409;
    const target = Array.isArray(err.meta?.target)
      ? err.meta.target.join(', ')
      : err.meta?.target || 'field';
    message = `A record with this ${target} already exists.`;
    errors = [{ field: target, message }];
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Requested record was not found in the database.';
  }

  // 3. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please refresh your session.';
  }

  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    console.error('Unhandled Application Error:', err);
  }

  return sendError(res, message, statusCode, errors);
};

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  next(new AppError(`Endpoint not found: [${req.method}] ${req.originalUrl}`, 404));
};
