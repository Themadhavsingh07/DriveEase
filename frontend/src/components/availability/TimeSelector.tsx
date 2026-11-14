import React from 'react';
import { Clock } from 'lucide-react';

export interface TimeSelectorProps {
  label: string;
  value: string; // e.g. "10:00"
  onChange: (time: string) => void;
  disabled?: boolean;
  className?: string;
}

export const TIME_SLOTS = [
  { value: '06:00', label: '06:00 AM' },
  { value: '07:00', label: '07:00 AM' },
  { value: '08:00', label: '08:00 AM' },
  { value: '09:00', label: '09:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM (Noon)' },
  { value: '13:00', label: '01:00 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '17:00', label: '05:00 PM' },
  { value: '18:00', label: '06:00 PM' },
  { value: '19:00', label: '07:00 PM' },
  { value: '20:00', label: '08:00 PM' },
  { value: '21:00', label: '09:00 PM' },
  { value: '22:00', label: '10:00 PM' },
];

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-[11px] font-bold text-[#101B2D] uppercase tracking-wider flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
        <span>{label}</span>
      </label>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {TIME_SLOTS.map((slot) => (
            <option key={slot.value} value={slot.value}>
              {slot.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
