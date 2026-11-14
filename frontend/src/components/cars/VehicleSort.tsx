import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface VehicleSortProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export const VehicleSort: React.FC<VehicleSortProps> = ({
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-[#E2E8F0] rounded-xl pl-8 pr-4 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 shadow-sm transition-all cursor-pointer"
        aria-label="Sort vehicles"
      >
        <option value="recommended">Recommended & Featured</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="newest">Newest First</option>
        <option value="rating">Highest Rated</option>
        <option value="popular">Most Popular</option>
      </select>
    </div>
  );
};
