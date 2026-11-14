import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Car, PricingBreakdown, Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import api from '../../lib/api';
import {
  CheckCircle2,
  CreditCard,
  Banknote,
  Car as CarIcon,
  Calendar,
  MapPin,
  Shield,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Download,
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: Car;
  pickupDateTime: string;
  returnDateTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  insuranceType: 'BASIC' | 'PREMIUM' | 'COMPREHENSIVE';
  selectedServiceIds: string[];
  couponCode?: string;
  breakdown: PricingBreakdown;
  onBookingSuccess?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  car,
  pickupDateTime,
  returnDateTime,
  pickupLocation,
  dropoffLocation,
  insuranceType,
  selectedServiceIds,
  couponCode,
  breakdown,
  onBookingSuccess,
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [driverName, setDriverName] = useState(
    user ? `${user.firstName} ${user.lastName}` : ''
  );
  const [driverEmail, setDriverEmail] = useState(user?.email || '');
  const [driverPhone, setDriverPhone] = useState(user?.phone || '+91 98111 22334');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState(
    user?.drivingLicenseNumber || 'DL-MH01-2024-8899'
  );
  const [notes, setNotes] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'CASH_ON_PICKUP'>(
    'RAZORPAY'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const handleConfirmReservation = async () => {
    if (!acceptedTerms) {
      setErrorMessage('Please accept the rental terms and conditions to proceed.');
      return;
    }
    if (!driverName || !driverEmail || !driverPhone || !driverLicenseNumber) {
      setErrorMessage('Please fill in all mandatory driver details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.post<{ booking: Booking }>('/bookings', {
        carId: car.id,
        pickupDateTime,
        returnDateTime,
        pickupLocation,
        dropoffLocation,
        insuranceType,
        serviceIds: selectedServiceIds,
        couponCode: couponCode || undefined,
        paymentMethod,
        driverName,
        driverEmail,
        driverPhone,
        driverLicenseNumber,
        notes: notes || undefined,
      });

      setConfirmedBooking(res.booking);
      setStep(3); // Confirmation step

      // Celebrate with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      if (onBookingSuccess) {
        onBookingSuccess(res.booking);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to complete booking. Please review your details and retry.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setConfirmedBooking(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={
        step === 3
          ? 'Reservation Confirmed!'
          : `Reserve ${car.brand} ${car.model} (Step ${step} of 2)`
      }
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Driver Details & Review */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Itinerary Summary Strip */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Vehicle</span>
                <span className="text-white font-bold text-sm">
                  {car.brand} {car.model} ({car.year})
                </span>
                <span className="text-sky-400 block mt-0.5">
                  {car.transmission} • {car.fuelType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Duration</span>
                <span className="text-white font-semibold">
                  {breakdown.rentalDays} Days Rental
                </span>
                <span className="text-slate-400 block mt-0.5">
                  {formatDateTime(pickupDateTime)}
                </span>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-700/50 flex justify-between items-center">
                <span className="text-slate-300">Total Payable (all inclusive):</span>
                <span className="text-lg font-black text-white">
                  {formatCurrency(breakdown.finalPayableAmount)}
                </span>
              </div>
            </div>

            {/* Driver Contact Form */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                Primary Driver Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Enter name matching license"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={driverEmail}
                    onChange={(e) => setDriverEmail(e.target.value)}
                    placeholder="For booking confirmation"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Driver's License Number *
                  </label>
                  <input
                    type="text"
                    value={driverLicenseNumber}
                    onChange={(e) => setDriverLicenseNumber(e.target.value)}
                    placeholder="DL-MH01-2024-XXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Special Instructions / Flight Number (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Flight arrives at T2 10:30 AM, please bring child seat installed"
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (!driverName || !driverEmail || !driverPhone || !driverLicenseNumber) {
                    setErrorMessage('Please fill in all mandatory driver fields.');
                    return;
                  }
                  setErrorMessage(null);
                  setStep(2);
                }}
              >
                <span>Continue to Payment Method</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Payment Selection & Policy Agreement */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Select Payment Mode
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Razorpay Online */}
                <div
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'RAZORPAY'
                      ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">Razorpay Secure Online</h5>
                      <p className="text-[11px] text-slate-400">
                        UPI, Cards, NetBanking (Instant Confirmation)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cash on Pickup */}
                <div
                  onClick={() => setPaymentMethod('CASH_ON_PICKUP')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'CASH_ON_PICKUP'
                      ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">Pay at Handover</h5>
                      <p className="text-[11px] text-slate-400">
                        Cash or Card upon car delivery at hub
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions Acceptance */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I agree to the <strong>DriveEase Rental Terms & Policies</strong>, verify that
                  the driver is at least 21 years old with a valid driving license, and acknowledge
                  the 100% refundable security deposit of{' '}
                  <strong className="text-amber-300">
                    {formatCurrency(breakdown.securityDeposit)}
                  </strong>.
                </span>
              </label>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="md" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>Back</span>
              </Button>

              <Button
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                disabled={!acceptedTerms}
                onClick={handleConfirmReservation}
              >
                <span>Authorize & Confirm ({formatCurrency(breakdown.finalPayableAmount)})</span>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Booking Confirmed Screen */}
        {step === 3 && confirmedBooking && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block">
                Booking Reference
              </span>
              <h2 className="text-3xl font-black text-white tracking-wider mt-1">
                {confirmedBooking.bookingNumber}
              </h2>
              <p className="text-sm text-slate-300 mt-2">
                A confirmation receipt has been dispatched to{' '}
                <strong>{confirmedBooking.driverEmail}</strong>.
              </p>
            </div>

            {/* Summary Details */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-left grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block">Vehicle:</span>
                <span className="text-white font-semibold">
                  {car.brand} {car.model}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Paid:</span>
                <span className="text-emerald-400 font-bold">
                  {formatCurrency(confirmedBooking.totalAmount)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Pickup Date:</span>
                <span className="text-slate-200">
                  {formatDateTime(confirmedBooking.pickupDateTime)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Return Date:</span>
                <span className="text-slate-200">
                  {formatDateTime(confirmedBooking.returnDateTime)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  navigate('/dashboard');
                }}
              >
                Go to My Bookings Dashboard
              </Button>
              <Button variant="outline" size="md" onClick={resetAndClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
