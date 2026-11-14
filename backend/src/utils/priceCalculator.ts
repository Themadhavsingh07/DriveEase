export interface PricingInput {
  dailyPrice: number;
  securityDeposit: number;
  rentalDays: number;
  insuranceType?: 'BASIC' | 'PREMIUM' | 'COMPREHENSIVE';
  services?: Array<{
    id: string;
    name: string;
    pricePerDay: number;
    isOneTime: boolean;
    quantity?: number;
  }>;
  coupon?: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minBookingAmount?: number;
    maxDiscountAmount?: number | null;
  } | null;
}

export interface PricingBreakdown {
  dailyPrice: number;
  rentalDays: number;
  baseAmount: number;
  insuranceType: string;
  insuranceRatePerDay: number;
  insuranceAmount: number;
  servicesAmount: number;
  subtotal: number;
  taxRate: number; // 0.18 for 18% GST
  taxAmount: number;
  discountAmount: number;
  couponCode?: string;
  securityDeposit: number;
  finalPayableAmount: number;
}

export const calculateRentalPricing = (input: PricingInput): PricingBreakdown => {
  const rentalDays = Math.max(1, input.rentalDays);
  const dailyPrice = Number(input.dailyPrice);
  const baseAmount = dailyPrice * rentalDays;

  // Insurance rates
  let insuranceRatePerDay = 0;
  const insuranceType = input.insuranceType || 'BASIC';
  if (insuranceType === 'PREMIUM') {
    insuranceRatePerDay = 500;
  } else if (insuranceType === 'COMPREHENSIVE') {
    insuranceRatePerDay = 800;
  }
  const insuranceAmount = insuranceRatePerDay * rentalDays;

  // Additional services
  let servicesAmount = 0;
  if (input.services && input.services.length > 0) {
    for (const s of input.services) {
      const qty = s.quantity || 1;
      const rate = Number(s.pricePerDay);
      if (s.isOneTime) {
        servicesAmount += rate * qty;
      } else {
        servicesAmount += rate * rentalDays * qty;
      }
    }
  }

  // Taxable subtotal (Base + Insurance + Services)
  const taxableSubtotal = baseAmount + insuranceAmount + servicesAmount;

  // Discount calculation
  let discountAmount = 0;
  if (input.coupon) {
    const minAmt = input.coupon.minBookingAmount || 0;
    if (taxableSubtotal >= minAmt) {
      if (input.coupon.discountType === 'PERCENTAGE') {
        const rawDiscount = (taxableSubtotal * Number(input.coupon.discountValue)) / 100;
        discountAmount = input.coupon.maxDiscountAmount
          ? Math.min(rawDiscount, Number(input.coupon.maxDiscountAmount))
          : rawDiscount;
      } else {
        discountAmount = Number(input.coupon.discountValue);
      }
      discountAmount = Math.min(discountAmount, taxableSubtotal);
    }
  }

  // GST 18% applied to (taxableSubtotal - discount)
  const netTaxable = Math.max(0, taxableSubtotal - discountAmount);
  const taxRate = 0.18;
  const taxAmount = Math.round(netTaxable * taxRate);

  // Security deposit is refundable, added to final payable amount
  const securityDeposit = Number(input.securityDeposit) || 0;

  // Final total
  const finalPayableAmount = netTaxable + taxAmount + securityDeposit;

  return {
    dailyPrice,
    rentalDays,
    baseAmount: Math.round(baseAmount),
    insuranceType,
    insuranceRatePerDay,
    insuranceAmount: Math.round(insuranceAmount),
    servicesAmount: Math.round(servicesAmount),
    subtotal: Math.round(taxableSubtotal),
    taxRate,
    taxAmount,
    discountAmount: Math.round(discountAmount),
    couponCode: input.coupon?.code,
    securityDeposit: Math.round(securityDeposit),
    finalPayableAmount: Math.round(finalPayableAmount),
  };
};
