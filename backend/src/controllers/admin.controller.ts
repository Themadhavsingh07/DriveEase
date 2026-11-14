import { Request, Response, NextFunction } from 'express';
import { Prisma, BookingStatus } from '@prisma/client';
import prisma from '../config/db';
import { AppError } from '../utils/appError';
import { AuthenticatedRequest } from '../middleware/auth';
import { AdminService } from '../services/admin.service';
import { DocumentService } from '../services/document.service';
import { DocumentController } from './document.controller';
import { AuditService } from '../services/audit.service';
import { sendSuccess } from '../utils/apiResponse';

/**
 * 1. EXECUTIVE DASHBOARD OVERVIEW & REAL DB CHARTS
 */
export const getAdminStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AdminService.getExecutiveOverview();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. DETAILED ANALYTICS
 */
export const getMonthlyAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const analytics = await AdminService.getAnalytics({ startDate, endDate });

    // Also include overview trends for dashboard charts
    const overview = await AdminService.getExecutiveOverview();

    return res.status(200).json({
      success: true,
      data: {
        analytics,
        trends: overview.charts.monthlyTrends,
        daily: overview.charts.dailyTrends,
        statusDistribution: overview.charts.statusDistribution,
        categoryStats: overview.charts.categoryStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. REPORT EXPORT (CSV)
 */
export const exportReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type = 'bookings', format = 'csv', startDate, endDate, status } = req.query as Record<string, string>;

    const csvData = await AdminService.exportReport(
      type as 'bookings' | 'revenue' | 'utilization',
      { startDate, endDate, status }
    );

    const filename = `DriveEase-${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

/**
 * 4. FLEET MANAGEMENT FOR ADMIN
 */
export const getAllCarsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      category,
      fuelType,
      transmission,
      status, // 'active', 'inactive', 'available', 'all'
      search,
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * take;

    const where: Prisma.CarWhereInput = {};

    if (category) {
      where.category = { slug: category };
    }
    if (fuelType) {
      where.fuelType = fuelType.toUpperCase() as any;
    }
    if (transmission) {
      where.transmission = transmission.toUpperCase() as any;
    }
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    } else if (status === 'available') {
      where.isActive = true;
      where.isAvailable = true;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { brand: { contains: q, mode: 'insensitive' } },
        { model: { contains: q, mode: 'insensitive' } },
        { pickupLocation: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, cars] = await Promise.all([
      prisma.car.count({ where }),
      prisma.car.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    const formattedCars = cars.map((c) => ({
      ...c,
      dailyPrice: Number(c.dailyPrice),
      pricePerDay: Number(c.dailyPrice),
      securityDeposit: Number(c.securityDeposit),
      category: c.category.name,
      totalBookings: c._count.bookings,
    }));

    return res.status(200).json({
      success: true,
      data: {
        cars: formattedCars,
        pagination: {
          total,
          page: pageNum,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCarStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive, isAvailable } = req.body;
    const adminId = req.user!.id;

    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) throw new AppError('Vehicle not found.', 404);

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);

    const updated = await prisma.car.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await AuditService.log({
      adminId,
      adminEmail: req.user?.email,
      action: 'UPDATE_CAR_STATUS',
      entityType: 'CAR',
      entityId: id,
      details: updateData,
      req,
    });

    return sendSuccess(res, { car: updated }, 'Vehicle status updated successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * 5. CUSTOMER MANAGEMENT FOR ADMIN
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, page = '1', limit = '15' } = req.query as Record<string, string>;
    const data = await AdminService.getCustomers({
      search,
      status,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 15,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AdminService.getCustomerDetails(req.params.id);
    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { accountStatus = 'ACTIVE', reason } = req.body;
    const targetUserId = req.params.id;
    const adminId = req.user!.id;
    const adminEmail = req.user?.email;

    const updated = await AdminService.updateCustomerStatus(
      targetUserId,
      accountStatus,
      reason,
      adminId,
      adminEmail,
      req
    );

    return res.status(200).json({
      success: true,
      message: `Customer account status updated to ${accountStatus}.`,
      data: { user: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const reviewDocumentStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return DocumentController.adminReviewDocument(req, res, next);
};

/**
 * 6. BOOKING MANAGEMENT FOR ADMIN
 */
export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      status,
      paymentStatus,
      carId,
      startDate,
      endDate,
      search,
      page = '1',
      limit = '15',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * take;

    const where: Prisma.BookingWhereInput = {};

    if (status && status !== 'ALL' && Object.values(BookingStatus).includes(status as BookingStatus)) {
      where.bookingStatus = status as BookingStatus;
    }
    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus as any;
    }
    if (carId) {
      where.carId = carId;
    }
    if (startDate || endDate) {
      where.pickupDateTime = {};
      if (startDate) where.pickupDateTime.gte = new Date(startDate);
      if (endDate) where.pickupDateTime.lte = new Date(endDate);
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { bookingNumber: { contains: q, mode: 'insensitive' } },
        { bookingReference: { contains: q, mode: 'insensitive' } },
        { driverName: { contains: q, mode: 'insensitive' } },
        { driverEmail: { contains: q, mode: 'insensitive' } },
        { driverPhone: { contains: q, mode: 'insensitive' } },
        { car: { brand: { contains: q, mode: 'insensitive' } } },
        { car: { model: { contains: q, mode: 'insensitive' } } },
      ];
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
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          payment: true,
          invoice: true,
          refunds: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: pageNum,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingDetailsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        car: {
          include: { images: true, category: true },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            accountStatus: true,
            documents: true,
          },
        },
        payment: true,
        invoice: true,
        services: { include: { service: true } },
        refunds: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!booking) throw new AppError('Booking not found.', 404);

    return res.status(200).json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const authReq = req as AuthenticatedRequest;
    const adminId = authReq.user?.id || 'ADMIN';
    const adminEmail = authReq.user?.email;

    if (!Object.values(BookingStatus).includes(status)) {
      return next(new AppError('Invalid booking status value.', 400));
    }

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return next(new AppError('Booking not found.', 404));

    // Protect unpaid bookings: prevent manual confirmation of unpaid bookings without auditable reason
    if (status === BookingStatus.CONFIRMED && booking.paymentStatus === 'PENDING' && !reason) {
      return next(
        new AppError('Manual confirmation of an unpaid booking requires an auditable reason.', 400)
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: { bookingStatus: status as BookingStatus },
        include: { car: true, payment: true },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          fromStatus: booking.bookingStatus,
          toStatus: status as BookingStatus,
          reason: reason || `Status updated to ${status} by admin`,
          changedBy: adminId,
        },
      });

      return b;
    });

    // Audit log
    await AuditService.log({
      adminId,
      adminEmail,
      action: 'UPDATE_BOOKING_STATUS',
      entityType: 'BOOKING',
      entityId: id,
      details: {
        fromStatus: booking.bookingStatus,
        toStatus: status,
        reason,
      },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      data: { booking: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. BUSINESS SETTINGS
 */
export const getSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await AdminService.getBusinessSettings();
    return res.status(200).json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const adminEmail = req.user?.email;
    const settings = req.body;

    const updated = await AdminService.updateBusinessSettings(settings, adminId, adminEmail, req);
    return res.status(200).json({
      success: true,
      message: 'Business settings updated successfully.',
      data: { settings: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. AUDIT LOGS
 */
export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, entityType, action, search } = req.query as Record<string, string>;
    const data = await AuditService.getLogs({
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      entityType,
      action,
      search,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 9. COUPONS
 */
export const getCoupons = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({
      success: true,
      data: { coupons },
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, description, discountType, discountValue, minBookingAmount, maxDiscountAmount, expiryDate, usageLimit } = req.body;
    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        description,
        discountType: discountType || 'PERCENTAGE',
        discountValue,
        minBookingAmount: minBookingAmount || 0,
        maxDiscountAmount: maxDiscountAmount || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        usageLimit: usageLimit || null,
      },
    });
    res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 14. ADMIN PAYMENTS & REFUNDS MONITORING
 */
export const getAllPaymentsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, search } = req.query as Record<string, string>;
    const result = await AdminService.getPayments({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
      search,
    });
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllRefundsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status } = req.query as Record<string, string>;
    const result = await AdminService.getRefunds({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
    });
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 15. ADMIN NOTIFICATIONS
 */
export const getAdminNotificationsController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user?.id || '';
    const result = await AdminService.getAdminNotifications(adminId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

