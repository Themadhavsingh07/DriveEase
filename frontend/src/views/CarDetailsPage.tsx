import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { mockCars } from '../data/cars';
import { Car } from '../types';
import { VehicleGallery } from '../components/cars/VehicleGallery';
import { VehicleSpecifications } from '../components/cars/VehicleSpecifications';
import { RelatedVehicles } from '../components/cars/RelatedVehicles';
import { BookingPreviewModal } from '../components/cars/BookingPreviewModal';
import { WishlistButton } from '../components/cars/WishlistButton';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { formatCurrency } from '../lib/utils';
import { AvailabilityCalendar } from '../components/availability/AvailabilityCalendar';
import { DateRangePicker } from '../components/availability/DateRangePicker';
import { TimeSelector } from '../components/availability/TimeSelector';
import { AvailabilityStatus, AvailabilityState } from '../components/availability/AvailabilityStatus';
import availabilityApi from '../services/availability.api';
import {
  Star,
  ShieldCheck,
  Check,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  ArrowLeft,
  Share2,
  Car as CarIcon,
  ChevronRight,
  Sparkles,
  Compass,
  FileCheck2,
  Fuel,
  Gauge,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const CarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Query car details from PostgreSQL backend API
  const { data: serverCar, isLoading } = useQuery({
    queryKey: ['car', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await api.get<{ car?: Car }>(`/cars/${id}`);
        return res?.car || (res as unknown as Car) || null;
      } catch (err) {
        console.warn('Backend fetch for car detail fallback to mock data:', err);
        return null;
      }
    },
    enabled: !!id,
  });

  // Resolve vehicle from backend API or fallback to centralized mock data
  const car: Car | undefined = useMemo(() => {
    if (serverCar && (serverCar.id || serverCar.brand)) {
      return serverCar;
    }
    return mockCars.find((c) => c.id === id);
  }, [serverCar, id]);

  // Share notification state
  const [copied, setCopied] = useState(false);

  // Booking preview state
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const returnDay = new Date(today);
  returnDay.setDate(returnDay.getDate() + 4);

  const formatDateInput = (d: Date) => d.toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState(formatDateInput(tomorrow));
  const [returnDate, setReturnDate] = useState(formatDateInput(returnDay));
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('18:00');
  const [insuranceTier, setInsuranceTier] = useState<'basic' | 'premium'>('premium');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Live Availability Check State
  const [availabilityState, setAvailabilityState] = useState<AvailabilityState>('idle');
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  // Automatically check availability whenever dates or times change
  useEffect(() => {
    if (!car?.id || !pickupDate || !returnDate) {
      setAvailabilityState('idle');
      return;
    }

    let isMounted = true;
    const checkAvailability = async () => {
      try {
        setAvailabilityState('checking');
        const pickupISO = `${pickupDate}T${pickupTime}:00+05:30`;
        const returnISO = `${returnDate}T${returnTime}:00+05:30`;

        const res = await availabilityApi.checkAvailability({
          carId: car.id,
          pickupDateTime: pickupISO,
          returnDateTime: returnISO,
        });

        if (!isMounted) return;
        if (res.available) {
          setAvailabilityState('available');
          setAvailabilityMessage(res.message);
        } else {
          setAvailabilityState('unavailable');
          setAvailabilityMessage(res.message);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setAvailabilityState('error');
        setAvailabilityMessage(err.message || 'Unable to check vehicle availability.');
      }
    };

    const timer = setTimeout(checkAvailability, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [car?.id, pickupDate, pickupTime, returnDate, returnTime]);

  // Calculate rental duration in days
  const rentalDays = useMemo(() => {
    try {
      const p = new Date(pickupDate);
      const r = new Date(returnDate);
      const diffTime = r.getTime() - p.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  }, [pickupDate, returnDate]);

  // Handle Share button
  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Link copied to clipboard!');
    }
  };

  // Loading state while querying server
  if (isLoading && !car) {
    return (
      <div className="py-32 max-w-4xl mx-auto px-4 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#2563EB] mx-auto" />
        <p className="text-sm font-semibold text-[#64748B]">
          Fetching vehicle details from DriveEase fleet...
        </p>
      </div>
    );
  }

  // If vehicle ID not found
  if (!car) {
    return (
      <div className="py-20 max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <CarIcon className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#101B2D]">
            Vehicle Not Found
          </h2>
          <p className="text-sm text-[#64748B] mt-2 max-w-md mx-auto">
            The vehicle ID you requested could not be located in our active fleet. It may have been decommissioned or reserved.
          </p>
        </div>
        <div>
          <Link to="/cars">
            <Button variant="primary" size="md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Browse Available Fleet</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Price calculations
  const insuranceRatePerDay = insuranceTier === 'premium' ? 500 : 0;
  const basePrice = car.dailyPrice * rentalDays;
  const insuranceTotal = insuranceRatePerDay * rentalDays;
  const gstAmount = Math.round((basePrice + insuranceTotal) * 0.18);
  const grandTotal = basePrice + insuranceTotal + gstAmount + car.securityDeposit;

  const isAvailable = car.isAvailable !== false && car.availabilityStatus !== 'Reserved';

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb Navigation Strip */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between">
        <ol className="flex items-center gap-1.5 text-xs text-[#64748B] font-semibold">
          <li>
            <Link to="/" className="hover:text-[#101B2D] transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          </li>
          <li>
            <Link to="/cars" className="hover:text-[#101B2D] transition-colors">
              Explore Cars
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          </li>
          <li className="text-[#101B2D] font-bold truncate max-w-[200px] sm:max-w-none">
            {car.brand} {car.model}
          </li>
        </ol>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1E293B] shadow-xs transition-colors cursor-pointer"
            title="Share this vehicle"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Main Vehicle Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest">
              {car.brand}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-[#64748B] font-semibold">
              Model Year {car.year}
            </span>
            <Badge variant="navy">{car.category}</Badge>
            {isAvailable ? (
              <Badge variant="success">Available Now</Badge>
            ) : (
              <Badge variant="danger">Reserved</Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#101B2D]">
            {car.brand} {car.model}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            {car.pickupLocation} • Verified DriveEase Fleet Standard
          </p>
        </div>

        {/* Rating and Wishlist Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold shadow-xs">
            <Star className="w-4 h-4 fill-current text-amber-500" />
            <span>{car.rating ? car.rating.toFixed(1) : '4.8'}</span>
            <span className="text-xs text-[#64748B] font-normal">
              ({car.reviewCount || 24} Verified Reviews)
            </span>
          </div>

          <WishlistButton carId={car.id} size="lg" showLabel />
        </div>
      </div>

      {/* Main Content Layout: Left Media & Specs | Right Sticky Reservation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column (8 cols): Gallery, Overview, Highlights, Specs, Amenities, Policies */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          {/* Gallery Component */}
          <VehicleGallery
            images={car.images}
            carTitle={`${car.brand} ${car.model}`}
          />

          {/* Interactive Availability Calendar (Phase 4 Engine) */}
          <AvailabilityCalendar
            carId={car.id}
            pickupDate={pickupDate}
            returnDate={returnDate}
            onDateRangeSelect={(p, r) => {
              setPickupDate(p);
              if (r) setReturnDate(r);
            }}
            onClearDates={() => {
              setPickupDate('');
              setReturnDate('');
            }}
          />

          {/* Vehicle Overview */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#101B2D]">
              Vehicle Overview & Driving Character
            </h3>
            <p className="text-sm text-[#475569] leading-relaxed">
              {car.description}
            </p>

            {/* Highlights Bullets */}
            {car.highlights && car.highlights.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <h4 className="text-xs font-bold text-[#101B2D] uppercase tracking-wider">
                  Key Engineering Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1E293B]">
                  {car.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suitable For Recommendations */}
            {car.suitableFor && car.suitableFor.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <h4 className="text-xs font-bold text-[#101B2D] uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  Recommended Driving Scenarios
                </h4>
                <div className="flex flex-wrap gap-2">
                  {car.suitableFor.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Technical Specifications Grid Component */}
          <VehicleSpecifications car={car} />

          {/* Features & Amenities */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#101B2D]">
                Features & Onboard Amenities
              </h3>
              <span className="text-xs font-semibold text-[#2563EB]">
                {car.features.length} Included Features
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#1E293B]">
              {car.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rental Policies & Hub Instructions */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-[#101B2D]">
              Rental Policies & Pickup Guidelines
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                <span className="text-[#2563EB] font-bold block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Pickup & Drop-off Hub
                </span>
                <p className="font-bold text-[#101B2D] text-sm">
                  {car.pickupLocation}
                </p>
                <p className="text-[#64748B]">
                  {car.pickupInstructions || 'Instant contactless key handover with driving license validation.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                <span className="text-amber-800 font-bold block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Refundable Security Deposit
                </span>
                <p className="font-bold text-[#101B2D] text-sm">
                  {formatCurrency(car.securityDeposit)}
                </p>
                <p className="text-[#64748B]">
                  100% segregated and refunded automatically within 48 hours of vehicle return inspection.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                <span className="text-slate-700 font-bold block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5" />
                  Mileage Policy
                </span>
                <p className="font-bold text-[#101B2D]">
                  {car.mileagePolicy || 'Unlimited Kilometers included'}
                </p>
                <p className="text-[#64748B]">
                  Drive with peace of mind across state borders without per-km penalties.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                <span className="text-emerald-700 font-bold block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5" />
                  Fuel Policy
                </span>
                <p className="font-bold text-[#101B2D]">
                  {car.fuelPolicy || 'Full-to-Full Policy'}
                </p>
                <p className="text-[#64748B]">
                  Vehicle is provided with full fuel/charge. Please return at the same level.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-[#475569] flex items-start gap-2.5">
              <FileCheck2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#101B2D]">Cancellation Guarantee:</strong>{' '}
                {car.cancellationPolicy || 'Free cancellation up to 24 hours prior to scheduled pickup.'}{' '}
                Zero cancellation penalty fees when rescheduled online.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Sticky Booking Preview Panel */}
        <aside id="book" className="lg:col-span-5 xl:col-span-4 sticky top-24">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xl space-y-6">
            {/* Price Header */}
            <div className="pb-4 border-b border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] block uppercase tracking-wider">
                  Daily Rental Rate
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black text-[#101B2D]">
                    {formatCurrency(car.dailyPrice)}
                  </span>
                  <span className="text-xs text-[#64748B] font-semibold">/ day</span>
                </div>
              </div>
              <Badge variant="blue">{car.category}</Badge>
            </div>

            {/* Interactive Date & Time Selection (Phase 4) */}
            <div className="space-y-3.5 text-xs">
              <label className="font-bold text-[#101B2D] uppercase tracking-wider block">
                Select Rental Dates & Times
              </label>

              {/* Date Pickers */}
              <DateRangePicker
                pickupDate={pickupDate}
                returnDate={returnDate}
                onPickupChange={setPickupDate}
                onReturnChange={setReturnDate}
              />

              {/* Time Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <TimeSelector
                  label="Pickup Time"
                  value={pickupTime}
                  onChange={setPickupTime}
                />
                <TimeSelector
                  label="Return Time"
                  value={returnTime}
                  onChange={setReturnTime}
                />
              </div>

              {/* Real-Time Availability Status Indicator */}
              <AvailabilityStatus
                state={availabilityState}
                message={availabilityMessage}
                rentalDays={rentalDays}
              />
            </div>

            {/* Damage Protection Options */}
            <div className="space-y-2.5 text-xs">
              <label className="font-bold text-[#101B2D] uppercase tracking-wider block">
                Damage Protection Tier
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInsuranceTier('basic')}
                  className={`p-3 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                    insuranceTier === 'basic'
                      ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] ring-2 ring-blue-500/20'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-slate-300'
                  }`}
                >
                  <span className="block font-bold">Basic Cover</span>
                  <span className="text-[10px] block mt-0.5">Included (₹0)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInsuranceTier('premium')}
                  className={`p-3 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                    insuranceTier === 'premium'
                      ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] ring-2 ring-blue-500/20'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-slate-300'
                  }`}
                >
                  <span className="block font-bold">Premium Zero-Dep</span>
                  <span className="text-[10px] block mt-0.5">₹500 / day</span>
                </button>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-[#64748B]">
              <div className="flex justify-between">
                <span>Base Rate ({rentalDays} {rentalDays === 1 ? 'day' : 'days'} × {formatCurrency(car.dailyPrice)})</span>
                <span className="font-bold text-[#101B2D]">
                  {formatCurrency(basePrice)}
                </span>
              </div>

              {insuranceTotal > 0 && (
                <div className="flex justify-between">
                  <span>Zero-Dep Protection</span>
                  <span className="font-bold text-[#101B2D]">
                    +{formatCurrency(insuranceTotal)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST (18% Goods & Services Tax)</span>
                <span className="font-bold text-[#101B2D]">
                  +{formatCurrency(gstAmount)}
                </span>
              </div>

              <div className="flex justify-between text-amber-700 font-semibold pt-1 border-t border-dashed border-slate-200">
                <span>100% Refundable Security Deposit</span>
                <span>{formatCurrency(car.securityDeposit)}</span>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-[#101B2D] uppercase block">
                    Total Estimated Amount
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    Includes {formatCurrency(car.securityDeposit)} deposit
                  </span>
                </div>
                <span className="text-2xl font-black text-[#101B2D]">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* CTA Continue to Booking */}
            <Button
              variant="primary"
              size="lg"
              disabled={
                availabilityState === 'unavailable' ||
                availabilityState === 'checking' ||
                !pickupDate ||
                !returnDate
              }
              className={`w-full font-bold shadow-md cursor-pointer ${
                availabilityState === 'unavailable'
                  ? 'bg-slate-300 text-slate-500 hover:bg-slate-300 cursor-not-allowed shadow-none'
                  : ''
              }`}
              onClick={() => {
                navigate(`/booking/checkout?carId=${car.id}`, {
                  state: {
                    car,
                    pickupDate,
                    pickupTime,
                    returnDate,
                    returnTime,
                    pickupLocation: car.pickupLocation,
                    dropoffLocation: car.dropoffLocation,
                    insuranceTier,
                  },
                });
              }}
            >
              {availabilityState === 'checking'
                ? 'Verifying Fleet Availability...'
                : availabilityState === 'unavailable'
                ? 'Vehicle Unavailable for Selected Dates'
                : 'Continue to Booking'}
            </Button>

            <p className="text-center text-[11px] text-[#64748B]">
              No advance debit required to preview your itinerary.
            </p>
          </div>
        </aside>
      </div>

      {/* Booking Itinerary Preview Modal */}
      <BookingPreviewModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        car={car}
        pickupDate={pickupDate}
        returnDate={returnDate}
        rentalDays={rentalDays}
        insuranceTier={insuranceTier}
        basePrice={basePrice}
        insuranceTotal={insuranceTotal}
        gstAmount={gstAmount}
        grandTotal={grandTotal}
      />

      {/* Related Vehicles Section */}
      <RelatedVehicles currentCar={car} />
    </div>
  );
};
