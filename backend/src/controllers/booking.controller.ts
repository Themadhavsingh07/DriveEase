import { Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { AuthenticatedRequest } from '../middleware/auth';
import { BookingService } from '../services/booking.service';

/**
 * Creates a 10-minute temporary booking hold with advisory lock and Razorpay order.
 * POST /api/v1/bookings/hold
 */
export const createBookingHold = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Authentication required to create a booking hold.', 401));
    }

    const {
      carId,
      pickupDateTime,
      returnDateTime,
      pickupLocation,
      dropoffLocation,
      insuranceType = 'BASIC',
      serviceIds = [],
      couponCode,
      driverName,
      driverEmail,
      driverPhone,
      driverLicenseNumber,
      notes,
    } = req.body;

    const result = await BookingService.createBookingHold({
      userId,
      carId,
      pickupDateTime,
      returnDateTime,
      pickupLocation,
      dropoffLocation,
      insuranceType,
      serviceIds,
      couponCode,
      driverName,
      driverEmail,
      driverPhone,
      driverLicenseNumber,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Booking hold created successfully. 10-minute reservation locked.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Standard create booking endpoint (creates hold + returns order, or completes cash-on-pickup).
 * POST /api/v1/bookings
 */
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Authentication required to create a booking.', 401));
    }

    const { paymentMethod = 'RAZORPAY', ...rest } = req.body;

    // Create booking hold
    const result = await BookingService.createBookingHold({
      userId,
      ...rest,
    });

    if (paymentMethod === 'CASH_ON_PICKUP') {
      const confirmed = await BookingService.confirmBooking({
        bookingId: result.booking.id,
        userId,
        changedBy: 'CUSTOMER_CASH_ON_PICKUP',
      });

      return res.status(201).json({
        success: true,
        message: 'Booking confirmed with Pay on Pickup!',
        data: {
          booking: confirmed,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking initiated. Please complete payment to confirm.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm a booking after payment
 * POST /api/v1/bookings/:id/confirm
 */
export const confirmBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user?.id;

    const confirmed = await BookingService.confirmBooking({
      bookingId: id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId,
      changedBy: userId,
    });

    res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: {
        booking: confirmed,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/my
 */
export const getMyBookings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AppError('Unauthorized', 401));

    const { status } = req.query as { status?: string };
    const data = await BookingService.getMyBookings(userId, status);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/:id
 */
export const getBookingById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || '';
    const isAdmin = req.user?.role === 'ADMIN';

    const booking = await BookingService.getBookingById(id, userId, isAdmin);

    res.status(200).json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/reference/:reference
 */
export const getBookingByReference = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reference } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    const booking = await BookingService.getBookingByReference(reference, userId, isAdmin);

    res.status(200).json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/bookings/:id/cancel
 */
export const cancelBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id || '';
    const isAdmin = req.user?.role === 'ADMIN';

    const result = await BookingService.cancelBooking({
      bookingId: id,
      reason,
      userId,
      isAdmin,
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Dates are now released.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/:id/invoice
 */
export const getBookingInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || '';
    const isAdmin = req.user?.role === 'ADMIN';

    const pdfBuffer = await BookingService.generateInvoice(id, userId, isAdmin);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="DriveEase-Invoice-${id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
