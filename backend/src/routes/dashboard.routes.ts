import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/overview', DashboardController.getOverview);
router.get('/bookings', DashboardController.getBookings);
router.get('/notifications', DashboardController.getNotifications);
router.patch('/notifications/read-all', DashboardController.markAllNotificationsRead);
router.patch('/notifications/:id/read', DashboardController.markNotificationRead);

export default router;
