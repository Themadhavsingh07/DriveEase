import React from 'react';

export const AvailabilityLegend: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] font-medium text-[#475569] ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600 shadow-xs" />
        <span>Available</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500 shadow-xs" />
        <span>Partially Booked</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-600 shadow-xs" />
        <span>Fully Booked</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-[#2563EB] shadow-xs" />
        <span>Selected Range</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400" />
        <span>Past Date</span>
      </div>
    </div>
  );
};
