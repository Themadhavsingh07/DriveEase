import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../lib/utils';
import {
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Car as CarIcon,
  Sparkles,
  Info,
} from 'lucide-react';

interface BookingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: Car;
  pickupDate: string;
  returnDate: string;
  rentalDays: number;
  insuranceTier: 'basic' | 'premium';
  basePrice: number;
  insuranceTotal: number;
  gstAmount: number;
  grandTotal: number;
}

export const BookingPreviewModal: React.FC<BookingPreviewModalProps> = ({
  isOpen,
  onClose,
  car,
  pickupDate,
  returnDate,
  rentalDays,
  insuranceTier,
  basePrice,
  insuranceTotal,
  gstAmount,
  grandTotal,
}) => {
  const navigate = useNavigate();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    onClose();
    navigate('/booking/checkout', {
      state: {
        car,
        pickupDate,
        returnDate,
        pickupLocation: car.pickupLocation,
        dropoffLocation: car.dropoffLocation,
        insuranceTier: insuranceTier.toUpperCase(),
      },
    });
  };

  const handleModalClose = () => {
    setIsConfirmed(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={isConfirmed ? 'Reservation Verified!' : 'Booking Itinerary Preview'}
      maxWidth="xl"
    >
      {isConfirmed ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h4 className="text-xl font-black text-[#101B2D]">
              Demo Reservation Previewed!
            </h4>
            <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 leading-relaxed">
              Your preview itinerary for the <span className="font-bold text-[#101B2D]">{car.brand} {car.model}</span> has been calculated successfully. Full booking, auth, and payment gateway will be enabled in Phase 3.
            </p>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Duration:</span>
              <span className="font-bold text-[#101B2D]">{rentalDays} Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Dates:</span>
              <span className="font-bold text-[#101B2D]">{pickupDate} to {returnDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Total Payable:</span>
              <span className="font-extrabold text-[#2563EB] text-sm">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <Button variant="primary" size="md" onClick={handleModalClose} className="mt-4">
            Return to Vehicle Details
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Car Header Summary */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <img
              src={car.images?.[0]?.url || ''}
              alt={`${car.brand} ${car.model}`}
              className="w-24 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block">
                {car.brand}
              </span>
              <h4 className="text-base font-extrabold text-[#101B2D] truncate">
                {car.brand} {car.model}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="navy" size="sm">{car.category}</Badge>
                <span className="text-xs font-semibold text-[#101B2D]">
                  {formatCurrency(car.dailyPrice)}/day
                </span>
              </div>
            </div>
          </div>

          {/* Dates & Pickup Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[#64748B] block font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                Pickup Date & Time
              </span>
              <p className="font-bold text-[#101B2D] text-sm">{pickupDate} • 10:00 AM</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[#64748B] block font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                Return Date & Time
              </span>
              <p className="font-bold text-[#101B2D] text-sm">{returnDate} • 10:00 AM</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2 text-[#101B2D]">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate">
              <strong>Hub Handover:</strong> {car.pickupLocation}
            </span>
          </div>

          {/* Itemized Price Breakdown */}
          <div className="border-t border-slate-200 pt-4 space-y-2 text-xs text-[#64748B]">
            <div className="flex justify-between">
              <span>Base Rental ({rentalDays} {rentalDays === 1 ? 'day' : 'days'} × {formatCurrency(car.dailyPrice)})</span>
              <span className="font-bold text-[#101B2D]">{formatCurrency(basePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Damage Protection ({insuranceTier === 'premium' ? 'Premium Zero-Dep ₹500/day' : 'Basic Cover ₹0'})</span>
              <span className="font-bold text-[#101B2D]">+{formatCurrency(insuranceTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Goods & Services Tax (18% GST)</span>
              <span className="font-bold text-[#101B2D]">+{formatCurrency(gstAmount)}</span>
            </div>
            <div className="flex justify-between text-amber-700 font-semibold pt-1">
              <span>100% Refundable Security Deposit</span>
              <span>{formatCurrency(car.securityDeposit)}</span>
            </div>

            <div className="border-t border-slate-200 pt-3 mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-[#101B2D] uppercase block">
                  Total Estimated Amount
                </span>
                <span className="text-[10px] text-[#64748B]">
                  Includes {formatCurrency(car.securityDeposit)} refundable deposit
                </span>
              </div>
              <span className="text-2xl font-black text-[#101B2D]">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Phase Notice */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <span>
              <strong>Phase 2 Frontend Preview:</strong> You are previewing client-side pricing and itinerary verification. Payment gateway and booking creation will be unlocked in Phase 3.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" size="md" onClick={handleModalClose} className="flex-1">
              Modify Dates
            </Button>
            <Button variant="primary" size="md" onClick={handleConfirm} className="flex-1 shadow-md">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
