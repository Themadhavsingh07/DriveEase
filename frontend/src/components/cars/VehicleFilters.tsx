import React from 'react';
import { Button } from '../common/Button';
import { formatCurrency } from '../../lib/utils';
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  Heart,
  Car,
  Fuel,
  Users,
  Sparkles,
} from 'lucide-react';

interface VehicleFiltersProps {
  category: string;
  setCategory: (val: string) => void;
  brand: string;
  setBrand: (val: string) => void;
  fuelType: string;
  setFuelType: (val: string) => void;
  transmission: string;
  setTransmission: (val: string) => void;
  seatingCapacity: string;
  setSeatingCapacity: (val: string) => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  availability: 'all' | 'available';
  setAvailability: (val: 'all' | 'available') => void;
  wishlistOnly: boolean;
  setWishlistOnly: (val: boolean) => void;
  wishlistCount: number;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const CATEGORIES = ['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Electric', 'Sports'];
const BRANDS = [
  'Maruti Suzuki',
  'Hyundai',
  'Kia',
  'Mahindra',
  'Toyota',
  'BMW',
  'Mercedes-Benz',
  'Tata',
  'Honda',
];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
const SEATS = [
  { label: '2+', value: '2' },
  { label: '4+', value: '4' },
  { label: '5+', value: '5' },
  { label: '7+', value: '7' },
];

export const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  category,
  setCategory,
  brand,
  setBrand,
  fuelType,
  setFuelType,
  transmission,
  setTransmission,
  seatingCapacity,
  setSeatingCapacity,
  maxPrice,
  setMaxPrice,
  availability,
  setAvailability,
  wishlistOnly,
  setWishlistOnly,
  wishlistCount,
  onReset,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-[#101B2D] flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#2563EB]" />
          Filter Vehicles
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-[#64748B] hover:text-[#2563EB] flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Saved / Wishlist Quick Filter */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
        <button
          type="button"
          onClick={() => setWishlistOnly(!wishlistOnly)}
          className={`w-full flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
            wishlistOnly ? 'text-rose-600' : 'text-[#1E293B] hover:text-rose-500'
          }`}
        >
          <span className="flex items-center gap-2">
            <Heart
              className={`w-4 h-4 ${
                wishlistOnly ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              }`}
            />
            Saved Favourites
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              wishlistOnly
                ? 'bg-rose-500 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {wishlistCount}
          </span>
        </button>
      </div>

      {/* Availability Status */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-[#101B2D] uppercase tracking-wider block">
          Availability
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setAvailability('all')}
            className={`py-2 px-3 rounded-xl font-semibold border transition-all text-center cursor-pointer ${
              availability === 'all'
                ? 'bg-[#101B2D] text-white border-transparent'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-slate-300'
            }`}
          >
            All Vehicles
          </button>
          <button
            type="button"
            onClick={() => setAvailability('available')}
            className={`py-2 px-3 rounded-xl font-semibold border transition-all text-center cursor-pointer ${
              availability === 'available'
                ? 'bg-emerald-600 text-white border-transparent'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-slate-300'
            }`}
          >
            Available Only
          </button>
        </div>
      </div>

      {/* Vehicle Category */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-bold text-[#101B2D] uppercase tracking-wider block">
          Body Style / Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              !category
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'bg-[#F8FAFC] text-[#64748B] hover:bg-slate-100 border border-[#E2E8F0]'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(category === cat ? '' : cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                category === cat
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <label className="text-[11px] font-bold text-[#101B2D] uppercase tracking-wider">
            Max Daily Budget
          </label>
          <span className="font-extrabold text-[#2563EB] text-sm">
            {formatCurrency(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min="1800"
          max="30000"
          step="500"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#2563EB] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#64748B] font-medium">
          <span>₹1,800/day</span>
          <span>₹30,000+/day</span>
        </div>
      </div>

      {/* Brand Selection */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-bold text-[#101B2D] uppercase tracking-wider block">
            Automotive Brand
          </label>
          {brand && (
            <button
              type="button"
              onClick={() => setBrand('')}
              className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {BRANDS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBrand(brand === b ? '' : b)}
              className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer truncate ${
                brand === b
                  ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-slate-300'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Fuel Type */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-bold text-[#101B2D] uppercase tracking-wider block">
          Fuel Type
        </label>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setFuelType('')}
            className={`p-2 rounded-xl text-center border font-semibold transition-all cursor-pointer ${
              !fuelType
                ? 'bg-[#101B2D] text-white border-transparent'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-slate-300'
            }`}
          >
            All
          </button>
          {FUEL_TYPES.map((fuel) => (
            <button
              key={fuel}
              type="button"
              onClick={() => setFuelType(fuelType === fuel ? '' : fuel)}
              className={`p-2 rounded-xl text-center border font-semibold transition-all cursor-pointer truncate ${
                fuelType === fuel
                  ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-slate-300'
              }`}
            >
              {fuel}
            </button>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-bold text-[#101B2D] uppercase tracking-wider block">
          Transmission
        </label>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {[
            { label: 'All', value: '' },
            { label: 'Automatic', value: 'Automatic' },
            { label: 'Manual', value: 'Manual' },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTransmission(t.value)}
              className={`p-2 rounded-xl text-center border font-semibold transition-all cursor-pointer truncate ${
                transmission === t.value
                  ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seating Capacity */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-bold text-[#101B2D] uppercase tracking-wider block">
          Minimum Seating
        </label>
        <div className="grid grid-cols-5 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setSeatingCapacity('')}
            className={`p-2 rounded-xl text-center border font-semibold transition-all cursor-pointer ${
              !seatingCapacity
                ? 'bg-[#101B2D] text-white border-transparent'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-slate-300'
            }`}
          >
            Any
          </button>
          {SEATS.map((seat) => (
            <button
              key={seat.value}
              type="button"
              onClick={() =>
                setSeatingCapacity(seatingCapacity === seat.value ? '' : seat.value)
              }
              className={`p-2 rounded-xl text-center border font-semibold transition-all cursor-pointer ${
                seatingCapacity === seat.value
                  ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-slate-300'
              }`}
            >
              {seat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
