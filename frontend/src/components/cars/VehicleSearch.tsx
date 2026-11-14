import React from 'react';
import { Search, X } from 'lucide-react';

interface VehicleSearchProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

const QUICK_SUGGESTIONS = [
  'Swift',
  'Creta',
  'Fortuner',
  'BMW',
  'Thar 4x4',
  'Electric',
  'Tesla',
];

export const VehicleSearch: React.FC<VehicleSearchProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search by brand, model, body style (e.g. BMW, Creta, SUV, Electric)...',
  className = '',
}) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4 text-[#2563EB]" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-[#E2E8F0] rounded-2xl pl-10 pr-10 py-3 text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4 bg-slate-100 hover:bg-slate-200 rounded-full p-0.5" />
          </button>
        )}
      </div>

      {/* Quick Search Suggestion Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-[#64748B] shrink-0">
          Popular:
        </span>
        {QUICK_SUGGESTIONS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(tag)}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
              value.toLowerCase() === tag.toLowerCase()
                ? 'bg-[#2563EB] text-white'
                : 'bg-white hover:bg-slate-100 text-[#475569] border border-slate-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};
