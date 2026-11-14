import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface BlockedRange {
  bookingId: string;
  bookingNumber: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface AvailabilityCalendarProps {
  carId: string;
  selectedPickup: string | null; // ISO string
  selectedReturn: string | null; // ISO string
  onSelectDates: (pickup: string, dropoff: string) => void;
  minRentalDays?: number;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  carId,
  selectedPickup,
  selectedReturn,
  onSelectDates,
  minRentalDays = 1,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [tempPickup, setTempPickup] = useState<Date | null>(
    selectedPickup ? new Date(selectedPickup) : null
  );
  const [tempReturn, setTempReturn] = useState<Date | null>(
    selectedReturn ? new Date(selectedReturn) : null
  );
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Fetch real blocked ranges for this specific car from backend DB
  const { data: availabilityData, isLoading } = useQuery({
    queryKey: ['car-availability', carId],
    queryFn: async () => {
      const res = await api.get<{
        car: any;
        isVehicleOperational: boolean;
        blockedRanges: BlockedRange[];
      }>(`/cars/${carId}/availability`);
      return res;
    },
  });

  const blockedRanges = availabilityData?.blockedRanges || [];

  // Helper to check if a specific date is booked in DB
  const isDateBooked = (date: Date): boolean => {
    const targetTime = date.getTime();
    return blockedRanges.some((range) => {
      const start = new Date(range.startDate).setHours(0, 0, 0, 0);
      const end = new Date(range.endDate).setHours(23, 59, 59, 999);
      return targetTime >= start && targetTime <= end;
    });
  };

  // Helper to check if date is in the past
  const isDateInPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() < today.getTime();
  };

  // Handle day click
  const handleDateClick = (date: Date) => {
    setConflictWarning(null);

    if (isDateInPast(date)) return;
    if (isDateBooked(date)) {
      setConflictWarning('This date is already reserved by another customer.');
      return;
    }

    if (!tempPickup || (tempPickup && tempReturn)) {
      // Starting new selection
      const newPickup = new Date(date);
      newPickup.setHours(10, 0, 0, 0);
      setTempPickup(newPickup);
      setTempReturn(null);
    } else if (tempPickup && !tempReturn) {
      // Selecting return date
      if (date.getTime() <= tempPickup.getTime()) {
        // Clicked date is before pickup, reset pickup to this date
        const newPickup = new Date(date);
        newPickup.setHours(10, 0, 0, 0);
        setTempPickup(newPickup);
        return;
      }

      // Check if any date in between is booked
      let cur = new Date(tempPickup);
      let conflictFound = false;
      while (cur.getTime() <= date.getTime()) {
        if (isDateBooked(cur)) {
          conflictFound = true;
          break;
        }
        cur.setDate(cur.getDate() + 1);
      }

      if (conflictFound) {
        setConflictWarning(
          'Your selected range overlaps with existing reserved dates. Please select an uninterrupted period.'
        );
        return;
      }

      const newReturn = new Date(date);
      newReturn.setHours(18, 0, 0, 0);
      setTempReturn(newReturn);

      // Trigger parent callback
      onSelectDates(tempPickup.toISOString(), newReturn.toISOString());
    }
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Calendar grid calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Real-Time Vehicle Availability
          </h3>
          <p className="text-xs text-slate-400">
            Select your desired pickup and return dates. Booked slots are blocked automatically.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200 mr-2">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conflict / Notice Warning Alert */}
      {conflictWarning && (
        <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{conflictWarning}</span>
        </div>
      )}

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mt-4 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-xs font-semibold text-slate-400 py-1.5">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 mt-1">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="h-10" />;
          }

          const inPast = isDateInPast(date);
          const booked = isDateBooked(date);

          const isPickup =
            tempPickup && date.toDateString() === tempPickup.toDateString();
          const isReturn =
            tempReturn && date.toDateString() === tempReturn.toDateString();
          const inRange =
            tempPickup &&
            tempReturn &&
            date.getTime() > tempPickup.getTime() &&
            date.getTime() < tempReturn.getTime();

          let dayStyle = 'calendar-day-available';
          if (inPast) {
            dayStyle = 'calendar-day-disabled';
          } else if (booked) {
            dayStyle = 'calendar-day-booked';
          } else if (isPickup || isReturn) {
            dayStyle = 'calendar-day-selected';
          } else if (inRange) {
            dayStyle = 'bg-blue-600/30 text-blue-200 border-y border-blue-500/30';
          }

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={inPast || booked}
              className={`h-10 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all ${dayStyle}`}
            >
              <span>{date.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* Legend & Selected Dates Summary */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600 inline-block" />
            Available
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            Selected
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-3 h-3 rounded-full bg-red-900 border border-red-700 inline-block" />
            Reserved / Booked
          </span>
        </div>

        {tempPickup && (
          <div className="text-slate-300 flex items-center gap-2">
            <span>Pickup: <strong className="text-white">{formatDate(tempPickup)}</strong></span>
            {tempReturn && (
              <>
                <span>→</span>
                <span>Return: <strong className="text-white">{formatDate(tempReturn)}</strong></span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
