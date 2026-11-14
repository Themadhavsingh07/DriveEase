import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../utils/appError';
import { PricingService } from '../services/pricing.service';
import { AuthenticatedRequest } from '../middleware/auth';

export const calculatePrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      carId,
      pickupDateTime,
      returnDateTime,
      insuranceType = 'BASIC',
      serviceIds = [],
      couponCode,
    } = req.body;

    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    const breakdown = await PricingService.calculatePrice({
      carId,
      pickupDateTime,
      returnDateTime,
      insuranceType,
      serviceIds,
      couponCode,
      userId,
    });

    res.status(200).json({
      success: true,
      data: {
        breakdown,
        car: {
          id: breakdown.carId,
          name: breakdown.carName,
        },
        servicesApplied: breakdown.servicesApplied,
        couponApplied: breakdown.couponCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, subtotal } = req.body;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    const validated = await PricingService.validateCouponCode(code, Number(subtotal), userId);

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully.',
      data: validated,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdditionalServices = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const services = await prisma.additionalService.findMany({
      where: { isAvailable: true },
      orderBy: { pricePerDay: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: { services },
    });
  } catch (error) {
    next(error);
  }
};
