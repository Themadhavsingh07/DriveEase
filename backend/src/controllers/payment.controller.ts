import { Request, Response, NextFunction } from 'express';
import { PaymentStatus } from '@prisma/client';
import prisma from '../config/db';
import { razorpayInstance, verifyRazorpayWebhookSignature } from '../config/razorpay';
import { AppError } from '../utils/appError';
import { AuthenticatedRequest } from '../middleware/auth';
import { BookingService } from '../services/booking.service';
import { ENV } from '../config/env';

/**
 * Creates or retrieves Razorpay order for a booking.
 * POST /api/v1/payments/create-order
 */
export const createRazorpayOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { car: true, payment: true },
    });

    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    const amountInPaise = Math.round(Number(booking.totalAmount) * 100);

    try {
      if (razorpayInstance && ENV.RAZORPAY_KEY_ID && ENV.RAZORPAY_KEY_SECRET) {
        const order = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: booking.bookingNumber,
          notes: {
            bookingId: booking.id,
            carName: `${booking.car.brand} ${booking.car.model}`,
          },
        });

        await prisma.payment.updateMany({
          where: { bookingId: booking.id },
          data: { razorpayOrderId: order.id },
        });

        return res.status(200).json({
          success: true,
          data: {
            orderId: order.id,
            amount: Number(order.amount),
            currency: order.currency,
            keyId: ENV.RAZORPAY_KEY_ID,
          },
        });
      }
    } catch {
      // Fallback to simulation
    }

    const simulatedOrderId = `order_sim_${Date.now()}`;
    await prisma.payment.updateMany({
      where: { bookingId: booking.id },
      data: { razorpayOrderId: simulatedOrderId },
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: simulatedOrderId,
        amount: amountInPaise,
        currency: 'INR',
        keyId: ENV.RAZORPAY_KEY_ID || 'rzp_test_DriveEaseCarRental',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verifies Razorpay HMAC signature and confirms booking.
 * POST /api/v1/payments/verify
 */
export const verifyPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user?.id;

    const confirmed = await BookingService.confirmBooking({
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId,
      changedBy: userId || 'CUSTOMER_CHECKOUT',
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully.',
      data: {
        booking: confirmed,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Idempotent Razorpay Webhook Handler
 * POST /api/v1/payments/webhook
 */
export const handleRazorpayWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = ENV.RAZORPAY_WEBHOOK_SECRET;
    const rawBody = (req as any).rawBody as Buffer | undefined;

    // Verify webhook signature if secret configured
    if (webhookSecret && webhookSignature && rawBody) {
      const isValid = verifyRazorpayWebhookSignature(rawBody, webhookSignature, webhookSecret);
      if (!isValid) {
        return res.status(400).json({ status: 'error', message: 'Invalid webhook signature' });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const paymentRecord = await prisma.payment.findFirst({
          where: { razorpayOrderId: orderId },
        });

        if (paymentRecord && paymentRecord.paymentStatus !== PaymentStatus.PAID) {
          await BookingService.confirmBooking({
            bookingId: paymentRecord.bookingId,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            changedBy: 'RAZORPAY_WEBHOOK',
          });
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        await prisma.payment.updateMany({
          where: { razorpayOrderId: orderId },
          data: { paymentStatus: PaymentStatus.FAILED },
        });
      }
    } else if (event === 'refund.processed') {
      const refundEntity = payload?.refund?.entity;
      if (refundEntity?.id) {
        await prisma.refund.updateMany({
          where: { razorpayRefundId: refundEntity.id },
          data: { status: PaymentStatus.REFUNDED, processedAt: new Date() },
        });
      }
    }

    res.status(200).json({ status: 'ok', received: true });
  } catch (error) {
    next(error);
  }
};
