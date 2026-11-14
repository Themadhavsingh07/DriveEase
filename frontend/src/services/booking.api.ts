import { api, getApiUrl } from '../lib/api';
import {
  BookingHoldRequest,
  BookingHoldResponse,
  DetailedPricingBreakdown,
  PaymentVerificationRequest,
  BookingStats,
} from '../types/booking';
import { Booking, AdditionalService } from '../types';

export const bookingApi = {
  /**
   * Calculate dynamic pricing with server-side validation
   */
  calculatePricing: async (params: {
    carId: string;
    pickupDateTime: string;
    returnDateTime: string;
    insuranceType?: 'BASIC' | 'PREMIUM' | 'COMPREHENSIVE';
    serviceIds?: string[];
    couponCode?: string;
  }): Promise<{ breakdown: DetailedPricingBreakdown; servicesApplied: any[]; couponApplied: string | null }> => {
    return api.post('/pricing/calculate', params);
  },

  /**
   * Validate coupon voucher code
   */
  validateCoupon: async (
    code: string,
    subtotal: number
  ): Promise<{
    code: string;
    description?: string;
    discountType: string;
    discountValue: number;
    calculatedDiscount: number;
  }> => {
    return api.post('/coupons/validate', { code, subtotal });
  },

  /**
   * Fetch available in-cabin amenities & additional services
   */
  getAdditionalServices: async (): Promise<AdditionalService[]> => {
    const res = await api.get<{ services: AdditionalService[] }>('/services');
    return res.services || [];
  },

  /**
   * Create temporary 10-minute booking hold with advisory lock
   */
  createBookingHold: async (data: BookingHoldRequest): Promise<BookingHoldResponse> => {
    return api.post('/bookings/hold', data);
  },

  /**
   * Verify Razorpay cryptographic payment signature and confirm booking
   */
  verifyPayment: async (data: PaymentVerificationRequest): Promise<{ booking: Booking }> => {
    return api.post('/payments/verify', data);
  },

  /**
   * Fetch customer bookings with optional status filter
   */
  getMyBookings: async (
    status?: string
  ): Promise<{ bookings: Booking[]; stats: BookingStats }> => {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    return api.get(`/bookings/my${query}`);
  },

  /**
   * Fetch detailed booking by ID
   */
  getBookingById: async (id: string): Promise<{ booking: Booking }> => {
    return api.get(`/bookings/${id}`);
  },

  /**
   * Fetch booking by reference code
   */
  getBookingByReference: async (reference: string): Promise<{ booking: Booking }> => {
    return api.get(`/bookings/reference/${reference}`);
  },

  /**
   * Cancel customer reservation with refund computation
   */
  cancelBooking: async (
    id: string,
    reason: string
  ): Promise<{
    booking: Booking;
    cancellationFee: number;
    refundAmount: number;
    hoursBeforePickup: number;
  }> => {
    return api.patch(`/bookings/${id}/cancel`, { reason });
  },

  /**
   * Download official tax invoice PDF
   */
  downloadInvoice: async (bookingId: string, bookingNumber: string): Promise<void> => {
    const token = localStorage.getItem('driveease_token');
    const response = await fetch(getApiUrl(`/bookings/${bookingId}/invoice`), {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to generate official PDF invoice');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DriveEase-Invoice-${bookingNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
