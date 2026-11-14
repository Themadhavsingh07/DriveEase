import { Prisma, BookingStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import prisma from '../config/db';
import { AppError } from '../utils/appError';
import { ENV } from '../config/env';
import { BookingConflictService } from './bookingConflict.service';
import { PricingService } from './pricing.service';
import { InvoiceService } from './invoice.service';
import { razorpayInstance, verifyRazorpaySignature } from '../config/razorpay';
import { generateBookingNumber } from '../utils/bookingCode';
import { sendBookingConfirmationEmail } from '../config/mailer';

export interface CreateBookingHoldParams {
  userId: string;
  carId: string;
  pickupDateTime: string | Date;
  returnDateTime: string | Date;
  pickupLocation: string;
  dropoffLocation: string;
  insuranceType?: 'BASIC' | 'PREMIUM' | 'COMPREHENSIVE';
  serviceIds?: string[];
  couponCode?: string;
  driverName: string;
  driverEmail: string;
  driverPhone: string;
  driverLicenseNumber: string;
  notes?: string;
}

export interface ConfirmBookingParams {
  bookingId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  userId?: string;
  changedBy?: string;
}

export interface CancelBookingParams {
  bookingId: string;
  reason: string;
  userId: string;
  isAdmin?: boolean;
}

export class BookingService {
  /**
   * 1. CREATE BOOKING HOLD (10-minute temporary reservation with advisory lock)
   */
  static async createBookingHold(params: CreateBookingHoldParams) {
    const {
      userId,
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
    } = params;

    const pickup = new Date(pickupDateTime);
    const dropoff = new Date(returnDateTime);
    const now = new Date();

    if (isNaN(pickup.getTime()) || isNaN(dropoff.getTime())) {
      throw new AppError('Invalid pickup or return date format.', 400);
    }

    if (pickup < new Date(now.getTime() - 15 * 60 * 1000)) {
      throw new AppError('Pickup date cannot be in the past.', 400);
    }

    if (dropoff <= pickup) {
      throw new AppError('Return date must be strictly after pickup date.', 400);
    }

    // Dynamic price calculation
    const pricing = await PricingService.calculatePrice({
      carId,
      pickupDateTime: pickup,
      returnDateTime: dropoff,
      insuranceType,
      serviceIds,
      couponCode,
      userId,
    });

    const holdMinutes = ENV.BOOKING_HOLD_MINUTES || 10;
    const holdExpiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);
    const bookingNumber = generateBookingNumber();

    // Execute atomic PostgreSQL transaction with advisory lock
    const createdBooking = await prisma.$transaction(async (tx) => {
      // 1. Transaction-level advisory lock & conflict verification
      await BookingConflictService.assertCarAvailable(tx, {
        carId,
        pickupDateTime: pickup,
        returnDateTime: dropoff,
      });

      // 2. Create the Booking in PENDING state with hold expiry
      const booking = await tx.booking.create({
        data: {
          bookingNumber,
          bookingReference: bookingNumber,
          userId,
          carId,
          pickupLocation,
          dropoffLocation,
          pickupDateTime: pickup,
          returnDateTime: dropoff,
          holdExpiresAt,
          rentalDays: pricing.rentalDays,
          dailyPrice: new Prisma.Decimal(pricing.dailyPrice),
          dailyRateSnapshot: new Prisma.Decimal(pricing.dailyRate),
          basePrice: new Prisma.Decimal(pricing.baseAmount),
          baseAmount: new Prisma.Decimal(pricing.baseAmount),
          insuranceType: pricing.insuranceType,
          insurancePrice: new Prisma.Decimal(pricing.insuranceAmount),
          insuranceAmount: new Prisma.Decimal(pricing.insuranceAmount),
          servicesPrice: new Prisma.Decimal(pricing.servicesAmount),
          additionalServiceAmount: new Prisma.Decimal(pricing.servicesAmount),
          pickupDeliveryAmount: new Prisma.Decimal(0),
          taxAmount: new Prisma.Decimal(pricing.taxAmount),
          discountAmount: new Prisma.Decimal(pricing.discountAmount),
          couponCode: pricing.couponCode || null,
          rentalSubtotal: new Prisma.Decimal(pricing.subtotal),
          securityDeposit: new Prisma.Decimal(pricing.securityDeposit),
          totalAmount: new Prisma.Decimal(pricing.finalPayableAmount),
          currency: 'INR',
          bookingStatus: BookingStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          notes,
          driverName,
          driverEmail,
          driverPhone,
          driverLicenseNumber,
          services: {
            create: pricing.servicesApplied.map((s) => {
              const rate = s.pricePerDay;
              const total = s.isOneTime ? rate : rate * pricing.rentalDays;
              return {
                serviceId: s.id,
                quantity: s.quantity,
                pricePerUnit: new Prisma.Decimal(rate),
                totalPrice: new Prisma.Decimal(total),
              };
            }),
          },
          payment: {
            create: {
              amount: new Prisma.Decimal(pricing.finalPayableAmount),
              currency: 'INR',
              paymentMethod: PaymentMethod.RAZORPAY,
              paymentStatus: PaymentStatus.PENDING,
              transactionId: `TXN_${bookingNumber}`,
            },
          },
        },
        include: {
          car: {
            include: {
              images: true,
              category: true,
            },
          },
          services: {
            include: {
              service: true,
            },
          },
          payment: true,
        },
      });

      // 3. Record audit history
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: null,
          toStatus: BookingStatus.PENDING,
          reason: `10-minute temporary reservation hold created. Expires at ${holdExpiresAt.toISOString()}`,
          changedBy: userId,
        },
      });

      return booking;
    });

    // 4. Create Razorpay order (or simulation fallback)
    const amountInPaise = Math.round(pricing.finalPayableAmount * 100);
    let razorpayOrder = {
      orderId: `order_sim_${Date.now()}`,
      amount: amountInPaise,
      currency: 'INR',
      keyId: ENV.RAZORPAY_KEY_ID || 'rzp_test_DriveEaseCarRental',
    };

    try {
      if (razorpayInstance && ENV.RAZORPAY_KEY_ID && ENV.RAZORPAY_KEY_SECRET) {
        const order = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: createdBooking.bookingNumber,
          notes: {
            bookingId: createdBooking.id,
            carName: `${createdBooking.car.brand} ${createdBooking.car.model}`,
          },
        });

        razorpayOrder = {
          orderId: order.id,
          amount: Number(order.amount),
          currency: order.currency,
          keyId: ENV.RAZORPAY_KEY_ID,
        };

        await prisma.payment.updateMany({
          where: { bookingId: createdBooking.id },
          data: { razorpayOrderId: order.id },
        });
      } else {
        await prisma.payment.updateMany({
          where: { bookingId: createdBooking.id },
          data: { razorpayOrderId: razorpayOrder.orderId },
        });
      }
    } catch {
      // In case of network/key errors during order creation, fallback to simulated order
      await prisma.payment.updateMany({
        where: { bookingId: createdBooking.id },
        data: { razorpayOrderId: razorpayOrder.orderId },
      });
    }

    return {
      booking: createdBooking,
      pricing,
      razorpayOrder,
      holdExpiresAt,
    };
  }

  /**
   * 2. CONFIRM BOOKING (Payment verification and invoice generation)
   */
  static async confirmBooking(params: ConfirmBookingParams) {
    const {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId,
      changedBy = 'SYSTEM',
    } = params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        car: true,
        user: true,
      },
    });

    if (!booking) {
      throw new AppError('Booking not found.', 404);
    }

    if (booking.bookingStatus === BookingStatus.CONFIRMED) {
      return booking; // Idempotent return
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new AppError('Cannot confirm a cancelled reservation.', 400);
    }

    // Verify Razorpay signature if provided
    if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const isValid = verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      const isSimulated = razorpayOrderId.startsWith('order_sim_');
      if (!isValid && !isSimulated && ENV.NODE_ENV === 'production') {
        throw new AppError('Cryptographic payment verification failed. Invalid signature.', 400);
      }
    }

    // Confirm inside transaction with lock
    const confirmedBooking = await prisma.$transaction(async (tx) => {
      // Check hold expiry; if expired, re-verify availability before confirming
      if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
        await BookingConflictService.assertCarAvailable(tx, {
          carId: booking.carId,
          pickupDateTime: booking.pickupDateTime,
          returnDateTime: booking.returnDateTime,
          excludeBookingId: booking.id,
        });
      }

      // Update booking
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          holdExpiresAt: null, // Clear hold
        },
        include: {
          car: { include: { images: true, category: true } },
          payment: true,
          services: { include: { service: true } },
          user: true,
        },
      });

      // Update payment
      if (booking.payment) {
        await tx.payment.update({
          where: { bookingId },
          data: {
            paymentStatus: PaymentStatus.PAID,
            razorpayOrderId: razorpayOrderId || booking.payment.razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId || `pay_sim_${Date.now()}`,
            razorpaySignature: razorpaySignature || 'simulated_signature',
            paidAt: new Date(),
          },
        });
      }

      // Record coupon usage if applicable
      if (booking.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: booking.couponCode },
        });
        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { timesUsed: { increment: 1 } },
          });

          await tx.couponUsage.create({
            data: {
              couponId: coupon.id,
              userId: booking.userId,
              bookingId: booking.id,
              discountAmount: booking.discountAmount,
            },
          });
        }
      }

      // Generate tax invoice record
      const invoiceNumber = `INV-${booking.bookingNumber}`;
      await tx.invoice.upsert({
        where: { bookingId: booking.id },
        create: {
          invoiceNumber,
          bookingId: booking.id,
          userId: booking.userId,
          subtotal: booking.rentalSubtotal || booking.basePrice,
          taxAmount: booking.taxAmount,
          securityDeposit: booking.securityDeposit,
          totalAmount: booking.totalAmount,
          status: 'PAID',
        },
        update: {
          status: 'PAID',
          totalAmount: booking.totalAmount,
        },
      });

      // Record in audit history
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: BookingStatus.PENDING,
          toStatus: BookingStatus.CONFIRMED,
          reason: 'Payment verified and reservation confirmed',
          changedBy: changedBy || userId || booking.userId,
        },
      });

      // Notification
      await tx.notification.create({
        data: {
          userId: booking.userId,
          title: 'Booking Confirmed!',
          message: `Your booking ${booking.bookingNumber} for ${booking.car.brand} ${booking.car.model} is confirmed.`,
          type: 'BOOKING',
        },
      });

      return updated;
    });

    // Send confirmation email asynchronously
    sendBookingConfirmationEmail({
      bookingNumber: confirmedBooking.bookingNumber,
      customerName: confirmedBooking.driverName,
      customerEmail: confirmedBooking.driverEmail,
      carName: `${confirmedBooking.car.brand} ${confirmedBooking.car.model}`,
      pickupDate: confirmedBooking.pickupDateTime.toLocaleString('en-IN'),
      returnDate: confirmedBooking.returnDateTime.toLocaleString('en-IN'),
      pickupLocation: confirmedBooking.pickupLocation,
      dropoffLocation: confirmedBooking.dropoffLocation,
      totalAmount: Number(confirmedBooking.totalAmount),
    }).catch(() => {});

    return confirmedBooking;
  }

  /**
   * 3. CANCEL BOOKING (With policy rules and refund computation)
   */
  static async cancelBooking(params: CancelBookingParams) {
    const { bookingId, reason, userId, isAdmin } = params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        car: true,
      },
    });

    if (!booking) {
      throw new AppError('Booking not found.', 404);
    }

    if (!isAdmin && booking.userId !== userId) {
      throw new AppError('Access denied: Cannot cancel another customer’s reservation.', 403);
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new AppError('Booking is already cancelled.', 400);
    }

    if (booking.bookingStatus === BookingStatus.COMPLETED) {
      throw new AppError('Cannot cancel a completed booking.', 400);
    }

    const now = new Date();
    const hoursBeforePickup =
      (new Date(booking.pickupDateTime).getTime() - now.getTime()) / (1000 * 60 * 60);

    if (!isAdmin && hoursBeforePickup < 0) {
      throw new AppError('Cannot cancel a booking after the pickup time has passed.', 400);
    }

    // Cancellation policy calculation:
    // Rental portion = totalAmount - securityDeposit
    // Deposit is ALWAYS 100% refunded
    const totalAmount = Number(booking.totalAmount);
    const securityDeposit = Number(booking.securityDeposit);
    const rentalAmount = Math.max(0, totalAmount - securityDeposit);

    let cancellationFee = 0;
    let refundAmount = totalAmount;

    if (hoursBeforePickup < 24 && hoursBeforePickup >= 0) {
      // Late cancellation: 20% cancellation fee on rental amount
      const feePercent = (ENV.CANCELLATION_LATE_FEE_PERCENTAGE || 20) / 100;
      cancellationFee = Math.round(rentalAmount * feePercent);
      refundAmount = totalAmount - cancellationFee;
    }

    const cancelledBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: BookingStatus.CANCELLED,
          cancellationReason: reason || 'Customer requested cancellation',
          cancellationFee: new Prisma.Decimal(cancellationFee),
          refundAmount: new Prisma.Decimal(refundAmount),
          cancelledAt: now,
          paymentStatus:
            booking.paymentStatus === PaymentStatus.PAID
              ? PaymentStatus.REFUNDED
              : booking.paymentStatus,
        },
        include: {
          car: true,
          payment: true,
        },
      });

      if (booking.payment) {
        await tx.payment.update({
          where: { bookingId },
          data: {
            paymentStatus:
              booking.paymentStatus === PaymentStatus.PAID
                ? cancellationFee > 0
                  ? PaymentStatus.PARTIALLY_REFUNDED
                  : PaymentStatus.REFUNDED
                : booking.payment.paymentStatus,
          },
        });

        // Record official Refund entity
        if (booking.paymentStatus === PaymentStatus.PAID) {
          await tx.refund.create({
            data: {
              bookingId,
              paymentId: booking.payment.id,
              amount: new Prisma.Decimal(refundAmount),
              status: PaymentStatus.REFUNDED,
              reason: reason || 'Customer cancellation',
              razorpayRefundId: `rfnd_sim_${Date.now()}`,
              processedAt: now,
            },
          });
        }
      }

      // Record audit history
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.bookingStatus,
          toStatus: BookingStatus.CANCELLED,
          reason: `Cancelled: ${reason}. Cancellation fee: ₹${cancellationFee}, Refund: ₹${refundAmount}`,
          changedBy: userId,
        },
      });

      // Notification
      await tx.notification.create({
        data: {
          userId: booking.userId,
          title: 'Booking Cancelled',
          message: `Booking ${booking.bookingNumber} was cancelled. Refund of ₹${refundAmount.toLocaleString('en-IN')} initiated.`,
          type: 'BOOKING',
        },
      });

      return updated;
    });

    return {
      booking: cancelledBooking,
      cancellationFee,
      refundAmount,
      hoursBeforePickup: Math.round(hoursBeforePickup * 10) / 10,
    };
  }

  /**
   * 4. GET MY BOOKINGS (With filters and stats)
   */
  static async getMyBookings(userId: string, status?: string) {
    const where: Prisma.BookingWhereInput = { userId };
    const now = new Date();

    if (status === 'UPCOMING') {
      where.bookingStatus = { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] };
      where.pickupDateTime = { gte: now };
    } else if (status === 'ACTIVE') {
      where.bookingStatus = BookingStatus.ACTIVE;
    } else if (status === 'COMPLETED') {
      where.bookingStatus = BookingStatus.COMPLETED;
    } else if (status === 'CANCELLED') {
      where.bookingStatus = BookingStatus.CANCELLED;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        car: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: true,
          },
        },
        payment: true,
        invoice: true,
        services: { include: { service: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Summary statistics
    const allUserBookings = await prisma.booking.findMany({
      where: { userId },
      select: { bookingStatus: true, pickupDateTime: true },
    });

    const stats = {
      total: allUserBookings.length,
      upcoming: allUserBookings.filter(
        (b) =>
          ([BookingStatus.CONFIRMED, BookingStatus.PENDING] as BookingStatus[]).includes(b.bookingStatus) &&
          new Date(b.pickupDateTime) >= now
      ).length,
      active: allUserBookings.filter((b) => b.bookingStatus === BookingStatus.ACTIVE).length,
      completed: allUserBookings.filter((b) => b.bookingStatus === BookingStatus.COMPLETED).length,
      cancelled: allUserBookings.filter((b) => b.bookingStatus === BookingStatus.CANCELLED).length,
    };

    return { bookings, stats };
  }

  /**
   * 5. GET BOOKING BY ID
   */
  static async getBookingById(id: string, userId: string, isAdmin = false) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        car: {
          include: {
            images: true,
            category: true,
          },
        },
        payment: true,
        invoice: true,
        services: { include: { service: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError('Booking not found.', 404);
    }

    if (!isAdmin && booking.userId !== userId) {
      throw new AppError('Forbidden: Access denied to this booking.', 403);
    }

    return booking;
  }

  /**
   * 6. GET BOOKING BY REFERENCE
   */
  static async getBookingByReference(reference: string, userId?: string, isAdmin = false) {
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { bookingNumber: reference },
          { bookingReference: reference },
          { id: reference },
        ],
      },
      include: {
        car: {
          include: {
            images: true,
            category: true,
          },
        },
        payment: true,
        invoice: true,
        services: { include: { service: true } },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError('Booking reference not found.', 404);
    }

    if (userId && !isAdmin && booking.userId !== userId) {
      throw new AppError('Forbidden: Access denied to this booking reference.', 403);
    }

    return booking;
  }

  /**
   * 7. GENERATE PDF INVOICE
   */
  static async generateInvoice(bookingId: string, userId: string, isAdmin = false): Promise<Buffer> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        car: true,
        payment: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError('Booking not found.', 404);
    }

    if (!isAdmin && booking.userId !== userId) {
      throw new AppError('Access denied to invoice.', 403);
    }

    return InvoiceService.generateInvoicePdf({ booking });
  }
}
