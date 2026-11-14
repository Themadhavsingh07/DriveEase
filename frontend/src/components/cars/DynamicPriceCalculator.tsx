import React, { useState, useEffect } from 'react';
import { Car, AdditionalService, PricingBreakdown } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import api from '../../lib/api';
import {
  Shield,
  ShieldCheck,
  Tag,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface DynamicPriceCalculatorProps {
  car: Car;
  pickupDateTime: string;
  returnDateTime: string;
  onProceedToBooking: (options: {
    insuranceType: 'BASIC' | 'PREMIUM' | 'COMPREHENSIVE';
    selectedServiceIds: string[];
    couponCode: string;
    breakdown: PricingBreakdown;
  }) => void;
}

export const DynamicPriceCalculator: React.FC<DynamicPriceCalculatorProps> = ({
  car,
  pickupDateTime,
  returnDateTime,
  onProceedToBooking,
}) => {
  const [insuranceType, setInsuranceType] = useState<'BASIC' | 'PREMIUM' | 'COMPREHENSIVE'>(
    'PREMIUM'
  );
  const [availableServices, setAvailableServices] = useState<AdditionalService[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const [breakdown, setBreakdown] = useState<PricingBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch available additional services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get<{ services: AdditionalService[] }>('/services');
        setAvailableServices(res.services);
      } catch (err) {
        console.error('Failed to load services', err);
      }
    };
    fetchServices();
  }, []);

  // Fetch Authoritative Price Calculation from Backend
  useEffect(() => {
    const fetchCalculation = async () => {
      if (!pickupDateTime || !returnDateTime) return;
      setIsCalculating(true);
      try {
        const res = await api.post<{ breakdown: PricingBreakdown }>('/pricing/calculate', {
          carId: car.id,
          pickupDateTime,
          returnDateTime,
          insuranceType,
          serviceIds: selectedServiceIds,
          couponCode: appliedCoupon || undefined,
        });
        setBreakdown(res.breakdown);
      } catch (err: any) {
        console.error('Calculation error', err);
      } finally {
        setIsCalculating(false);
      }
    };

    fetchCalculation();
  }, [car.id, pickupDateTime, returnDateTime, insuranceType, selectedServiceIds, appliedCoupon]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const subtotal = breakdown?.subtotal || Number(car.dailyPrice);
      const res = await api.post<{
        code: string;
        calculatedDiscount: number;
        description?: string;
      }>('/coupons/validate', {
        code: couponCodeInput.trim().toUpperCase(),
        subtotal,
      });

      setAppliedCoupon(res.code);
      setCouponSuccess(`Coupon applied! Savings: ${formatCurrency(res.calculatedDiscount)}`);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid or ineligible coupon code.');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponSuccess(null);
    setCouponError(null);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-slate-800 space-y-6 shadow-2xl sticky top-24">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
          Transparent Price Engine
        </span>
        <h3 className="text-2xl font-bold text-white mt-1">Rental Cost Breakdown</h3>
        <p className="text-xs text-slate-400 mt-1">
          Instant authoritative pricing with all taxes, insurance, and refundable deposits itemized.
        </p>
      </div>

      {/* Insurance Protection Options */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Damage Protection Cover</span>
          <span className="text-[10px] text-sky-400 lowercase">mandatory tier</span>
        </label>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Basic */}
          <div
            onClick={() => setInsuranceType('BASIC')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              insuranceType === 'BASIC'
                ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-slate-400" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Basic Protection</h4>
                  <p className="text-[11px] text-slate-400">Standard third-party liability cover</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-300">Included (₹0)</span>
            </div>
          </div>

          {/* Premium */}
          <div
            onClick={() => setInsuranceType('PREMIUM')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              insuranceType === 'PREMIUM'
                ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">Premium Cover</h4>
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-bold">
                      Popular
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Collision waiver with ₹10,000 max deductible</p>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-400">₹500 / day</span>
            </div>
          </div>

          {/* Comprehensive */}
          <div
            onClick={() => setInsuranceType('COMPREHENSIVE')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              insuranceType === 'COMPREHENSIVE'
                ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Comprehensive 0-Dep</h4>
                  <p className="text-[11px] text-slate-400">Zero deductible & 24/7 personal accident cover</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400">₹800 / day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Optional Services */}
      {availableServices.length > 0 && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Optional Add-on Amenities
          </label>
          <div className="space-y-2">
            {availableServices.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-sky-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isSelected
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-slate-700 bg-slate-950'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{service.name}</p>
                      <p className="text-[11px] text-slate-400">{service.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-300 shrink-0 ml-2">
                    {formatCurrency(service.pricePerDay)}
                    {service.isOneTime ? ' flat' : '/day'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Coupon Application */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-sky-400" /> Promo Code
        </label>
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-400 text-xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>
                Applied: <strong>{appliedCoupon}</strong>
              </span>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-slate-400 hover:text-white underline text-xs"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. DRIVE10, WELCOME500"
              value={couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-blue-500"
            />
            <Button type="submit" variant="secondary" size="sm">
              Apply
            </Button>
          </form>
        )}
        {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}
        {couponSuccess && <p className="text-[11px] text-emerald-400">{couponSuccess}</p>}
      </div>

      {/* Itemized Calculation Summary Table */}
      {breakdown && (
        <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
          <div className="flex justify-between">
            <span>
              Daily Rate ({formatCurrency(breakdown.dailyPrice)} × {breakdown.rentalDays} days)
            </span>
            <span className="font-semibold text-white">{formatCurrency(breakdown.baseAmount)}</span>
          </div>

          {breakdown.insuranceAmount > 0 && (
            <div className="flex justify-between">
              <span>Damage Cover ({breakdown.insuranceType})</span>
              <span className="font-semibold text-white">
                +{formatCurrency(breakdown.insuranceAmount)}
              </span>
            </div>
          )}

          {breakdown.servicesAmount > 0 && (
            <div className="flex justify-between">
              <span>Additional Amenities</span>
              <span className="font-semibold text-white">
                +{formatCurrency(breakdown.servicesAmount)}
              </span>
            </div>
          )}

          {breakdown.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Coupon Discount ({breakdown.couponCode})</span>
              <span className="font-semibold">-{formatCurrency(breakdown.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              GST (18% on taxable services)
            </span>
            <span className="font-semibold text-white">+{formatCurrency(breakdown.taxAmount)}</span>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-800/60">
            <span className="text-amber-400 flex items-center gap-1">
              Refundable Security Deposit
            </span>
            <span className="font-semibold text-amber-300">
              {formatCurrency(breakdown.securityDeposit)}
            </span>
          </div>

          {/* Grand Total */}
          <div className="pt-4 mt-2 border-t border-slate-700/80 flex items-baseline justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">
                Total Payable Amount
              </span>
              <span className="text-[11px] text-slate-500">
                Includes {formatCurrency(breakdown.securityDeposit)} refundable deposit
              </span>
            </div>
            <div className="text-2xl font-black text-white">
              {formatCurrency(breakdown.finalPayableAmount)}
            </div>
          </div>
        </div>
      )}

      {/* Book Now Action Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full text-base font-bold shadow-xl shadow-blue-500/20"
        isLoading={isCalculating}
        onClick={() => {
          if (breakdown) {
            onProceedToBooking({
              insuranceType,
              selectedServiceIds,
              couponCode: appliedCoupon || '',
              breakdown,
            });
          }
        }}
      >
        <span>Proceed to Reserve</span>
        <ArrowRight className="w-5 h-5 ml-1" />
      </Button>
    </div>
  );
};
