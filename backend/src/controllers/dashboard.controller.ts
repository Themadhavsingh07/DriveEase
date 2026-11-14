import { Response, NextFunction } from 'express';
import { Prisma, BookingStatus } from '@prisma/client';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export class DashboardController {
  /**
   * GET /api/v1/dashboard/overview
   * Authoritative, real-time KPI overview for authenticated customer
   */
  static async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const now = new Date();

      const [allBookings, recentBookings, document, unreadCount] = await Promise.all([
        prisma.booking.findMany({
          where: { userId },
          select: {
            id: true,
            bookingStatus: true,
            paymentStatus: true,
            totalAmount: true,
            pickupDateTime: true,
            returnDateTime: true,
          },
        }),
        prisma.booking.findMany({
          where: { userId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            car: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
                category: true,
              },
            },
            payment: true,
          },
        }),
        prisma.userDocument.findFirst({
          where: { userId, documentType: 'DRIVING_LICENSE' },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.notification.count({
          where: { userId, isRead: false },
        }),
      ]);

      const totalBookings = allBookings.length;
      const upcoming = allBookings.filter(
        (b) =>
          ([BookingStatus.CONFIRMED, BookingStatus.PENDING] as BookingStatus[]).includes(b.bookingStatus) &&
          new Date(b.pickupDateTime) >= now
      ).length;
      const active = allBookings.filter((b) => b.bookingStatus === BookingStatus.ACTIVE).length;
      const completed = allBookings.filter((b) => b.bookingStatus === BookingStatus.COMPLETED).length;
      const cancelled = allBookings.filter((b) => b.bookingStatus === BookingStatus.CANCELLED).length;

      const totalSpent = allBookings
        .filter((b) => b.paymentStatus === 'PAID')
        .reduce((sum, b) => sum + Number(b.totalAmount), 0);

      // Reward points formula: 1 point per ₹100 spent on completed/confirmed bookings
      const rewardPoints = Math.floor(totalSpent / 100);

      const verificationStatus = document
        ? document.verificationStatus
        : 'NOT_SUBMITTED';

      return sendSuccess(res, {
        stats: {
          totalBookings,
          upcoming,
          active,
          completed,
          cancelled,
          totalSpent,
          rewardPoints,
        },
        verificationStatus,
        recentBookings,
        unreadNotificationsCount: unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/dashboard/bookings
   * Customer bookings with search, status filter, sorting, and pagination
   */
  static async getBookings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = '1',
        limit = '10',
      } = req.query as Record<string, string>;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
      const skip = (pageNum - 1) * take;

      const where: Prisma.BookingWhereInput = { userId };
      const now = new Date();

      if (status && status !== 'ALL') {
        if (status === 'UPCOMING') {
          where.bookingStatus = { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] };
          where.pickupDateTime = { gte: now };
        } else if (Object.values(BookingStatus).includes(status as BookingStatus)) {
          where.bookingStatus = status as BookingStatus;
        }
      }

      if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
          { bookingNumber: { contains: query, mode: 'insensitive' } },
          { pickupLocation: { contains: query, mode: 'insensitive' } },
          { dropoffLocation: { contains: query, mode: 'insensitive' } },
          { car: { brand: { contains: query, mode: 'insensitive' } } },
          { car: { model: { contains: query, mode: 'insensitive' } } },
        ];
      }

      const orderBy: Prisma.BookingOrderByWithRelationInput = {};
      if (sortBy === 'pickupDateTime') {
        orderBy.pickupDateTime = sortOrder === 'asc' ? 'asc' : 'desc';
      } else if (sortBy === 'totalAmount') {
        orderBy.totalAmount = sortOrder === 'asc' ? 'asc' : 'desc';
      } else {
        orderBy.createdAt = sortOrder === 'asc' ? 'asc' : 'desc';
      }

      const [total, bookings] = await Promise.all([
        prisma.booking.count({ where }),
        prisma.booking.findMany({
          where,
          include: {
            car: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
                category: true,
              },
            },
            payment: true,
            invoice: true,
            services: { include: { service: true } },
          },
          orderBy,
          skip,
          take,
        }),
      ]);

      return sendSuccess(res, {
        bookings,
        pagination: {
          total,
          page: pageNum,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/dashboard/notifications
   */
  static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });

      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
      });

      return sendSuccess(res, { notifications, unreadCount });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/dashboard/notifications/:id/read
   */
  static async markNotificationRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
      });

      return sendSuccess(res, { success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/dashboard/notifications/read-all
   */
  static async markAllNotificationsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      return sendSuccess(res, { success: true });
    } catch (error) {
      next(error);
    }
  }
}
