import { Prisma, BookingStatus } from '@prisma/client';
import prisma from '../config/db';
import { AppError } from '../utils/appError';

export interface CustomerBookingsFilterParams {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class DashboardService {
  /**
   * Authoritative, real-time customer KPI overview
   */
  static async getCustomerOverview(userId: string) {
    const now = new Date();

    const [allBookings, recentBookings, document, unreadCount] = await Promise.all([
      prisma.booking.findMany({
        where: { userId },
        select: {
          id: true,
          bookingStatus: true,
          paymentStatus: true,
          totalAmount: true,
          securityDeposit: true,
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

    // Rental Spend strictly excludes refundable security deposits
    const totalSpent = allBookings
      .filter((b) => b.paymentStatus === 'PAID')
      .reduce((sum, b) => {
        const total = Number(b.totalAmount);
        const deposit = Number(b.securityDeposit || 0);
        return sum + Math.max(0, total - deposit);
      }, 0);

    const rewardPoints = Math.floor(totalSpent / 100);

    return {
      stats: {
        totalBookings,
        upcoming,
        active,
        completed,
        cancelled,
        totalSpent,
        rewardPoints,
      },
      verificationStatus: document?.verificationStatus || 'NOT_SUBMITTED',
      recentBookings,
      unreadNotificationsCount: unreadCount,
    };
  }

  /**
   * Filtered and paginated customer reservations
   */
  static async getCustomerBookings(userId: string, params: CustomerBookingsFilterParams) {
    const { status, search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = params;
    const now = new Date();

    const where: Prisma.BookingWhereInput = {
      userId,
    };

    if (status && status !== 'ALL') {
      const upper = status.toUpperCase();
      if (upper === 'UPCOMING') {
        where.bookingStatus = { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] };
        where.pickupDateTime = { gte: now };
      } else if (upper === 'ACTIVE') {
        where.bookingStatus = BookingStatus.ACTIVE;
      } else if (upper === 'COMPLETED') {
        where.bookingStatus = BookingStatus.COMPLETED;
      } else if (upper === 'CANCELLED') {
        where.bookingStatus = BookingStatus.CANCELLED;
      } else if (Object.values(BookingStatus).includes(upper as any)) {
        where.bookingStatus = upper as BookingStatus;
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { bookingNumber: { contains: q, mode: 'insensitive' } },
        { pickupLocation: { contains: q, mode: 'insensitive' } },
        { dropoffLocation: { contains: q, mode: 'insensitive' } },
        { car: { brand: { contains: q, mode: 'insensitive' } } },
        { car: { model: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          car: {
            include: {
              images: { take: 3 },
              category: true,
            },
          },
          payment: true,
          services: {
            include: { service: true },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  /**
   * Customer notifications query
   */
  static async getCustomerNotifications(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return { notifications, unreadCount };
  }

  /**
   * Create an in-app customer notification
   */
  static async createNotification(userId: string, title: string, message: string, type: string) {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        isRead: false,
      },
    });
  }

  /**
   * Mark single notification as read
   */
  static async markNotificationAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new AppError('Notification not found', 404);
    if (notification.userId !== userId) throw new AppError('Forbidden: Access denied to notification', 403);

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Mark all customer notifications as read
   */
  static async markAllNotificationsAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
