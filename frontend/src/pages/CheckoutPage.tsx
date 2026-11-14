import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../services/booking.api';
import { Car, AdditionalService } from '../types';
import { DetailedPricingBreakdown } from '../types/booking';
import { Button } from '../components/common/Button';
import { formatCurrency } from '../lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Timer,
  CreditCard,
  Tag,
  ArrowRight,
  ArrowLeft,
  User,
  Phone,
  Mail,
  FileText,
  Lock,
  Sparkles,
  Loader2,
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Retrieve state passed from CarDetailsPage or search
  const state = location.state as {
    car?: Car;
    pickupDate?: string;
    pickupTime?: string;
    returnDate?: string;
    returnTime?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    insuranceTier?: 'BASIC' | 'PREMIUM' | 'COMPREHENSIVE';
  } | null;

  const car = state?.car;

  // Checkout step: 1 (Trip), 2 (Driver), 3 (Protection & Services), 4 (Summary & Coupon), 5 (Payment & Hold)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Itinerary
  const [pickupDate, setPickupDate] = useState<string>(
    state?.pickupDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [pickupTime, setPickupTime] = useState<string>(state?.pickupTime || '10:00');
  const [returnDate, setReturnDate] = useState<string>(
    state?.returnDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [returnTime, setReturnTime] = useState<string>(state?.returnTime || '10:00');
  const [pickupLocation, setPickupLocation] = useState<string>(
    state?.pickupLocation || car?.pickupLocation || 'DriveEase Central Hub, Terminal 3 Airport'
  );
  const [dropoffLocation, setDropoffLocation] = useState<string>(
    state?.dropoffLocation || car?.dropoffLocation || 'DriveEase Central Hub, Terminal 3 Airport'
  );

  // Driver details
  const [driverName, setDriverName] = useState<string>(
    user ? `${user.firstName} ${user.lastName}` : ''
  );
  const [driverEmail, setDriverEmail] = useState<string>(user?.email || '');
  const [driverPhone, setDriverPhone] = useState<string>(user?.phone || '');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState<string>(
    user?.drivingLicenseNumber || ''
  );
  const [notes, setNotes] = useState<string>('');

  // Protection and Add-ons
  const [insuranceType, setInsuranceType] = useState<'BASIC' | 'PREMIUM' | 'COMPREHENSIVE'>(
    (state?.insuranceTier?.toUpperCase() as any) || 'BASIC'
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // Coupon
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Pricing state
  const [pricing, setPricing] = useState<DetailedPricingBreakdown | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState<boolean>(false);

  // Hold & Order state
  const [holdBookingId, setHoldBookingId] = useState<string | null>(null);
  const [holdBookingNumber, setHoldBookingNumber] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState<number>(600);
  const [razorpayOrder, setRazorpayOrder] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Fetch available services
  const { data: availableServices = [] } = useQuery<AdditionalService[]>({
    queryKey: ['additional-services'],
    queryFn: bookingApi.getAdditionalServices,
  });

  // Calculate ISO strings for pickup & return
  const pickupDateTime = useMemo(() => {
    return `${pickupDate}T${pickupTime}:00`;
  }, [pickupDate, pickupTime]);

  const returnDateTime = useMemo(() => {
    return `${returnDate}T${returnTime}:00`;
  }, [returnDate, returnTime]);

  // Recalculate price authoritatively whenever vehicle, dates, insurance, services, or coupon changes
  useEffect(() => {
    if (!car?.id) return;

    let isMounted = true;
    const calculate = async () => {
      setIsCalculatingPrice(true);
      try {
        const res = await bookingApi.calculatePricing({
          carId: car.id,
          pickupDateTime,
          returnDateTime,
          insuranceType,
          serviceIds: selectedServiceIds,
          couponCode: appliedCoupon || undefined,
        });

        if (isMounted) {
          setPricing(res.breakdown);
        }
      } catch (err: any) {
        console.error('Pricing calculation failed:', err);
      } finally {
        if (isMounted) setIsCalculatingPrice(false);
      }
    };

    calculate();

    return () => {
      isMounted = false;
    };
  }, [car?.id, pickupDateTime, returnDateTime, insuranceType, selectedServiceIds, appliedCoupon]);

  // 10-minute hold countdown timer
  useEffect(() => {
    if (!holdExpiresAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((holdExpiresAt.getTime() - now) / 1000));
      setHoldSecondsRemaining(diff);

      if (diff <= 0) {
        clearInterval(interval);
        setCheckoutError('Your 10-minute reservation hold has expired. Please refresh to lock the dates again.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  // Handle Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const subtotal = pricing?.subtotal || car?.dailyPrice || 1000;
      const res = await bookingApi.validateCoupon(couponCodeInput.trim(), subtotal);
      setAppliedCoupon(res.code);
      setCouponSuccess(`Coupon ${res.code} applied! Saved ₹${res.calculatedDiscount.toLocaleString()}`);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid or expired coupon');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponSuccess(null);
    setCouponError(null);
  };

  // Step 4 -> Step 5: Lock Booking Hold
  const handleProceedToPayment = async () => {
    if (!car) return;
    setCheckoutError(null);
    setIsProcessingPayment(true);

    try {
      const holdRes = await bookingApi.createBookingHold({
        carId: car.id,
        pickupDateTime,
        returnDateTime,
        pickupLocation,
        dropoffLocation,
        insuranceType,
        serviceIds: selectedServiceIds,
        couponCode: appliedCoupon || undefined,
        driverName,
        driverEmail,
        driverPhone,
        driverLicenseNumber,
        notes,
      });

      setHoldBookingId(holdRes.booking.id);
      setHoldBookingNumber(holdRes.booking.bookingNumber);
      setHoldExpiresAt(new Date(holdRes.holdExpiresAt));
      setRazorpayOrder(holdRes.razorpayOrder);
      setCurrentStep(5);
    } catch (err: any) {
      setCheckoutError(err.message || 'Failed to create reservation hold. Dates may already be reserved.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Launch Razorpay or Simulated Verification
  const handlePayNow = async () => {
    if (!holdBookingId || !razorpayOrder) return;
    setIsProcessingPayment(true);
    setCheckoutError(null);

    // Dynamic Razorpay SDK loading or instant sandbox test execution
    const isMockOrLocal =
      !window.Razorpay ||
      razorpayOrder.orderId.startsWith('order_sim_') ||
      razorpayOrder.keyId.includes('test');

    if (window.Razorpay && !razorpayOrder.orderId.startsWith('order_sim_')) {
      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'DriveEase Car Rental',
        description: `Booking ${holdBookingNumber} - ${car?.brand} ${car?.model}`,
        order_id: razorpayOrder.orderId,
        prefill: {
          name: driverName,
          email: driverEmail,
          contact: driverPhone,
        },
        theme: {
          color: '#101B2D',
        },
        handler: async (response: any) => {
          try {
            await bookingApi.verifyPayment({
              bookingId: holdBookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            navigate(`/booking/confirmation/${holdBookingNumber}`);
          } catch (err: any) {
            setCheckoutError(err.message || 'Cryptographic verification failed.');
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch {
        // Fallback to simulated payment verification
      }
    }

    // Simulated Checkout Verification (Razorpay Test Mode / Local Network)
    try {
      await bookingApi.verifyPayment({
        bookingId: holdBookingId,
        razorpayOrderId: razorpayOrder.orderId,
        razorpayPaymentId: `pay_sim_${Date.now()}`,
        razorpaySignature: 'sig_sim_DriveEaseTestMode',
      });

      navigate(`/booking/confirmation/${holdBookingNumber}`);
    } catch (err: any) {
      setCheckoutError(err.message || 'Payment processing error.');
      setIsProcessingPayment(false);
    }
  };

  if (!car) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] py-16 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm border border-slate-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-black text-[#101B2D]">No Vehicle Selected</h2>
          <p className="text-xs text-[#64748B]">
            Please choose a vehicle from our fleet to start your reservation.
          </p>
          <Button variant="primary" onClick={() => navigate('/cars')}>
            Explore Fleet
          </Button>
        </div>
      </div>
    );
  }

  // Format countdown mm:ss
  const minutesLeft = Math.floor(holdSecondsRemaining / 60);
  const secondsLeft = holdSecondsRemaining % 60;
  const timeFormatted = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Breadcrumb & Step Indicator */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                Instant Reservation
              </span>
              <h1 className="text-2xl font-black text-[#101B2D] mt-0.5">
                Checkout & Confirmation
              </h1>
            </div>

            {/* Hold Timer Widget (visible on step 5) */}
            {currentStep === 5 && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-amber-900">
                <Timer className="w-5 h-5 text-amber-600 animate-pulse" />
                <div className="text-xs">
                  <span className="font-semibold block">Reservation Locked</span>
                  <span className="font-mono font-black text-sm text-amber-700">
                    {timeFormatted} remaining
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Wizard Bar */}
          <div className="grid grid-cols-5 gap-2 pt-6">
            {[
              { num: 1, label: 'Itinerary' },
              { num: 2, label: 'Driver Info' },
              { num: 3, label: 'Protection' },
              { num: 4, label: 'Review' },
              { num: 5, label: 'Payment' },
            ].map((s) => (
              <div key={s.num} className="text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold transition-all ${
                    currentStep === s.num
                      ? 'bg-[#2563EB] text-white shadow-md ring-4 ring-blue-500/20'
                      : currentStep > s.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                    currentStep === s.num ? 'text-[#101B2D]' : 'text-[#64748B]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {checkoutError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="font-medium">{checkoutError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Multi-Step Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* STEP 1: ITINERARY REVIEW */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-lg font-black text-[#101B2D] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#2563EB]" />
                  Step 1: Verify Itinerary & Rental Hubs
                </h3>

                {/* Car Preview */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-slate-200">
                  <img
                    src={car.images?.[0]?.url || ''}
                    alt={`${car.brand} ${car.model}`}
                    className="w-24 h-16 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase">
                      {car.category}
                    </span>
                    <h4 className="text-base font-extrabold text-[#101B2D]">
                      {car.brand} {car.model} ({car.year})
                    </h4>
                    <span className="text-xs text-[#64748B]">
                      {formatCurrency(car.dailyPrice)} / day • {car.seatingCapacity} Seats • {car.transmission}
                    </span>
                  </div>
                </div>

                {/* Dates & Times */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                    <span className="font-bold text-[#101B2D] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#2563EB]" />
                      Pickup Schedule
                    </span>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                    />
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                    <span className="font-bold text-[#101B2D] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#2563EB]" />
                      Return Schedule
                    </span>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                    />
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                    />
                  </div>
                </div>

                {/* Locations */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-[#101B2D] block mb-1">Pickup Hub</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                        placeholder="Pickup location"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-[#101B2D] block mb-1">Return Hub</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={dropoffLocation}
                        onChange={(e) => setDropoffLocation(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                        placeholder="Dropoff location"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button variant="primary" onClick={() => setCurrentStep(2)}>
                    Next: Driver Information <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: DRIVER INFORMATION */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-lg font-black text-[#101B2D] flex items-center gap-2">
                  <User className="w-5 h-5 text-[#2563EB]" />
                  Step 2: Driver & Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-[#101B2D] block mb-1">Full Legal Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                        placeholder="Enter driver's name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#101B2D] block mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={driverEmail}
                        onChange={(e) => setDriverEmail(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                        placeholder="Confirmation email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#101B2D] block mb-1">Phone Number *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#101B2D] block mb-1">Driving License Number *</label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={driverLicenseNumber}
                        onChange={(e) => setDriverLicenseNumber(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                        placeholder="e.g. DL-0420110012345"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-bold text-[#101B2D] block mb-1">Special Notes / Flight Arrival (Optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium"
                    placeholder="Provide any instructions or arrival flight details..."
                  />
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!driverName || !driverEmail || !driverPhone || !driverLicenseNumber}
                    onClick={() => setCurrentStep(3)}
                  >
                    Next: Protection & Add-ons <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: PROTECTION & ADD-ONS */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-lg font-black text-[#101B2D] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                  Step 3: Damage Protection & In-Cabin Amenities
                </h3>

                {/* Protection Tiers */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#101B2D] uppercase block">
                    Choose Your Protection Tier
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        tier: 'BASIC',
                        title: 'Basic Protection',
                        rate: 'Included (₹0)',
                        desc: 'Standard third-party liability cover. Standard excess applies.',
                      },
                      {
                        tier: 'PREMIUM',
                        title: 'Premium Zero-Dep',
                        rate: '₹500 / day',
                        desc: 'Zero-deductible cover for accidental damage, glass & exterior.',
                      },
                      {
                        tier: 'COMPREHENSIVE',
                        title: 'Comprehensive Shield',
                        rate: '₹800 / day',
                        desc: 'Total zero-dep + personal accident cover + 24/7 priority towing.',
                      },
                    ].map((p) => (
                      <div
                        key={p.tier}
                        onClick={() => setInsuranceType(p.tier as any)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          insuranceType === p.tier
                            ? 'border-[#2563EB] bg-blue-50/50 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-extrabold text-[#101B2D] text-xs">{p.title}</h4>
                          <span className="text-[10px] font-bold text-[#2563EB]">{p.rate}</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] leading-relaxed">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Services */}
                {availableServices.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold text-[#101B2D] uppercase block">
                      In-Cabin Amenities & Add-ons
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableServices.map((svc) => {
                        const isSelected = selectedServiceIds.includes(svc.id);
                        return (
                          <div
                            key={svc.id}
                            onClick={() => {
                              setSelectedServiceIds((prev) =>
                                isSelected ? prev.filter((id) => id !== svc.id) : [...prev, svc.id]
                              );
                            }}
                            className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#2563EB] bg-blue-50/40 text-[#101B2D]'
                                : 'border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-xs block">{svc.name}</span>
                              <span className="text-[11px] text-[#64748B]">
                                ₹{Number(svc.pricePerDay).toLocaleString()} {svc.isOneTime ? '(one-time)' : '/ day'}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 text-[#2563EB] rounded cursor-pointer"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                  </Button>
                  <Button variant="primary" onClick={() => setCurrentStep(4)}>
                    Next: Review Price & Coupon <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & COUPON */}
            {currentStep === 4 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-lg font-black text-[#101B2D] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#2563EB]" />
                  Step 4: Review Summary & Apply Discount Coupon
                </h3>

                {/* Coupon Code Section */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-[#101B2D] uppercase flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#2563EB]" />
                    Promotional Coupon Voucher
                  </span>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-900 text-xs">
                      <div>
                        <span className="font-extrabold block">Coupon {appliedCoupon} Active</span>
                        <span className="text-[11px] text-emerald-700">
                          {couponSuccess || 'Discount applied to your booking.'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-emerald-700 underline font-bold hover:text-emerald-900"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="e.g. DRIVE10, FIRSTTRIP"
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase font-semibold"
                      />
                      <Button variant="outline" size="sm" onClick={handleApplyCoupon}>
                        Apply
                      </Button>
                    </div>
                  )}

                  {couponError && <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>}
                </div>

                {/* Final Pre-Hold Review Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 space-y-1 bg-[#F8FAFC]">
                    <span className="text-[#64748B] block font-medium">Driver & Passenger</span>
                    <p className="font-bold text-[#101B2D]">{driverName}</p>
                    <p className="text-[#64748B]">{driverEmail} • {driverPhone}</p>
                    <p className="text-[#64748B]">License: {driverLicenseNumber}</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 space-y-1 bg-[#F8FAFC]">
                    <span className="text-[#64748B] block font-medium">Handover Hubs</span>
                    <p className="font-bold text-[#101B2D]">Pickup: {pickupLocation}</p>
                    <p className="font-bold text-[#101B2D]">Return: {dropoffLocation}</p>
                    <p className="text-[#64748B]">Protection: {insuranceType} Tier</p>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                  </Button>
                  <Button
                    variant="primary"
                    disabled={isProcessingPayment || isCalculatingPrice}
                    onClick={handleProceedToPayment}
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Locking Reservation...
                      </>
                    ) : (
                      <>
                        Lock Hold & Proceed to Payment <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5: PAYMENT & HOLD COUNTDOWN */}
            {currentStep === 5 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#101B2D] flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-600" />
                    Step 5: Secure Payment & Final Confirmation
                  </h3>
                  <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md">
                    Ref: {holdBookingNumber}
                  </span>
                </div>

                {/* 10-Minute Hold Active Banner */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-1.5 text-blue-900">
                  <div className="flex items-center gap-2 font-bold">
                    <Timer className="w-4 h-4 text-[#2563EB]" />
                    Temporary 10-Minute Reservation Hold Active
                  </div>
                  <p className="text-[11px] leading-relaxed text-blue-800">
                    This vehicle has been locked exclusively for you until{' '}
                    <strong>{holdExpiresAt ? new Date(holdExpiresAt).toLocaleTimeString() : '10 minutes'}</strong>.
                    No other customer can reserve this car during your checkout window.
                  </p>
                </div>

                {/* Payment Gateway Box */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#101B2D] text-white flex items-center justify-center mx-auto shadow-sm">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-[#101B2D]">
                      Razorpay Gateway (Test Mode / Instant Simulation)
                    </h4>
                    <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-0.5">
                      Supports UPI, Cards, NetBanking, and Wallets with cryptographic HMAC verification.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="lg"
                      disabled={isProcessingPayment || holdSecondsRemaining <= 0}
                      onClick={handlePayNow}
                      className="w-full sm:w-auto px-8 shadow-md"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying Payment...
                        </>
                      ) : (
                        `Pay ${formatCurrency(pricing?.finalPayableAmount || 0)} & Confirm Booking`
                      )}
                    </Button>
                  </div>

                  <p className="text-[10px] text-[#64748B] flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" /> 256-bit SSL encrypted & Razorpay verified checkout
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Sticky Cost Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24 space-y-4 text-xs">
              <h4 className="font-extrabold text-[#101B2D] uppercase tracking-wider text-xs pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Rental Cost Summary</span>
                {isCalculatingPrice && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />}
              </h4>

              {/* Itemized Calculation */}
              <div className="space-y-2.5 text-[#64748B]">
                <div className="flex justify-between">
                  <span>
                    Base Vehicle Rental ({pricing?.rentalDays || 1} {pricing?.rentalDays === 1 ? 'day' : 'days'})
                  </span>
                  <span className="font-bold text-[#101B2D]">
                    {formatCurrency(pricing?.baseAmount || (car.dailyPrice * (pricing?.rentalDays || 1)))}
                  </span>
                </div>

                {pricing && pricing.insuranceAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Protection Cover ({insuranceType})</span>
                    <span className="font-bold text-[#101B2D]">
                      +{formatCurrency(pricing.insuranceAmount)}
                    </span>
                  </div>
                )}

                {pricing && pricing.servicesAmount > 0 && (
                  <div className="flex justify-between">
                    <span>In-Cabin Amenities & Services</span>
                    <span className="font-bold text-[#101B2D]">
                      +{formatCurrency(pricing.servicesAmount)}
                    </span>
                  </div>
                )}

                {pricing && pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount ({pricing.couponCode || 'PROMO'})</span>
                    <span>-{formatCurrency(pricing.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Goods & Services Tax (18% GST)</span>
                  <span className="font-bold text-[#101B2D]">
                    +{formatCurrency(pricing?.taxAmount || 0)}
                  </span>
                </div>

                {/* Refundable deposit highlighted */}
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Refundable Security Deposit</span>
                    <span>{formatCurrency(pricing?.securityDeposit || car.securityDeposit)}</span>
                  </div>
                  <span className="text-[10px] text-amber-700 block leading-tight">
                    Held separately. 100% refunded to original source upon return check-in.
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-[#101B2D] uppercase block">
                    Total Payable Amount
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    Inclusive of taxes & deposit
                  </span>
                </div>
                <span className="text-2xl font-black text-[#101B2D]">
                  {formatCurrency(pricing?.finalPayableAmount || car.dailyPrice + car.securityDeposit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
