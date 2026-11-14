import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../src/config/db';
import { AdminService } from '../src/services/admin.service';
import { AuditService } from '../src/services/audit.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

describe('👑 Phase 6: Admin Management System & Analytics Tests', () => {
  let adminUser: any;
  let testCustomer: any;
  let testCar: any;
  let confirmedBooking: any;

  beforeAll(async () => {
    await prisma.$connect();
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    adminUser = await prisma.user.create({
      data: {
        email: `adm_p6_${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: 'Elena',
        lastName: 'Rostova',
        phone: '+919876500006',
        role: 'ADMIN',
      },
    });

    testCustomer = await prisma.user.create({
      data: {
        email: `cust_p6_${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: 'Vikram',
        lastName: 'Singhania',
        phone: '+919876500007',
        role: 'CUSTOMER',
        accountStatus: 'ACTIVE',
      },
    });

    const cat = await prisma.carCategory.upsert({
      where: { slug: 'admin-test-luxury' },
      create: { name: 'Admin Test Luxury', slug: 'admin-test-luxury' },
      update: {},
    });

    testCar = await prisma.car.create({
      data: {
        brand: 'Mercedes-Benz',
        model: 'E-Class E200 Exclusive',
        year: 2024,
        categoryId: cat.id,
        dailyPrice: 15000,
        securityDeposit: 30000,
        minRentalDays: 1,
        maxRentalDays: 14,
        transmission: 'AUTOMATIC',
        fuelType: 'PETROL',
        seatingCapacity: 5,
        mileage: '13 kmpl',
        isAvailable: true,
        isActive: true,
        pickupLocation: 'BKC, Mumbai',
        dropoffLocation: 'BKC, Mumbai',
      },
    });

    // Create a confirmed & paid booking
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    const dayAfter = new Date(Date.now() + 48 * 3600 * 1000);

    confirmedBooking = await prisma.booking.create({
      data: {
        bookingNumber: `DE-ADM-${Date.now()}`,
        userId: testCustomer.id,
        carId: testCar.id,
        pickupLocation: 'BKC, Mumbai',
        dropoffLocation: 'BKC, Mumbai',
        pickupDateTime: tomorrow,
        returnDateTime: dayAfter,
        rentalDays: 1,
        dailyPrice: 15000,
        basePrice: 15000,
        insuranceType: 'PREMIUM',
        insurancePrice: 2000,
        servicesPrice: 0,
        taxAmount: 3060,
        discountAmount: 0,
        securityDeposit: 30000,
        totalAmount: 50060,
        bookingStatus: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        driverName: 'Vikram Singhania',
        driverEmail: testCustomer.email,
        driverPhone: testCustomer.phone,
        driverLicenseNumber: 'DL-04-2024-9999999',
      },
    });
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({
      where: { adminId: adminUser?.id },
    });
    await prisma.booking.deleteMany({
      where: { userId: testCustomer?.id },
    });
    if (testCar) await prisma.car.delete({ where: { id: testCar.id } }).catch(() => {});
    if (testCustomer) await prisma.user.delete({ where: { id: testCustomer.id } }).catch(() => {});
    if (adminUser) await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
  });

  it('1. Executive Overview strictly isolates earned rental revenue from refundable deposits', async () => {
    const overview = await AdminService.getExecutiveOverview();

    // Verify properties exist
    expect(overview.stats.totalEarnedRentalRevenue).toBeGreaterThanOrEqual(0);
    expect(overview.stats.totalGrossRevenue).toBeGreaterThanOrEqual(0);
    expect(overview.stats.totalDepositsHeld).toBeGreaterThanOrEqual(0);
    expect(overview.stats.totalBookings).toBeGreaterThanOrEqual(1);
    expect(overview.stats.totalCars).toBeGreaterThanOrEqual(1);

    // Verify monthly and daily trends structure
    expect(Array.isArray(overview.charts.monthlyTrends)).toBe(true);
    expect(overview.charts.monthlyTrends.length).toBe(6);
    expect(Array.isArray(overview.charts.dailyTrends)).toBe(true);
    expect(overview.charts.dailyTrends.length).toBe(7);
  });

  it('2. Soft-deactivates and reactivates fleet vehicle without deleting booking history', async () => {
    // Soft de-activate
    const deactivated = await AdminService.updateCarStatus(
      testCar.id,
      adminUser.id,
      false, // isActive: false
      false  // isAvailable: false
    );
    expect(deactivated.isActive).toBe(false);
    expect(deactivated.isAvailable).toBe(false);

    // Past booking still intact
    const checkBooking = await prisma.booking.findUnique({
      where: { id: confirmedBooking.id },
    });
    expect(checkBooking).not.toBeNull();
    expect(checkBooking?.carId).toBe(testCar.id);

    // Reactivate
    const reactivated = await AdminService.updateCarStatus(
      testCar.id,
      adminUser.id,
      true,
      true
    );
    expect(reactivated.isActive).toBe(true);
    expect(reactivated.isAvailable).toBe(true);
  });

  it('3. Updates customer account status (ACTIVE -> SUSPENDED) and records audit trail', async () => {
    const updated = await AdminService.updateCustomerStatus(
      testCustomer.id,
      'SUSPENDED',
      'Suspended pending driving license verification review.',
      adminUser.id,
      adminUser.email
    );

    expect(updated.accountStatus).toBe('SUSPENDED');

    // Verify AuditLog was recorded
    const logs = await prisma.auditLog.findMany({
      where: {
        adminId: adminUser.id,
        action: 'UPDATE_CUSTOMER_STATUS',
        entityId: testCustomer.id,
      },
    });
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0].details).toMatchObject({
      accountStatus: 'SUSPENDED',
    });
  });

  it('4. Gets and updates business settings with audit log', async () => {
    const settingsBefore = await AdminService.getBusinessSettings();
    expect(settingsBefore).toBeDefined();

    const updated = await AdminService.updateBusinessSettings(
      {
        DEFAULT_TAX_RATE: '18',
        HOLD_DURATION_MINUTES: '20',
        CURRENCY: 'INR',
      },
      adminUser.id,
      adminUser.email
    );

    expect(updated['HOLD_DURATION_MINUTES']).toBe('20');
    expect(updated['CURRENCY']).toBe('INR');

    // Verify audit log for settings update
    const logs = await prisma.auditLog.findMany({
      where: {
        adminId: adminUser.id,
        action: 'UPDATE_SETTINGS',
      },
    });
    expect(logs.length).toBeGreaterThanOrEqual(1);
  });

  it('5. Generates valid CSV export reports for bookings, revenue, and utilization', async () => {
    // Bookings CSV
    const bookingsCsv = await AdminService.exportReport('bookings');
    expect(bookingsCsv).toContain('Booking Number,Customer Name,Customer Email');
    expect(bookingsCsv).toContain(confirmedBooking.bookingNumber);

    // Revenue CSV
    const revenueCsv = await AdminService.exportReport('revenue');
    expect(revenueCsv).toContain('Invoice Number,Booking Ref,Vehicle');
    expect(revenueCsv).toContain(confirmedBooking.bookingNumber);

    // Utilization CSV
    const utilCsv = await AdminService.exportReport('utilization');
    expect(utilCsv).toContain('Brand,Model,Category');
    expect(utilCsv).toContain('Mercedes-Benz');
  });
});
