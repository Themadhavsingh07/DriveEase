import React from 'react';
import { CarCategory } from '../../types';
import { Button } from '../common/Button';
import { formatCurrency } from '../../lib/utils';
import { Search, RotateCcw, SlidersHorizontal, Check } from 'lucide-react';

interface CarFilterSidebarProps {
  categories: CarCategory[];
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  fuelType: string;
  setFuelType: (val: string) => void;
  transmission: string;
  setTransmission: (val: string) => void;
  minSeats: string;
  setMinSeats: (val: string) => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  onReset: () => void;
}

export const CarFilterSidebar: React.FC<CarFilterSidebarProps> = ({
  categories,
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  fuelType,
  setFuelType,
  transmission,
  setTransmission,
  minSeats,
  setMinSeats,
  maxPrice,
  setMaxPrice,
  onReset,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-sky-400" />
          Filter Fleet
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">Search Vehicle</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Brand, model e.g. BMW, M3..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-300 uppercase tracking-wider">
            Max Daily Rate
          </label>
          <span className="font-bold text-sky-400">{formatCurrency(maxPrice)}</span>
        </div>
        <input
          type="range"
          min="4000"
          max="30000"
          step="1000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-blue-600 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>₹4,000</span>
          <span>₹30,000+</span>
        </div>
      </div>

      {/* Fuel Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Fuel Type
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {['', 'PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'].map((fuel) => (
            <button
              key={fuel}
              onClick={() => setFuelType(fuel)}
              className={`p-2 rounded-xl text-center border font-medium transition-all ${
                fuelType === fuel
                  ? 'bg-blue-600/20 border-blue-500 text-sky-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {fuel || 'Any Fuel'}
            </button>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Transmission
        </label>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {[
            { label: 'All', value: '' },
            { label: 'Automatic', value: 'AUTOMATIC' },
            { label: 'Manual', value: 'MANUAL' },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTransmission(t.value)}
              className={`p-2 rounded-xl text-center border font-medium transition-all ${
                transmission === t.value
                  ? 'bg-blue-600/20 border-blue-500 text-sky-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seating Capacity */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Minimum Seats
        </label>
        <div className="grid grid-cols-4 gap-1.5 text-xs">
          {[
            { label: 'Any', value: '' },
            { label: '4+', value: '4' },
            { label: '5+', value: '5' },
            { label: '7+', value: '7' },
          ].map((seat) => (
            <button
              key={seat.value}
              onClick={() => setMinSeats(seat.value)}
              className={`p-2 rounded-xl text-center border font-medium transition-all ${
                minSeats === seat.value
                  ? 'bg-blue-600/20 border-blue-500 text-sky-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
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
