import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../src/config/db';
import { DashboardService } from '../src/services/dashboard.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

describe('📊 Phase 6: Customer Dashboard & Notifications Engine Tests', () => {
  let customerA: any;
  let customerB: any;
  let testCar: any;
  let bookingA1: any;
  let bookingA2: any;
  let bookingB1: any;

  beforeAll(async () => {
    await prisma.$connect();
    // Clean up any stale records from previous interrupted runs
    await prisma.notification.deleteMany({
      where: { user: { email: { contains: 'dash_cust' } } },
    });
    await prisma.booking.deleteMany({
      where: { user: { email: { contains: 'dash_cust' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'dash_cust' } },
    });

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Create 2 test customers
    customerA = await prisma.user.create({
      data: {
        email: `dash_custA_${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: 'Rahul',
        lastName: 'Sharma',
        phone: '+919876500001',
        role: 'CUSTOMER',
      },
    });

    customerB = await prisma.user.create({
      data: {
        email: `dash_custB_${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: 'Priya',
        lastName: 'Patel',
        phone: '+919876500002',
        role: 'CUSTOMER',
      },
    });

    const cat = await prisma.carCategory.upsert({
      where: { slug: 'dashboard-test-sedan' },
      create: { name: 'Dashboard Test Sedan', slug: 'dashboard-test-sedan' },
      update: {},
    });

    testCar = await prisma.car.create({
      data: {
        brand: 'BMW',
        model: '3 Series Gran Limousine',
        year: 2024,
        categoryId: cat.id,
        dailyPrice: 12000,
        securityDeposit: 25000,
        minRentalDays: 1,
        maxRentalDays: 14,
        transmission: 'AUTOMATIC',
        fuelType: 'PETROL',
        seatingCapacity: 5,
        mileage: '15 kmpl',
        isAvailable: true,
        isActive: true,
        pickupLocation: 'BKC, Mumbai',
        dropoffLocation: 'BKC, Mumbai',
        features: ['Sunroof', 'Leather Seats', 'Apple CarPlay'],
      },
    });

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 3600 * 1000);

    // Create Booking 1 for Customer A (CONFIRMED & PAID)
    bookingA1 = await prisma.booking.create({
      data: {
        bookingNumber: `DE-DASH-${Date.now()}-1`,
        userId: customerA.id,
        carId: testCar.id,
        pickupLocation: 'BKC, Mumbai',
        dropoffLocation: 'BKC, Mumbai',
        pickupDateTime: tomorrow,
        returnDateTime: dayAfter,
        rentalDays: 1,
        dailyPrice: 12000,
        basePrice: 12000,
        insuranceType: 'BASIC',
        insurancePrice: 0,
        servicesPrice: 0,
        taxAmount: 2160,
        discountAmount: 0,
        securityDeposit: 25000,
        totalAmount: 39160,
        bookingStatus: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        driverName: 'Rahul Sharma',
        driverEmail: customerA.email,
        driverPhone: customerA.phone,
        driverLicenseNumber: 'DL-04-2024-1111111',
      },
    });

    // Create Booking 2 for Customer A (COMPLETED)
    const pastStart = new Date(now.getTime() - 96 * 3600 * 1000);
    const pastEnd = new Date(now.getTime() - 72 * 3600 * 1000);
    bookingA2 = await prisma.booking.create({
      data: {
        bookingNumber: `DE-DASH-${Date.now()}-2`,
        userId: customerA.id,
        carId: testCar.id,
        pickupLocation: 'BKC, Mumbai',
        dropoffLocation: 'BKC, Mumbai',
        pickupDateTime: pastStart,
        returnDateTime: pastEnd,
        rentalDays: 1,
        dailyPrice: 12000,
        basePrice: 12000,
        insuranceType: 'BASIC',
        insurancePrice: 0,
        servicesPrice: 0,
        taxAmount: 2160,
        discountAmount: 0,
        securityDeposit: 25000,
        totalAmount: 39160,
        bookingStatus: BookingStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
        driverName: 'Rahul Sharma',
        driverEmail: customerA.email,
        driverPhone: customerA.phone,
        driverLicenseNumber: 'DL-04-2024-1111111',
      },
    });

    // Create Booking for Customer B
    bookingB1 = await prisma.booking.create({
      data: {
        bookingNumber: `DE-DASH-${Date.now()}-3`,
        userId: customerB.id,
        carId: testCar.id,
        pickupLocation: 'BKC, Mumbai',
        dropoffLocation: 'BKC, Mumbai',
        pickupDateTime: tomorrow,
        returnDateTime: dayAfter,
        rentalDays: 1,
        dailyPrice: 12000,
        basePrice: 12000,
        insuranceType: 'BASIC',
        insurancePrice: 0,
        servicesPrice: 0,
        taxAmount: 2160,
        discountAmount: 0,
        securityDeposit: 25000,
        totalAmount: 39160,
        bookingStatus: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        driverName: 'Priya Patel',
        driverEmail: customerB.email,
        driverPhone: customerB.phone,
        driverLicenseNumber: 'DL-04-2024-2222222',
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.notification.deleteMany({
      where: { userId: { in: [customerA?.id, customerB?.id] } },
    });
    await prisma.booking.deleteMany({
      where: { userId: { in: [customerA?.id, customerB?.id] } },
    });
    if (testCar) {
      await prisma.car.delete({ where: { id: testCar.id } }).catch(() => {});
    }
    if (customerA) {
      await prisma.user.delete({ where: { id: customerA.id } }).catch(() => {});
    }
    if (customerB) {
      await prisma.user.delete({ where: { id: customerB.id } }).catch(() => {});
    }
  });

  it('1. Computes accurate customer overview stats from real database bookings', async () => {
    const overview = await DashboardService.getCustomerOverview(customerA.id);

    expect(overview.stats.totalBookings).toBe(2);
    expect(overview.stats.upcoming).toBe(1);
    expect(overview.stats.completed).toBe(1);
    expect(overview.stats.cancelled).toBe(0);
    // Paid rental spend = (39160 - 25000) * 2 = 14160 * 2 = 28320
    expect(overview.stats.totalSpent).toBe(28320);
    expect(overview.recentBookings.length).toBeLessThanOrEqual(5);
  });

  it('2. Filters and searches customer bookings correctly with pagination', async () => {
    // Filter by UPCOMING
    const upcoming = await DashboardService.getCustomerBookings(customerA.id, {
      status: 'UPCOMING',
    });
    expect(upcoming.bookings.length).toBe(1);
    expect(upcoming.bookings[0].bookingNumber).toBe(bookingA1.bookingNumber);

    // Search by booking reference
    const searched = await DashboardService.getCustomerBookings(customerA.id, {
      search: bookingA2.bookingNumber,
    });
    expect(searched.bookings.length).toBe(1);
    expect(searched.bookings[0].id).toBe(bookingA2.id);

    // Customer A cannot see Customer B's bookings
    const searchB = await DashboardService.getCustomerBookings(customerA.id, {
      search: bookingB1.bookingNumber,
    });
    expect(searchB.bookings.length).toBe(0);
  });

  it('3. Creates, retrieves and marks customer notifications as read', async () => {
    // Create notifications for Customer A
    const n1 = await DashboardService.createNotification(
      customerA.id,
      'Booking Confirmed',
      'Your trip with BMW 3 Series is confirmed.',
      'BOOKING_CONFIRMED'
    );
    const n2 = await DashboardService.createNotification(
      customerA.id,
      'License Verified',
      'Your driving license was approved by concierge.',
      'DOCUMENT_VERIFIED'
    );

    expect(n1.id).toBeDefined();
    expect(n2.id).toBeDefined();

    // Check notifications list
    const unreadBefore = await DashboardService.getCustomerNotifications(customerA.id);
    expect(unreadBefore.unreadCount).toBeGreaterThanOrEqual(2);

    // Mark single notification read
    const marked = await DashboardService.markNotificationAsRead(n1.id, customerA.id);
    expect(marked.isRead).toBe(true);

    // Mark all notifications read
    await DashboardService.markAllNotificationsAsRead(customerA.id);
    const unreadAfter = await DashboardService.getCustomerNotifications(customerA.id);
    expect(unreadAfter.unreadCount).toBe(0);
  });
});
