import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../services/booking.api';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatCurrency } from '../lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  Car as CarIcon,
  ShieldCheck,
  CreditCard,
  Download,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  User,
  Sparkles,
  Loader2,
  History,
} from 'lucide-react';

export const CustomerBookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Cancellation modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['booking-details', id],
    queryFn: () => bookingApi.getBookingById(id || ''),
    enabled: Boolean(id),
  });

  const booking = data?.booking;

  const cancelMutation = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      bookingApi.cancelBooking(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-details', id] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setIsCancelModalOpen(false);
      setCancellationReason('');
    },
    onError: (err: any) => {
      setCancelError(err.message || 'Failed to cancel reservation');
    },
  });

  const handleDownloadInvoice = async () => {
    if (!booking) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await bookingApi.downloadInvoice(booking.id, booking.bookingNumber);
    } catch (err: any) {
      setDownloadError(err.message || 'Failed to download invoice');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 max-w-5xl mx-auto px-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#2563EB] mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#101B2D]">Loading Reservation Details...</h3>
        <p className="text-xs text-[#64748B]">Verifying records from server.</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-20 max-w-md mx-auto px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-black text-[#101B2D]">Reservation Not Found</h2>
        <p className="text-xs text-[#64748B]">
          The requested booking record was not found or you do not have permission to access it.
        </p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Back to My Dashboard
        </Button>
      </div>
    );
  }

  const car = booking.car;
  const isCancellable =
    ['CONFIRMED', 'PENDING'].includes(booking.bookingStatus) &&
    new Date(booking.pickupDateTime) > new Date();

  // Status timeline steps
  const timelineSteps = [
    {
      title: 'Reservation Initiated',
      desc: '10-minute hold & order generated',
      done: true,
      time: new Date(booking.createdAt).toLocaleDateString(),
    },
    {
      title: 'Payment Confirmed',
      desc: 'Payment captured and booking locked',
      done: ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(booking.bookingStatus),
      time: booking.payment?.paidAt ? new Date(booking.payment.paidAt).toLocaleDateString() : undefined,
    },
    {
      title: 'On-Road Active Rental',
      desc: 'Vehicle keys dispatched at hub handover',
      done: ['ACTIVE', 'COMPLETED'].includes(booking.bookingStatus),
      time: new Date(booking.pickupDateTime).toLocaleDateString(),
    },
    {
      title: 'Journey Completed',
      desc: 'Check-in inspection & deposit refund',
      done: booking.bookingStatus === 'COMPLETED',
      time: new Date(booking.returnDateTime).toLocaleDateString(),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#101B2D]"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={isDownloading}
              onClick={handleDownloadInvoice}
              className="flex items-center gap-1.5 text-xs"
            >
              {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Official Invoice (PDF)
            </Button>

            {isCancellable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCancelError(null);
                  setIsCancelModalOpen(true);
                }}
                className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </div>

        {downloadError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {downloadError}
          </div>
        )}

        {/* Booking Summary Strip */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#2563EB]">
                {booking.bookingNumber}
              </span>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  booking.bookingStatus === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : booking.bookingStatus === 'ACTIVE'
                    ? 'bg-blue-100 text-blue-800'
                    : booking.bookingStatus === 'COMPLETED'
                    ? 'bg-purple-100 text-purple-800'
                    : booking.bookingStatus === 'PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {booking.bookingStatus}
              </span>
              <Badge variant="navy" size="sm">
                Payment: {booking.paymentStatus}
              </Badge>
            </div>

            <h1 className="text-2xl font-black text-[#101B2D]">
              {car ? `${car.brand} ${car.model} (${car.year})` : 'Vehicle Itinerary'}
            </h1>
            <p className="text-xs text-[#64748B]">
              Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', { dateStyle: 'full' })}
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs text-[#64748B] block">Total Amount Paid</span>
            <span className="text-3xl font-black text-[#101B2D]">
              {formatCurrency(Number(booking.totalAmount))}
            </span>
            <span className="text-[10px] text-amber-700 block mt-0.5">
              Includes {formatCurrency(Number(booking.securityDeposit))} refundable deposit
            </span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Vehicle, Schedule, Itinerary */}
          <div className="md:col-span-2 space-y-6">
            {/* Vehicle & Hub Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
                Vehicle & Specs
              </span>

              {car && (
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <img
                    src={car.images?.[0]?.url}
                    alt={car.brand}
                    className="w-full sm:w-44 h-28 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="space-y-1 w-full text-xs">
                    <h3 className="text-base font-black text-[#101B2D]">
                      {car.brand} {car.model}
                    </h3>
                    <p className="text-[#64748B]">
                      {car.category} • {car.transmission} • {car.fuelType}
                    </p>
                    <p className="text-[#64748B]">
                      {car.seatingCapacity} Seater • Mileage: {car.mileage}
                    </p>
                    <p className="text-emerald-700 font-medium pt-1">
                      Daily Rate: {formatCurrency(Number(car.dailyPrice))} / day
                    </p>
                  </div>
                </div>
              )}

              {/* Pickup & Return Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[#64748B] font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" /> Pickup Handover
                  </span>
                  <p className="font-bold text-[#101B2D] text-sm">
                    {new Date(booking.pickupDateTime).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    • {new Date(booking.pickupDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {booking.pickupLocation}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[#64748B] font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" /> Return Check-in
                  </span>
                  <p className="font-bold text-[#101B2D] text-sm">
                    {new Date(booking.returnDateTime).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    • {new Date(booking.returnDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {booking.dropoffLocation}
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Booking Lifecycle Timeline */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#2563EB]" /> Reservation Timeline & Status Trail
              </span>

              <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 ml-2 pt-1 text-xs">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`w-4 h-4 rounded-full absolute -left-[31px] top-0 border-2 bg-white ${
                        step.done
                          ? 'border-emerald-600 bg-emerald-600 ring-4 ring-emerald-100'
                          : 'border-slate-300'
                      }`}
                    />
                    <div className="flex justify-between items-baseline">
                      <h4 className={`font-bold ${step.done ? 'text-[#101B2D]' : 'text-slate-400'}`}>
                        {step.title}
                      </h4>
                      {step.time && <span className="text-[11px] text-[#64748B]">{step.time}</span>}
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Driver & Contact Information */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
                Primary Driver Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#64748B]">
                <div>
                  <span className="block text-slate-400 text-[10px]">Full Name:</span>
                  <span className="font-bold text-[#101B2D] text-sm">{booking.driverName}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">Email Address:</span>
                  <span className="font-bold text-[#101B2D]">{booking.driverEmail}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">Phone Number:</span>
                  <span className="font-bold text-[#101B2D]">{booking.driverPhone}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">Driving License Number:</span>
                  <span className="font-bold text-[#101B2D]">{booking.driverLicenseNumber || 'On Record'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Price Breakdown & Payment Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
                Itemized Price Breakdown
              </span>

              <div className="space-y-2.5 text-[#64748B]">
                <div className="flex justify-between">
                  <span>Base Vehicle Rental ({booking.rentalDays} Days):</span>
                  <span className="font-bold text-[#101B2D]">
                    {formatCurrency(Number(booking.baseAmount || booking.basePrice))}
                  </span>
                </div>

                {Number(booking.insuranceAmount || booking.insurancePrice) > 0 && (
                  <div className="flex justify-between">
                    <span>Damage Protection ({booking.insuranceType}):</span>
                    <span className="font-bold text-[#101B2D]">
                      +{formatCurrency(Number(booking.insuranceAmount || booking.insurancePrice))}
                    </span>
                  </div>
                )}

                {Number(booking.additionalServiceAmount || booking.servicesPrice) > 0 && (
                  <div className="flex justify-between">
                    <span>In-Cabin Services & Amenities:</span>
                    <span className="font-bold text-[#101B2D]">
                      +{formatCurrency(Number(booking.additionalServiceAmount || booking.servicesPrice))}
                    </span>
                  </div>
                )}

                {Number(booking.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon ({booking.couponCode}):</span>
                    <span>-{formatCurrency(Number(booking.discountAmount))}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>GST (18% Goods & Services Tax):</span>
                  <span className="font-bold text-[#101B2D]">
                    +{formatCurrency(Number(booking.taxAmount))}
                  </span>
                </div>

                {/* Refundable Deposit Callout */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Refundable Deposit:</span>
                    <span>{formatCurrency(Number(booking.securityDeposit))}</span>
                  </div>
                  <span className="text-[10px] text-amber-700 block leading-tight">
                    Held separately. 100% refunded to source account upon check-in inspection.
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-bold text-[#101B2D]">Total Amount:</span>
                  <span className="text-xl font-black text-[#101B2D]">
                    {formatCurrency(Number(booking.totalAmount))}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Record Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#2563EB]" /> Payment Receipt
              </span>

              <div className="space-y-1.5 text-[#64748B]">
                <div className="flex justify-between">
                  <span>Payment Gateway:</span>
                  <span className="font-bold text-[#101B2D]">Razorpay (Test Mode)</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-600">{booking.paymentStatus}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] pt-1 border-t border-slate-100">
                  <span>Transaction ID:</span>
                  <span className="truncate max-w-[150px]">
                    {booking.payment?.razorpayPaymentId || booking.payment?.transactionId || 'PAID_DIRECT'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Status Card (if cancelled) */}
            {booking.bookingStatus === 'CANCELLED' && (
              <div className="bg-rose-50 rounded-2xl p-6 border border-rose-200 shadow-sm space-y-2 text-xs text-rose-900">
                <h4 className="font-bold flex items-center gap-1.5 text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600" /> Reservation Cancelled
                </h4>
                <p className="text-[11px] text-rose-700">
                  Reason: {booking.cancellationReason || 'Customer requested cancellation'}
                </p>
                {booking.refundAmount && (
                  <p className="font-bold text-emerald-800 pt-1">
                    Refund Amount: {formatCurrency(Number(booking.refundAmount))}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CANCELLATION MODAL */}
      {isCancelModalOpen && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title={`Cancel Reservation: ${booking.bookingNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
              <span className="font-bold block">Cancellation & Refund Notice</span>
              <p className="text-[11px] leading-relaxed">
                Free cancellation is permitted up to 24 hours prior to pickup with 100% refund.
                Your security deposit of {formatCurrency(Number(booking.securityDeposit))} is ALWAYS 100% refunded.
              </p>
            </div>

            <div>
              <label className="font-bold text-[#101B2D] block mb-1">
                Reason for Cancellation *
              </label>
              <textarea
                rows={3}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please state the reason for cancelling..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium"
              />
            </div>

            {cancelError && <p className="text-xs text-rose-600 font-medium">{cancelError}</p>}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsCancelModalOpen(false)}>
                Keep Booking
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!cancellationReason.trim() || cancelMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() =>
                  cancelMutation.mutate({
                    bookingId: booking.id,
                    reason: cancellationReason,
                  })
                }
              >
                {cancelMutation.isPending ? 'Processing...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
