import { Router } from 'express';
import {
  createBookingHold,
  createBooking,
  confirmBooking,
  getMyBookings,
  getBookingById,
  getBookingByReference,
  cancelBooking,
  getBookingInvoice,
} from '../controllers/booking.controller';
import { authenticateJwt } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createBookingSchema, cancelBookingSchema } from '../validators/booking.validator';

const router = Router();

// Booking hold and creation
router.post('/hold', authenticateJwt, validateBody(createBookingSchema), createBookingHold);
router.post('/', authenticateJwt, validateBody(createBookingSchema), createBooking);
router.post('/:id/confirm', authenticateJwt, confirmBooking);

// Booking queries
router.get('/my', authenticateJwt, getMyBookings);
router.get('/reference/:reference', authenticateJwt, getBookingByReference);
router.get('/:id', authenticateJwt, getBookingById);
router.get('/:id/invoice', authenticateJwt, getBookingInvoice);

// Actions
router.patch('/:id/cancel', authenticateJwt, validateBody(cancelBookingSchema), cancelBooking);

export default router;
