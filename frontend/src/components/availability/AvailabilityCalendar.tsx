import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Calendar as CalendarIcon,
  Loader2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useMonthlyAvailability } from '../../hooks/useAvailability';
import { AvailabilityLegend } from './AvailabilityLegend';
import { CalendarDaySlot } from '../../types/availability';
import { Button } from '../common/Button';

export interface AvailabilityCalendarProps {
  carId: string;
  pickupDate: string; // "YYYY-MM-DD"
  returnDate: string; // "YYYY-MM-DD"
  onDateRangeSelect: (pickup: string, returnDate: string) => void;
  onClearDates?: () => void;
  className?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  carId,
  pickupDate,
  returnDate,
  onDateRangeSelect,
  onClearDates,
  className = '',
}) => {
  // Current calendar view (month: 1-12, year: number)
  const initialDate = useMemo(() => {
    if (pickupDate) {
      const d = new Date(pickupDate);
      if (!isNaN(d.getTime())) return { month: d.getUTCMonth() + 1, year: d.getUTCFullYear() };
    }
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  }, [pickupDate]);

  const [currentMonth, setCurrentMonth] = useState(initialDate.month);
  const [currentYear, setCurrentYear] = useState(initialDate.year);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Fetch monthly availability from real PostgreSQL backend
  const { data: monthData, isLoading, isError } = useMonthlyAvailability(
    carId,
    currentMonth,
    currentYear
  );

  // Compute month calendar days map
  const calendarDaysMap = useMemo(() => {
    const map = new Map<string, CalendarDaySlot>();
    if (monthData?.calendar) {
      for (const day of monthData.calendar) {
        map.set(day.date, day);
      }
    }
    return map;
  }, [monthData]);

  // Compute first day of month weekday offset (0-6)
  const firstDayOfWeek = useMemo(() => {
    return new Date(Date.UTC(currentYear, currentMonth - 1, 1)).getUTCDay();
  }, [currentYear, currentMonth]);

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth, 0).getDate();
  }, [currentYear, currentMonth]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Handle day click for range selection
  const handleDayClick = (dateStr: string, slot?: CalendarDaySlot) => {
    if (!slot || slot.isPast || slot.status === 'FULLY_BOOKED') {
      return;
    }

    // If no pickup date selected, or both already selected, start fresh with pickup
    if (!pickupDate || (pickupDate && returnDate)) {
      onDateRangeSelect(dateStr, '');
      return;
    }

    // If pickupDate is selected and user clicks on or after pickup
    if (pickupDate && !returnDate) {
      if (dateStr < pickupDate) {
        // Reset pickup to earlier clicked date
        onDateRangeSelect(dateStr, '');
      } else {
        // Check if there are any FULLY_BOOKED dates between pickup and this returnDate
        let hasBlockedBetween = false;
        const startDay = parseInt(pickupDate.split('-')[2], 10);
        const endDay = parseInt(dateStr.split('-')[2], 10);

        if (pickupDate.slice(0, 7) === dateStr.slice(0, 7)) {
          for (let d = startDay; d <= endDay; d++) {
            const checkKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const s = calendarDaysMap.get(checkKey);
            if (s && s.status === 'FULLY_BOOKED') {
              hasBlockedBetween = true;
              break;
            }
          }
        }

        if (hasBlockedBetween) {
          alert('Selected range intersects fully booked dates. Please choose an open interval.');
          return;
        }

        onDateRangeSelect(pickupDate, dateStr);
      }
    }
  };

  // Determine styling class for each calendar day
  const getDayStyle = (dateStr: string, slot?: CalendarDaySlot) => {
    const isPickup = pickupDate === dateStr;
    const isReturn = returnDate === dateStr;
    const isSelected = isPickup || isReturn;

    // Check if inside selected range
    const isInSelectedRange =
      pickupDate && returnDate && dateStr > pickupDate && dateStr < returnDate;

    // Check if inside hover preview range
    const isInHoverRange =
      pickupDate &&
      !returnDate &&
      hoverDate &&
      hoverDate >= pickupDate &&
      dateStr > pickupDate &&
      dateStr <= hoverDate;

    if (isSelected) {
      return 'bg-[#2563EB] text-white font-bold shadow-md hover:bg-blue-700 ring-2 ring-blue-300';
    }

    if (isInSelectedRange) {
      return 'bg-blue-100 text-[#101B2D] font-semibold border-y border-blue-200';
    }

    if (isInHoverRange) {
      return 'bg-blue-50 text-blue-900 border-dashed border-blue-300';
    }

    if (!slot || slot.isPast) {
      return 'bg-slate-50 text-slate-300 cursor-not-allowed';
    }

    if (slot.status === 'FULLY_BOOKED') {
      return 'bg-rose-50/70 text-rose-500 font-medium border border-rose-200/80 cursor-not-allowed hover:bg-rose-100';
    }

    if (slot.status === 'PARTIALLY_BOOKED') {
      return 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 cursor-pointer font-semibold';
    }

    // Default: AVAILABLE
    return 'bg-emerald-50/60 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 cursor-pointer font-semibold';
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5 ${className}`}>
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider block">
            Real-Time Vehicle Availability
          </span>
          <h3 className="text-lg font-black text-[#101B2D]">
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          {onClearDates && (pickupDate || returnDate) && (
            <button
              type="button"
              onClick={onClearDates}
              className="text-xs text-[#64748B] hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer mr-1"
              title="Clear selected dates"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#1E293B] shadow-2xs transition-colors cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#1E293B] shadow-2xs transition-colors cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
        {WEEKDAY_NAMES.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Monthly Day Grid */}
      {isLoading ? (
        <div className="py-16 text-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] mx-auto" />
          <p className="text-xs text-[#64748B]">Loading monthly fleet availability...</p>
        </div>
      ) : isError ? (
        <div className="py-12 text-center space-y-2 bg-amber-50 rounded-2xl p-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
          <p className="text-xs text-amber-800 font-semibold">Unable to fetch live calendar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty spacer blocks for start-of-month weekday offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`spacer-${idx}`} className="h-10 sm:h-12 rounded-xl bg-transparent" />
          ))}

          {/* Actual days of the month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const slot = calendarDaysMap.get(dateStr);
            const style = getDayStyle(dateStr, slot);

            return (
              <button
                key={dateStr}
                type="button"
                disabled={!slot || slot.isPast || slot.status === 'FULLY_BOOKED'}
                onClick={() => handleDayClick(dateStr, slot)}
                onMouseEnter={() => setHoverDate(dateStr)}
                onMouseLeave={() => setHoverDate(null)}
                className={`relative h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center text-xs transition-all duration-150 ${style}`}
                title={
                  slot
                    ? `${dateStr}: ${slot.status}${slot.reservationCount > 0 ? ` (${slot.reservationCount} active bookings)` : ''}`
                    : dateStr
                }
              >
                <span className="font-bold">{dayNum}</span>

                {/* Status indicator pip */}
                {slot && slot.status === 'FULLY_BOOKED' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute bottom-1" />
                )}
                {slot && slot.status === 'PARTIALLY_BOOKED' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute bottom-1" />
                )}
                {slot && slot.status === 'AVAILABLE' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute bottom-1 opacity-70" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Color Legend */}
      <AvailabilityLegend />
    </div>
  );
};
