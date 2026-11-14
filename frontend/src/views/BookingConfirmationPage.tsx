import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/booking.api';
import { Button } from '../components/common/Button';
import { formatCurrency } from '../lib/utils';
import {
  CheckCircle2,
  Download,
  Calendar,
  Clock,
  MapPin,
  Car as CarIcon,
  ShieldCheck,
  CreditCard,
  FileText,
  User,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  QrCode,
} from 'lucide-react';

export const BookingConfirmationPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Fetch verified booking by reference
  const { data, isLoading, error } = useQuery({
    queryKey: ['booking-confirmation', reference],
    queryFn: () => bookingApi.getBookingByReference(reference || ''),
    enabled: Boolean(reference),
    retry: 1,
  });

  const booking = data?.booking;

  const handleDownloadInvoice = async () => {
    if (!booking) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await bookingApi.downloadInvoice(booking.id, booking.bookingNumber);
    } catch (err: any) {
      setDownloadError(err.message || 'Failed to download invoice. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] py-20 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#2563EB] mx-auto" />
          <h3 className="text-lg font-bold text-[#101B2D]">Verifying Your Reservation...</h3>
          <p className="text-xs text-[#64748B]">Fetching authoritative records from DriveEase server.</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] py-20 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm border border-slate-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-[#101B2D]">Reservation Not Found</h2>
          <p className="text-xs text-[#64748B]">
            We could not find a confirmed reservation matching reference "{reference}".
          </p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Go to My Bookings
          </Button>
        </div>
      </div>
    );
  }

  const car = booking.car;

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Celebration Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-600" />

          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner mb-5">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Booking Confirmed & Payment Verified
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-[#101B2D] mt-3">
            You're All Set to Drive!
          </h1>
          <p className="text-sm text-[#64748B] max-w-lg mx-auto mt-2 leading-relaxed">
            A confirmation receipt and rental voucher have been dispatched to{' '}
            <strong className="text-[#101B2D]">{booking.driverEmail}</strong>.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 bg-[#F8FAFC] border border-slate-200 px-6 py-3 rounded-2xl">
            <span className="text-xs text-[#64748B]">Official Booking Reference:</span>
            <span className="text-base font-mono font-black text-[#101B2D] tracking-wider">
              {booking.bookingNumber}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-100">
            <Button
              variant="primary"
              size="lg"
              disabled={isDownloading}
              onClick={handleDownloadInvoice}
              className="shadow-md flex items-center gap-2"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download Official Tax Invoice (PDF)
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {downloadError && (
            <p className="text-xs text-rose-600 font-medium mt-3">{downloadError}</p>
          )}
        </div>

        {/* Detailed Reservation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vehicle Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
              Reserved Vehicle
            </span>
            {car && (
              <>
                <img
                  src={car.images?.[0]?.url || ''}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-40 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-lg font-black text-[#101B2D]">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Year {car.year} • {car.category} • {car.transmission}
                  </p>
                </div>
              </>
            )}
            <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-[#64748B]">
              <div className="flex justify-between">
                <span>Rental Duration:</span>
                <span className="font-bold text-[#101B2D]">{booking.rentalDays} Day(s)</span>
              </div>
              <div className="flex justify-between">
                <span>Protection Tier:</span>
                <span className="font-bold text-[#2563EB]">{booking.insuranceType}</span>
              </div>
            </div>
          </div>

          {/* Itinerary Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
              Trip Itinerary
            </span>
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[#64748B] font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#2563EB]" /> Pickup Schedule
                </span>
                <p className="font-bold text-[#101B2D] text-sm">
                  {new Date(booking.pickupDateTime).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  • {new Date(booking.pickupDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[11px] text-[#64748B] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  {booking.pickupLocation}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[#64748B] font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#2563EB]" /> Return Schedule
                </span>
                <p className="font-bold text-[#101B2D] text-sm">
                  {new Date(booking.returnDateTime).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  • {new Date(booking.returnDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[11px] text-[#64748B] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  {booking.dropoffLocation}
                </p>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#64748B] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full tank-to-tank fuel policy applies.</span>
            </div>
          </div>

          {/* Payment & Charges Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
              Payment Receipt
            </span>
            <div className="space-y-2 text-xs text-[#64748B]">
              <div className="flex justify-between">
                <span>Base Rental:</span>
                <span className="font-bold text-[#101B2D]">{formatCurrency(Number(booking.basePrice))}</span>
              </div>
              {Number(booking.insurancePrice) > 0 && (
                <div className="flex justify-between">
                  <span>Protection Cover:</span>
                  <span className="font-bold text-[#101B2D]">+{formatCurrency(Number(booking.insurancePrice))}</span>
                </div>
              )}
              {Number(booking.servicesPrice) > 0 && (
                <div className="flex justify-between">
                  <span>In-Cabin Services:</span>
                  <span className="font-bold text-[#101B2D]">+{formatCurrency(Number(booking.servicesPrice))}</span>
                </div>
              )}
              {Number(booking.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({booking.couponCode}):</span>
                  <span>-{formatCurrency(Number(booking.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span className="font-bold text-[#101B2D]">+{formatCurrency(Number(booking.taxAmount))}</span>
              </div>
              <div className="flex justify-between text-amber-700 font-semibold pt-1 border-t border-dashed border-slate-200">
                <span>Refundable Deposit:</span>
                <span>{formatCurrency(Number(booking.securityDeposit))}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-black text-sm text-[#101B2D]">Total Paid:</span>
                <span className="text-xl font-black text-[#101B2D]">
                  {formatCurrency(Number(booking.totalAmount))}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Payment Status: {booking.paymentStatus}
              </div>
              <p className="text-[10px] text-emerald-700 font-mono">
                Txn: {booking.payment?.razorpayPaymentId || booking.payment?.transactionId || 'PAID_DIRECT'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
