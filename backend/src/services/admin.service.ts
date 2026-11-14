import { Prisma, BookingStatus, PaymentStatus } from '@prisma/client';
import prisma from '../config/db';
import { AppError } from '../utils/appError';
import { AuditService } from './audit.service';
import { ENV } from '../config/env';

export class AdminService {
  /**
   * 1. EXECUTIVE DASHBOARD OVERVIEW & REAL-TIME DB METRICS
   * Strictly distinguishes earned rental revenue, taxes, refunds, and security deposits.
   */
  static async getExecutiveOverview() {
    const now = new Date();

    const [
      totalBookings,
      totalCars,
      totalUsers,
      activeRentals,
      upcomingBookings,
      pendingPayments,
      cancelledBookings,
      paidBookings,
      completedRefunds,
      pendingRefunds,
      statusDistributionRaw,
      categoryDistributionRaw,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.car.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.booking.count({ where: { bookingStatus: BookingStatus.ACTIVE } }),
      prisma.booking.count({
        where: {
          bookingStatus: BookingStatus.CONFIRMED,
          pickupDateTime: { gte: now },
        },
      }),
      prisma.booking.count({
        where: {
          paymentStatus: PaymentStatus.PENDING,
          bookingStatus: { not: BookingStatus.CANCELLED },
        },
      }),
      prisma.booking.count({ where: { bookingStatus: BookingStatus.CANCELLED } }),
      // Fetch financial records for paid bookings
      prisma.booking.findMany({
        where: { paymentStatus: PaymentStatus.PAID },
        select: {
          id: true,
          totalAmount: true,
          securityDeposit: true,
          taxAmount: true,
          baseAmount: true,
          basePrice: true,
          insuranceAmount: true,
          insurancePrice: true,
          additionalServiceAmount: true,
          servicesPrice: true,
          discountAmount: true,
          createdAt: true,
          rentalDays: true,
        },
      }),
      prisma.refund.aggregate({
        where: { status: PaymentStatus.REFUNDED },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.refund.aggregate({
        where: { status: PaymentStatus.PENDING },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.booking.groupBy({
        by: ['bookingStatus'],
        _count: { id: true },
      }),
      prisma.booking.findMany({
        select: {
          car: {
            select: {
              category: {
                select: { name: true },
              },
            },
          },
          totalAmount: true,
          securityDeposit: true,
          paymentStatus: true,
        },
      }),
    ]);

    // Financial calculations
    let totalGrossRevenue = 0; // Gross paid by customers
    let totalDepositsHeld = 0; // Refundable deposits (NOT revenue)
    let totalTaxesCollected = 0; // 18% GST
    let totalEarnedRentalRevenue = 0; // Net taxable + tax - deposit (Actual earned revenue)

    for (const b of paidBookings) {
      const gross = Number(b.totalAmount);
      const deposit = Number(b.securityDeposit);
      const tax = Number(b.taxAmount);
      const rental = Math.max(0, gross - deposit);

      totalGrossRevenue += gross;
      totalDepositsHeld += deposit;
      totalTaxesCollected += tax;
      totalEarnedRentalRevenue += rental;
    }

    const totalRefundsProcessed = Number(completedRefunds._sum.amount || 0);
    const pendingRefundsAmount = Number(pendingRefunds._sum.amount || 0);
    const pendingRefundsCount = pendingRefunds._count.id;

    // Real-Time Past 6 Months Monthly Trend
    const monthlyMap: Record<string, { month: string; revenue: number; bookings: number; deposits: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Pre-populate last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap[key] = { month: key, revenue: 0, bookings: 0, deposits: 0 };
    }

    // Populate actual DB records
    const allRecentBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
        },
      },
      select: {
        totalAmount: true,
        securityDeposit: true,
        paymentStatus: true,
        createdAt: true,
      },
    });

    for (const b of allRecentBookings) {
      const d = new Date(b.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (monthlyMap[key]) {
        monthlyMap[key].bookings += 1;
        if (b.paymentStatus === 'PAID') {
          const gross = Number(b.totalAmount);
          const deposit = Number(b.securityDeposit);
          monthlyMap[key].revenue += Math.max(0, gross - deposit);
          monthlyMap[key].deposits += deposit;
        }
      }
    }

    const monthlyTrends = Object.values(monthlyMap);

    // Past 7 Days Daily Revenue
    const dailyMap: Record<string, { date: string; day: string; revenue: number; bookings: number }> = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const label = `${dayNames[d.getDay()]} (${d.getDate()})`;
      dailyMap[dateKey] = { date: dateKey, day: label, revenue: 0, bookings: 0 };
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sevenDayBookings = await prisma.booking.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { totalAmount: true, securityDeposit: true, paymentStatus: true, createdAt: true },
    });

    for (const b of sevenDayBookings) {
      const dateKey = new Date(b.createdAt).toISOString().split('T')[0];
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].bookings += 1;
        if (b.paymentStatus === 'PAID') {
          dailyMap[dateKey].revenue += Math.max(0, Number(b.totalAmount) - Number(b.securityDeposit));
        }
      }
    }

    const dailyTrends = Object.values(dailyMap);

    // Vehicle Fleet Utilization (% rented vs total vehicles)
    const utilizationRate = totalCars > 0 ? Math.round((activeRentals / totalCars) * 100) : 0;

    // Status Distribution
    const statusDistribution = statusDistributionRaw.map((s) => ({
      status: s.bookingStatus,
      count: s._count.id,
    }));

    // Category Distribution & Popularity
    const catMap: Record<string, { category: string; count: number; revenue: number }> = {};
    for (const b of categoryDistributionRaw) {
      const catName = b.car?.category?.name || 'Standard';
      if (!catMap[catName]) {
        catMap[catName] = { category: catName, count: 0, revenue: 0 };
      }
      catMap[catName].count += 1;
      if (b.paymentStatus === 'PAID') {
        catMap[catName].revenue += Math.max(0, Number(b.totalAmount) - Number(b.securityDeposit));
      }
    }
    const categoryStats = Object.values(catMap).sort((a, b) => b.count - a.count);

    return {
      stats: {
        totalEarnedRentalRevenue: Math.round(totalEarnedRentalRevenue),
        totalGrossRevenue: Math.round(totalGrossRevenue),
        totalDepositsHeld: Math.round(totalDepositsHeld),
        totalTaxesCollected: Math.round(totalTaxesCollected),
        totalRefundsProcessed: Math.round(totalRefundsProcessed),
        pendingRefundsAmount: Math.round(pendingRefundsAmount),
        pendingRefundsCount,
        totalBookings,
        totalCustomers: totalUsers,
        totalCars,
        availableCars: Math.max(0, totalCars - activeRentals),
        activeRentals,
        upcomingBookings,
        pendingPayments,
        cancelledBookings,
        utilizationRate,
      },
      charts: {
        monthlyTrends,
        dailyTrends,
        statusDistribution,
        categoryStats,
      },
    };
  }

  /**
   * 2. DETAILED ANALYTICS & REPORTS
   */
  static async getAnalytics(params: { startDate?: string; endDate?: string }) {
    const where: Prisma.BookingWhereInput = {};
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    const [bookings, carRankingsRaw] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          car: {
            include: { category: true },
          },
          payment: true,
        },
      }),
      prisma.booking.groupBy({
        by: ['carId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    const totalBookings = bookings.length;
    const paid = bookings.filter((b) => b.paymentStatus === 'PAID');
    const successful = bookings.filter((b) => ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(b.bookingStatus));
    const cancelled = bookings.filter((b) => b.bookingStatus === 'CANCELLED');

    let totalRentalRevenue = 0;
    let totalTax = 0;
    let totalDeposit = 0;
    let totalRentalDays = 0;

    for (const b of paid) {
      const gross = Number(b.totalAmount);
      const dep = Number(b.securityDeposit);
      totalRentalRevenue += Math.max(0, gross - dep);
      totalTax += Number(b.taxAmount);
      totalDeposit += dep;
      totalRentalDays += b.rentalDays;
    }

    const avgBookingValue = paid.length > 0 ? Math.round(totalRentalRevenue / paid.length) : 0;
    const avgRentalDuration = bookings.length > 0 ? Math.round((totalRentalDays / bookings.length) * 10) / 10 : 0;

    // Fetch car details for rankings
    const carIds = carRankingsRaw.map((r) => r.carId);
    const carDetails = await prisma.car.findMany({
      where: { id: { in: carIds } },
      select: { id: true, brand: true, model: true, dailyPrice: true },
    });

    const mostBookedCars = carRankingsRaw.map((r) => {
      const car = carDetails.find((c) => c.id === r.carId);
      return {
        carId: r.carId,
        brand: car?.brand || 'Car',
        model: car?.model || '',
        dailyPrice: Number(car?.dailyPrice || 0),
        bookingCount: r._count.id,
      };
    });

    return {
      totalBookings,
      successfulBookings: successful.length,
      cancelledBookings: cancelled.length,
      paidBookingsCount: paid.length,
      totalEarnedRentalRevenue: Math.round(totalRentalRevenue),
      totalTaxCollected: Math.round(totalTax),
      totalSecurityDepositHeld: Math.round(totalDeposit),
      avgBookingValue,
      avgRentalDuration,
      mostBookedCars,
    };
  }

  /**
   * Updates soft activation and availability status of a vehicle
   */
  static async updateCarStatus(
    id: string,
    adminId: string,
    isActive?: boolean,
    isAvailable?: boolean,
    adminEmail?: string,
    req?: any
  ) {
    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) throw new AppError('Vehicle not found.', 404);

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);

    const updated = await prisma.car.update({
      where: { id },
      data: updateData,
    });

    await AuditService.log({
      adminId,
      adminEmail,
      action: 'UPDATE_CAR_STATUS',
      entityType: 'CAR',
      entityId: id,
      details: updateData,
      req,
    });

    return updated;
  }

  /**
   * 3. EXPORT REPORTS AS CSV
   */
  static async exportReport(
    type: 'bookings' | 'revenue' | 'utilization',
    filters: { startDate?: string; endDate?: string; status?: string } = {}
  ) {
    const where: Prisma.BookingWhereInput = {};
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }
    if (filters.status && filters.status !== 'ALL') {
      where.bookingStatus = filters.status as BookingStatus;
    }

    if (type === 'bookings') {
      const bookings = await prisma.booking.findMany({
        where,
        include: { car: true, user: true, payment: true },
        orderBy: { createdAt: 'desc' },
      });

      const header = 'Booking Number,Customer Name,Customer Email,Vehicle,Pickup Date,Return Date,Duration (Days),Base Price,Tax,Deposit,Total Amount,Payment Status,Booking Status,Created At\n';
      const rows = bookings.map((b) => {
        const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
        return [
          escape(b.bookingNumber),
          escape(b.driverName),
          escape(b.driverEmail),
          escape(`${b.car.brand} ${b.car.model}`),
          escape(new Date(b.pickupDateTime).toISOString()),
          escape(new Date(b.returnDateTime).toISOString()),
          b.rentalDays,
          Number(b.basePrice),
          Number(b.taxAmount),
          Number(b.securityDeposit),
          Number(b.totalAmount),
          escape(b.paymentStatus),
          escape(b.bookingStatus),
          escape(new Date(b.createdAt).toISOString()),
        ].join(',');
      });

      return header + rows.join('\n');
    } else if (type === 'revenue') {
      const bookings = await prisma.booking.findMany({
        where: { ...where, paymentStatus: PaymentStatus.PAID },
        include: { car: { include: { category: true } } },
        orderBy: { createdAt: 'desc' },
      });

      const header = 'Invoice Number,Booking Ref,Vehicle,Category,Gross Total,Security Deposit (Refundable),GST Tax (18%),Earned Rental Revenue,Date Paid\n';
      const rows = bookings.map((b) => {
        const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
        const gross = Number(b.totalAmount);
        const dep = Number(b.securityDeposit);
        const tax = Number(b.taxAmount);
        const netRental = Math.max(0, gross - dep);

        return [
          escape(`INV-${b.bookingNumber}`),
          escape(b.bookingNumber),
          escape(`${b.car.brand} ${b.car.model}`),
          escape(b.car.category.name),
          gross,
          dep,
          tax,
          netRental,
          escape(new Date(b.createdAt).toISOString().split('T')[0]),
        ].join(',');
      });

      return header + rows.join('\n');
    } else {
      // Fleet Utilization CSV
      const cars = await prisma.car.findMany({
        include: {
          category: true,
          bookings: {
            where: { bookingStatus: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE, BookingStatus.COMPLETED] } },
            select: { rentalDays: true, totalAmount: true, securityDeposit: true },
          },
        },
      });

      const header = 'Vehicle ID,Brand,Model,Category,Daily Price,Status,Total Bookings,Total Days Rented,Estimated Revenue\n';
      const rows = cars.map((c) => {
        const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
        const totalDays = c.bookings.reduce((sum, b) => sum + b.rentalDays, 0);
        const revenue = c.bookings.reduce((sum, b) => sum + Math.max(0, Number(b.totalAmount) - Number(b.securityDeposit)), 0);

        return [
          escape(c.id),
          escape(c.brand),
          escape(c.model),
          escape(c.category.name),
          Number(c.dailyPrice),
          c.isActive ? 'Active' : 'Inactive',
          c.bookings.length,
          totalDays,
          revenue,
        ].join(',');
      });

      return header + rows.join('\n');
    }
  }

  /**
   * 4. CUSTOMER MANAGEMENT
   */
  static async getCustomers(params: { search?: string; status?: string; page?: number; limit?: number }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 15));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = { role: 'CUSTOMER' };

    if (params.status && params.status !== 'ALL') {
      where.accountStatus = params.status;
    }

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { drivingLicenseNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          accountStatus: true,
          drivingLicenseNumber: true,
          createdAt: true,
          documents: {
            select: {
              id: true,
              documentType: true,
              verificationStatus: true,
              documentNumber: true,
              expiryDate: true,
            },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          bookings: {
            select: {
              id: true,
              totalAmount: true,
              paymentStatus: true,
              bookingStatus: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const customers = users.map((u) => {
      const totalBookings = u.bookings.length;
      const totalSpent = u.bookings
        .filter((b) => b.paymentStatus === 'PAID')
        .reduce((sum, b) => sum + Number(b.totalAmount), 0);
      const latestDoc = u.documents[0];

      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`.trim() || u.name || 'Customer',
        email: u.email,
        phone: u.phone,
        avatar: u.avatar,
        isActive: u.isActive,
        accountStatus: u.accountStatus || (u.isActive ? 'ACTIVE' : 'SUSPENDED'),
        drivingLicenseNumber: u.drivingLicenseNumber,
        joinedAt: u.createdAt,
        totalBookings,
        totalSpent,
        documentStatus: latestDoc?.verificationStatus || (u.drivingLicenseNumber ? 'PENDING' : 'NOT_SUBMITTED'),
        documentId: latestDoc?.id || null,
      };
    });

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomerDetails(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        documents: { orderBy: { createdAt: 'desc' } },
        bookings: {
          include: {
            car: true,
            payment: true,
            refunds: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) throw new AppError('Customer not found.', 404);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      accountStatus: user.accountStatus,
      drivingLicenseNumber: user.drivingLicenseNumber,
      createdAt: user.createdAt,
      documents: user.documents,
      bookings: user.bookings,
    };
  }

  static async updateCustomerStatus(
    id: string,
    accountStatus: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED',
    reason: string | undefined,
    adminId: string,
    adminEmail?: string,
    req?: any
  ) {
    if (id === adminId && accountStatus !== 'ACTIVE') {
      throw new AppError('You cannot deactivate your own administrative account.', 400);
    }

    const isActive = accountStatus === 'ACTIVE';
    const updated = await prisma.user.update({
      where: { id },
      data: {
        accountStatus,
        isActive,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        accountStatus: true,
      },
    });

    // Audit log
    await AuditService.log({
      adminId,
      adminEmail,
      action: 'UPDATE_CUSTOMER_STATUS',
      entityType: 'USER',
      entityId: id,
      details: { accountStatus, reason },
      req,
    });

    return updated;
  }

  /**
   * 5. BUSINESS SETTINGS
   */
  static async getBusinessSettings() {
    // Default fallback settings
    const defaults: Record<string, { value: string; category: string; description: string }> = {
      BUSINESS_NAME: { value: 'DriveEase Car Rental Portal', category: 'GENERAL', description: 'Brand trading name' },
      SUPPORT_EMAIL: { value: 'support@driveease.com', category: 'GENERAL', description: 'Customer support inquiries' },
      SUPPORT_PHONE: { value: '+91 (800) 123-4567', category: 'GENERAL', description: 'Toll-free customer hotline' },
      BUSINESS_ADDRESS: { value: 'Level 4, Horizon Tower, Airport Road, Bangalore 560001', category: 'GENERAL', description: 'Corporate headquarters' },
      CURRENCY: { value: 'INR', category: 'BOOKING', description: 'Base operating currency' },
      BUSINESS_TIMEZONE: { value: ENV.TIMEZONE || 'Asia/Kolkata', category: 'BOOKING', description: 'System business timezone' },
      TAX_RATE: { value: String(ENV.TAX_RATE || 0.18), category: 'BOOKING', description: 'Standard GST tax rate (0.18 = 18%)' },
      BOOKING_HOLD_MINUTES: { value: String(ENV.BOOKING_HOLD_MINUTES || 10), category: 'BOOKING', description: 'Temporary reservation hold duration' },
      CANCELLATION_FREE_WINDOW_HOURS: { value: String(ENV.CANCELLATION_FREE_WINDOW_HOURS || 24), category: 'POLICY', description: 'Hours before pickup for 100% refund' },
      CANCELLATION_LATE_FEE_PERCENTAGE: { value: String(ENV.CANCELLATION_LATE_FEE_PERCENTAGE || 20), category: 'POLICY', description: 'Late cancellation penalty fee (%)' },
    };

    const dbSettings = await prisma.businessSetting.findMany();
    const result: Record<string, any> = {};

    for (const [k, v] of Object.entries(defaults)) {
      const match = dbSettings.find((s) => s.key === k);
      result[k] = match ? match.value : v.value;
    }

    return result;
  }

  static async updateBusinessSettings(settings: Record<string, string>, adminId: string, adminEmail?: string, req?: any) {
    const updatedEntries: Record<string, string> = {};

    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'string' || typeof value === 'number') {
        const valStr = String(value);
        await prisma.businessSetting.upsert({
          where: { key },
          create: {
            key,
            value: valStr,
            category: key.includes('TAX') || key.includes('HOLD') ? 'BOOKING' : 'GENERAL',
            updatedBy: adminId,
          },
          update: {
            value: valStr,
            updatedBy: adminId,
          },
        });
        updatedEntries[key] = valStr;
      }
    }

    // Audit log
    await AuditService.log({
      adminId,
      adminEmail,
      action: 'UPDATE_SETTINGS',
      entityType: 'SETTINGS',
      details: updatedEntries,
      req,
    });

    return updatedEntries;
  }
}
