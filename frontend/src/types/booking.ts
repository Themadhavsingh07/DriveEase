export interface BookingHoldRequest {
  carId: string;
  pickupDateTime: string;
  returnDateTime: string;
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

export interface DetailedPricingBreakdown {
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
  servicesApplied?: Array<{
    id: string;
    name: string;
    pricePerDay: number;
    isOneTime: boolean;
    quantity: number;
  }>;
}

export interface RazorpayOrderData {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface BookingHoldResponse {
  booking: any;
  pricing: DetailedPricingBreakdown;
  razorpayOrder: RazorpayOrderData;
  holdExpiresAt: string;
}

export interface PaymentVerificationRequest {
  bookingId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface BookingStats {
  total: number;
  upcoming: number;
  active: number;
  completed: number;
  cancelled: number;
}
