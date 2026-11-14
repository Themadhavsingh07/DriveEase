import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, Calendar, ShieldAlert } from 'lucide-react';

export type AvailabilityState = 'idle' | 'checking' | 'available' | 'unavailable' | 'error';

export interface AvailabilityStatusProps {
  state: AvailabilityState;
  message?: string;
  rentalDays?: number;
  durationHours?: number;
  conflictsCount?: number;
  className?: string;
}

export const AvailabilityStatus: React.FC<AvailabilityStatusProps> = ({
  state,
  message,
  rentalDays,
  durationHours,
  conflictsCount = 0,
  className = '',
}) => {
  if (state === 'idle') {
    return (
      <div
        className={`p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/60 text-xs text-[#2563EB] flex items-center gap-2.5 ${className}`}
      >
        <Calendar className="w-4 h-4 shrink-0 text-[#2563EB]" />
        <span>Select your pickup and return dates above to verify real-time fleet availability.</span>
      </div>
    );
  }

  if (state === 'checking') {
    return (
      <div
        className={`p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#2563EB] flex items-center gap-2.5 animate-pulse ${className}`}
      >
        <Loader2 className="w-4 h-4 shrink-0 animate-spin text-[#2563EB]" />
        <span className="font-semibold">Checking real-time vehicle availability with DriveEase fleet...</span>
      </div>
    );
  }

  if (state === 'available') {
    return (
      <div
        className={`p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1 ${className}`}
      >
        <div className="flex items-center gap-2 font-bold text-emerald-900">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Great! This vehicle is available for your selected dates.</span>
        </div>
        {rentalDays !== undefined && (
          <p className="text-[11px] text-emerald-700 pl-6">
            Total rental duration: <strong>{rentalDays} {rentalDays === 1 ? 'day' : 'days'}</strong>
            {durationHours ? ` (${Math.round(durationHours)} hours)` : ''}.
          </p>
        )}
      </div>
    );
  }

  if (state === 'unavailable') {
    return (
      <div
        className={`p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1 ${className}`}
      >
        <div className="flex items-center gap-2 font-bold text-rose-900">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>Sorry, this vehicle is already reserved for the selected period.</span>
        </div>
        <p className="text-[11px] text-rose-700 pl-6">
          {message || 'Please select an alternate date range on the calendar or browse other available vehicles in our fleet.'}
        </p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div
        className={`p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2.5 ${className}`}
      >
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
        <div>
          <span className="font-bold">Unable to check availability. </span>
          <span className="text-[11px]">{message || 'Please verify your date selections and try again.'}</span>
        </div>
      </div>
    );
  }

  return null;
};
