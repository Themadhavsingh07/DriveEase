import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import { AppError } from '../utils/appError';
import { calculateRentalDays } from '../utils/dateUtils';
import { ENV } from '../config/env';

export interface CalculatePricingParams {
  carId: string;
  pickupDateTime: string | Date;
  returnDateTime: string | Date;
  insuranceType?: 'BASIC' | 'PREMIUM' | 'COMPREHENSIVE';
  serviceIds?: string[];
  couponCode?: string;
  userId?: string;
}

export interface DetailedPricingBreakdown {
  // Common / Canonical fields
  carId: string;
  carName: string;
  dailyPrice: number;
  dailyRate: number;
  rentalDays: number;
  baseAmount: number;
  baseRental: number;
  insuranceType: 'BASIC' | 'PREMIUM' | 'COMPREHENSIVE';
  insuranceRatePerDay: number;
  insuranceAmount: number;
  insuranceFee: number;
  servicesAmount: number;
  servicesFee: number;
  subtotal: number;
  grossAmount: number;
  discountAmount: number;
  couponDiscount: number;
  couponCode?: string | null;
  netTaxable: number;
  netTaxableAmount: number;
  taxRate: number;
  taxAmount: number;
  securityDeposit: number;
  finalPayableAmount: number;
  totalPayable: number;
  currency: string;
  servicesApplied: Array<{
    id: string;
    name: string;
    pricePerDay: number;
    isOneTime: boolean;
    quantity: number;
  }>;
}

export class PricingService {
  /**
   * Authoritatively computes rental pricing on the server.
   */
  static async calculatePrice(params: CalculatePricingParams): Promise<DetailedPricingBreakdown> {
    const {
      carId,
      pickupDateTime,
      returnDateTime,
      insuranceType = 'BASIC',
      serviceIds = [],
      couponCode,
      userId,
    } = params;

    const pickup = new Date(pickupDateTime);
    const dropoff = new Date(returnDateTime);

    if (isNaN(pickup.getTime()) || isNaN(dropoff.getTime())) {
      throw new AppError('Invalid pickup or return date format.', 400);
    }

    if (dropoff <= pickup) {
      throw new AppError('Return date must be strictly after pickup date.', 400);
    }

    const rentalDays = calculateRentalDays(pickup, dropoff);

    const car = await prisma.car.findUnique({
      where: { id: carId },
      select: {
        id: true,
        brand: true,
        model: true,
        dailyPrice: true,
        securityDeposit: true,
        minRentalDays: true,
        maxRentalDays: true,
        isActive: true,
      },
    });

    if (!car || !car.isActive) {
      throw new AppError('Vehicle not found or inactive.', 404);
    }

    if (rentalDays < car.minRentalDays) {
      throw new AppError(`Minimum rental duration is ${car.minRentalDays} day(s).`, 400);
    }

    if (rentalDays > car.maxRentalDays) {
      throw new AppError(`Maximum rental duration is ${car.maxRentalDays} day(s).`, 400);
    }

    const dailyPrice = Number(car.dailyPrice);
    const baseAmount = dailyPrice * rentalDays;

    // Insurance computation
    let insuranceRatePerDay = 0;
    if (insuranceType === 'PREMIUM') {
      insuranceRatePerDay = 500;
    } else if (insuranceType === 'COMPREHENSIVE') {
      insuranceRatePerDay = 800;
    }
    const insuranceAmount = insuranceRatePerDay * rentalDays;

    // Additional services computation
    let servicesApplied: Array<{
      id: string;
      name: string;
      pricePerDay: number;
      isOneTime: boolean;
      quantity: number;
    }> = [];

    let servicesAmount = 0;
    if (serviceIds && serviceIds.length > 0) {
      const dbServices = await prisma.additionalService.findMany({
        where: {
          id: { in: serviceIds },
          isAvailable: true,
        },
      });

      servicesApplied = dbServices.map((s) => {
        const rate = Number(s.pricePerDay);
        const cost = s.isOneTime ? rate : rate * rentalDays;
        servicesAmount += cost;
        return {
          id: s.id,
          name: s.name,
          pricePerDay: rate,
          isOneTime: s.isOneTime,
          quantity: 1,
        };
      });
    }

    // Taxable gross subtotal (Base + Insurance + Services)
    const subtotal = baseAmount + insuranceAmount + servicesAmount;

    // Coupon calculation
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;

    if (couponCode && couponCode.trim()) {
      const codeClean = couponCode.trim().toUpperCase();
      const dbCoupon = await prisma.coupon.findUnique({
        where: { code: codeClean },
      });

      if (dbCoupon && dbCoupon.isActive) {
        const now = new Date();
        const isNotExpired = !dbCoupon.expiryDate || dbCoupon.expiryDate > now;
        const isUnderGlobalLimit = !dbCoupon.usageLimit || dbCoupon.timesUsed < dbCoupon.usageLimit;

        let isUnderUserLimit = true;
        if (userId) {
          const userUsages = await prisma.couponUsage.count({
            where: { couponId: dbCoupon.id, userId },
          });
          if (userUsages > 0) {
            // Once per user by default
            isUnderUserLimit = false;
          }
        }

        const meetsMinAmount = subtotal >= Number(dbCoupon.minBookingAmount);

        if (isNotExpired && isUnderGlobalLimit && isUnderUserLimit && meetsMinAmount) {
          appliedCouponCode = dbCoupon.code;
          if (dbCoupon.discountType === 'PERCENTAGE') {
            const raw = (subtotal * Number(dbCoupon.discountValue)) / 100;
            discountAmount = dbCoupon.maxDiscountAmount
              ? Math.min(raw, Number(dbCoupon.maxDiscountAmount))
              : raw;
          } else {
            discountAmount = Number(dbCoupon.discountValue);
          }
          discountAmount = Math.min(discountAmount, subtotal);
        }
      }
    }

    // Net taxable amount
    const netTaxable = Math.max(0, subtotal - discountAmount);

    // GST Tax 18%
    const taxRate = ENV.TAX_RATE || 0.18;
    const taxAmount = Math.round(netTaxable * taxRate);

    // Security deposit (held separately, 100% refundable)
    const securityDeposit = Number(car.securityDeposit) || 0;

    // Final total
    const finalPayableAmount = netTaxable + taxAmount + securityDeposit;

    return {
      carId: car.id,
      carName: `${car.brand} ${car.model}`,
      dailyPrice,
      dailyRate: dailyPrice,
      rentalDays,
      baseAmount: Math.round(baseAmount),
      baseRental: Math.round(baseAmount),
      insuranceType,
      insuranceRatePerDay,
      insuranceAmount: Math.round(insuranceAmount),
      insuranceFee: Math.round(insuranceAmount),
      servicesAmount: Math.round(servicesAmount),
      servicesFee: Math.round(servicesAmount),
      subtotal: Math.round(subtotal),
      grossAmount: Math.round(subtotal),
      discountAmount: Math.round(discountAmount),
      couponDiscount: Math.round(discountAmount),
      couponCode: appliedCouponCode,
      netTaxable: Math.round(netTaxable),
      netTaxableAmount: Math.round(netTaxable),
      taxRate,
      taxAmount,
      securityDeposit: Math.round(securityDeposit),
      finalPayableAmount: Math.round(finalPayableAmount),
      totalPayable: Math.round(finalPayableAmount),
      currency: 'INR',
      servicesApplied,
    };
  }

  /**
   * Validates a coupon code independently.
   */
  static async validateCouponCode(code: string, subtotal: number, userId?: string) {
    if (!code || !code.trim()) {
      throw new AppError('Coupon code is required.', 400);
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError('Invalid or inactive coupon code.', 400);
    }

    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      throw new AppError('Coupon code has expired.', 400);
    }

    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit has been reached.', 400);
    }

    if (userId) {
      const userUsages = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId },
      });
      if (userUsages > 0) {
        throw new AppError('You have already redeemed this coupon.', 400);
      }
    }

    if (Number(subtotal) < Number(coupon.minBookingAmount)) {
      throw new AppError(
        `Minimum booking subtotal of ₹${Number(coupon.minBookingAmount).toLocaleString()} required for this coupon.`,
        400
      );
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      const raw = (Number(subtotal) * Number(coupon.discountValue)) / 100;
      discount = coupon.maxDiscountAmount
        ? Math.min(raw, Number(coupon.maxDiscountAmount))
        : raw;
    } else {
      discount = Number(coupon.discountValue);
    }

    discount = Math.min(discount, Number(subtotal));

    return {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      calculatedDiscount: Math.round(discount),
    };
  }
}
