import React from 'react';
import { Calendar, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export interface AvailabilitySummaryProps {
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  rentalDays: number;
  durationHours?: number;
  className?: string;
}

export const AvailabilitySummary: React.FC<AvailabilitySummaryProps> = ({
  pickupDate,
  pickupTime,
  returnDate,
  returnTime,
  rentalDays,
  durationHours,
  className = '',
}) => {
  const formatFriendlyDate = (dateStr: string) => {
    try {
      if (!dateStr) return 'Select date';
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs text-xs ${className}`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="font-bold text-[#101B2D] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          Rental Period Summary
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] font-bold text-[11px]">
          {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}
          {durationHours ? ` • ${Math.round(durationHours)}h` : ''}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#64748B] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#2563EB]" /> Pickup
          </span>
          <p className="font-bold text-[#101B2D]">{formatFriendlyDate(pickupDate)}</p>
          <p className="text-[11px] text-[#475569] flex items-center gap-1">
            <Clock className="w-3 h-3" /> {pickupTime}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#64748B] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#2563EB]" /> Return
          </span>
          <p className="font-bold text-[#101B2D]">{formatFriendlyDate(returnDate)}</p>
          <p className="text-[11px] text-[#475569] flex items-center gap-1">
            <Clock className="w-3 h-3" /> {returnTime}
          </p>
        </div>
      </div>

      <div className="pt-1 flex items-center gap-1.5 text-[11px] text-[#64748B]">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Pre-trip sanitization & contactless key handover included.</span>
      </div>
    </div>
  );
};
