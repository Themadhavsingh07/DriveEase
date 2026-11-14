import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

export interface DateRangePickerProps {
  pickupDate: string; // "YYYY-MM-DD"
  returnDate: string; // "YYYY-MM-DD"
  minPickupDate?: string;
  onPickupChange: (date: string) => void;
  onReturnChange: (date: string) => void;
  disabled?: boolean;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  pickupDate,
  returnDate,
  minPickupDate,
  onPickupChange,
  onReturnChange,
  disabled = false,
  className = '',
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const effectiveMinPickup = minPickupDate || todayStr;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      {/* Pickup Date */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-[#101B2D] uppercase tracking-wider flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Pickup Date</span>
        </label>
        <div className="relative">
          <input
            type="date"
            value={pickupDate}
            min={effectiveMinPickup}
            disabled={disabled}
            onChange={(e) => {
              const newPickup = e.target.value;
              onPickupChange(newPickup);
              // If return date is now earlier than new pickup, bump return date to pickup
              if (returnDate && returnDate < newPickup) {
                onReturnChange(newPickup);
              }
            }}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors disabled:opacity-50 cursor-pointer"
          />
        </div>
      </div>

      {/* Return Date */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-[#101B2D] uppercase tracking-wider flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Return Date</span>
        </label>
        <div className="relative">
          <input
            type="date"
            value={returnDate}
            min={pickupDate || effectiveMinPickup}
            disabled={disabled}
            onChange={(e) => onReturnChange(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors disabled:opacity-50 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
