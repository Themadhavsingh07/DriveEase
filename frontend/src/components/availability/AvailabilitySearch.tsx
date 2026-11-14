import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Search, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { TimeSelector } from './TimeSelector';
import { mockLocations } from '../../data/benefits';

export interface AvailabilitySearchProps {
  initialPickupLocation?: string;
  initialPickupDate?: string;
  initialPickupTime?: string;
  initialReturnDate?: string;
  initialReturnTime?: string;
  onSearchSubmit?: (params: Record<string, string>) => void;
  className?: string;
}

export const AvailabilitySearch: React.FC<AvailabilitySearchProps> = ({
  initialPickupLocation = mockLocations[0],
  initialPickupDate,
  initialPickupTime = '10:00',
  initialReturnDate,
  initialReturnTime = '18:00',
  onSearchSubmit,
  className = '',
}) => {
  const navigate = useNavigate();

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const defaultReturn = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  const [pickupLocation, setPickupLocation] = useState(initialPickupLocation);
  const [pickupDate, setPickupDate] = useState(
    initialPickupDate || tomorrow.toISOString().split('T')[0]
  );
  const [pickupTime, setPickupTime] = useState(initialPickupTime);
  const [returnDate, setReturnDate] = useState(
    initialReturnDate || defaultReturn.toISOString().split('T')[0]
  );
  const [returnTime, setReturnTime] = useState(initialReturnTime);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const todayStr = new Date().toISOString().split('T')[0];
    if (pickupDate < todayStr) {
      setValidationError('Pickup date cannot be in the past.');
      return;
    }

    if (returnDate < pickupDate) {
      setValidationError('Return date must be on or after pickup date.');
      return;
    }

    if (returnDate === pickupDate && returnTime <= pickupTime) {
      setValidationError('Return time must be after pickup time for same-day rentals.');
      return;
    }

    const searchParams = {
      pickupLocation,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
    };

    if (onSearchSubmit) {
      onSearchSubmit(searchParams);
    } else {
      const query = new URLSearchParams(searchParams);
      navigate(`/cars?${query.toString()}`);
    }
  };

  return (
    <div
      className={`bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-[#1E293B] ${className}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Pickup Location */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#101B2D] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Pickup Hub Location</span>
            </label>
            <div className="relative">
              <select
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#2563EB] cursor-pointer"
              >
                {mockLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pickup Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#101B2D] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Pickup Date</span>
              </label>
              <input
                type="date"
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#2563EB] cursor-pointer"
              />
            </div>
            <TimeSelector label="Time" value={pickupTime} onChange={setPickupTime} />
          </div>

          {/* Return Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#101B2D] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Return Date</span>
              </label>
              <input
                type="date"
                value={returnDate}
                min={pickupDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#2563EB] cursor-pointer"
              />
            </div>
            <TimeSelector label="Time" value={returnTime} onChange={setReturnTime} />
          </div>
        </div>

        {validationError && (
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
            {validationError}
          </p>
        )}

        <div className="flex items-center justify-end pt-2">
          <Button type="submit" variant="primary" size="md" className="font-bold shadow-md">
            <Search className="w-4 h-4 mr-1.5" />
            <span>Search Available Fleet</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </form>
    </div>
  );
};
