import { Router } from 'express';
import { AvailabilityController } from '../controllers/availability.controller';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  checkAvailabilitySchema,
  monthlyCalendarSchema,
  searchAvailableCarsSchema,
} from '../validators/availability.validator';

const router = Router();

// A. Check availability for a specific vehicle and interval
router.post(
  '/availability/check',
  validateBody(checkAvailabilitySchema),
  AvailabilityController.checkAvailability
);

// B. Monthly calendar availability for a specific vehicle
router.get(
  '/availability/cars/:carId/calendar',
  validateQuery(monthlyCalendarSchema),
  AvailabilityController.getMonthlyCalendar
);

// C. Date range availability for a specific vehicle
router.get(
  '/availability/cars/:carId',
  AvailabilityController.getDateRangeAvailability
);

// D. Search all available vehicles across fleet for an interval
router.post(
  '/availability/search',
  validateBody(searchAvailableCarsSchema),
  AvailabilityController.searchAvailableCars
);

router.get(
  '/availability/search',
  AvailabilityController.searchAvailableCars
);

// Legacy route aliases for backward compatibility
router.get('/cars/:id/availability', AvailabilityController.getLegacyCalendar);

export default router;
