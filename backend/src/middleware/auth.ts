import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyToken } from '../utils/jwt';
import { AppError } from '../utils/appError';
import prisma from '../config/db';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'CUSTOMER' | 'ADMIN';
    name?: string | null;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
    phone?: string | null;
  };
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token =
      req.cookies?.accessToken ||
      req.cookies?.token ||
      req.cookies?.driveease_token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    const decoded = verifyAccessToken(token) || verifyToken(token);
    if (!decoded) {
      return next(new AppError('Invalid or expired authentication token. Please log in again.', 401));
    }

    // Verify user still exists in DB and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        firstName: true,
        lastName: true,
        isActive: true,
        phone: true,
      },
    });

    if (!user) {
      return next(new AppError('User account associated with this token no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 403));
    }

    req.user = user as AuthenticatedRequest['user'];
    next();
  } catch (error) {
    next(error);
  }
};

export const authenticateJwt = authenticateUser;

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token =
      req.cookies?.accessToken ||
      req.cookies?.token ||
      req.cookies?.driveease_token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (token) {
      const decoded = verifyAccessToken(token) || verifyToken(token);
      if (decoded) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            role: true,
            name: true,
            firstName: true,
            lastName: true,
            isActive: true,
            phone: true,
          },
        });
        if (user && user.isActive) {
          req.user = user as AuthenticatedRequest['user'];
        }
      }
    }
    next();
  } catch {
    next();
  }
};
