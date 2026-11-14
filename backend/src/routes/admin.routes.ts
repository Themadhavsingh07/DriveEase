import { Router } from 'express';
import {
  getAdminStats,
  getMonthlyAnalytics,
  exportReports,
  getAllCarsAdmin,
  updateCarStatus,
  getAllUsers,
  getUserById,
  updateUserStatus,
  reviewDocumentStatus,
  getAllBookings,
  getBookingDetailsAdmin,
  updateBookingStatus,
  getSettings,
  updateSettings,
  getAuditLogs,
  getCoupons,
  createCoupon,
} from '../controllers/admin.controller';
import {
  createCar,
  updateCar,
  deleteCar,
} from '../controllers/car.controller';
import { authenticateUser } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';
import { validateBody } from '../middleware/validate';
import { createCarSchema, updateCarSchema } from '../validators/car.validator';

const router = Router();

// Apply auth + requireAdmin to all routes in this router
router.use(authenticateUser, requireAdmin);

// Dashboard & Analytics
router.get('/dashboard', getAdminStats);
router.get('/dashboard/overview', getAdminStats);
router.get('/analytics', getMonthlyAnalytics);
router.get('/reports/export', exportReports);

// Admin Vehicle Fleet Management
router.get('/cars', getAllCarsAdmin);
router.post('/cars', validateBody(createCarSchema), createCar);
router.patch('/cars/:id', validateBody(updateCarSchema), updateCar);
router.patch('/cars/:id/status', updateCarStatus);
router.delete('/cars/:id', deleteCar);

// Admin Customer Management
router.get('/customers', getAllUsers);
router.get('/customers/:id', getUserById);
router.patch('/customers/:id/status', updateUserStatus);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', updateUserStatus);

// Customer Document Review
router.patch('/documents/:id/status', reviewDocumentStatus);

// Bookings Master Control
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingDetailsAdmin);
router.patch('/bookings/:id/status', updateBookingStatus);

// Business Settings & Audit Trail
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);
router.get('/audit-logs', getAuditLogs);

// Promotional Coupons
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);

export default router;
