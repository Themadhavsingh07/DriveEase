import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { MapPin, Calendar, Clock, Search, Sparkles, Shield, ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  // Tomorrow as default pickup, 3 days after as return
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const returnDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  const [pickupLocation, setPickupLocation] = useState('Bandra Kurla Complex, Mumbai');
  const [dropoffLocation, setDropoffLocation] = useState('Bandra Kurla Complex, Mumbai');
  const [pickupDateVal, setPickupDateVal] = useState(tomorrow.toISOString().split('T')[0]);
  const [pickupTimeVal, setPickupTimeVal] = useState('10:00');
  const [returnDateVal, setReturnDateVal] = useState(returnDate.toISOString().split('T')[0]);
  const [returnTimeVal, setReturnTimeVal] = useState('18:00');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      pickupLocation,
      dropoffLocation,
      pickup: `${pickupDateVal}T${pickupTimeVal}:00`,
      return: `${returnDateVal}T${returnTimeVal}:00`,
    });
    navigate(`/cars?${params.toString()}`);
  };

  const locations = [
    'Bandra Kurla Complex, Mumbai',
    'Chhatrapati Shivaji Maharaj Airport (T2), Mumbai',
    'Worli Sea Face, Mumbai',
    'Powai Technology Park, Mumbai',
    'Juhu Beach Boulevard, Mumbai',
    'South Mumbai Heritage District',
  ];

  return (
    <div className="relative overflow-hidden pt-12 pb-24 md:py-28">
      {/* Background Graphic & Glows */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.22),rgba(255,255,255,0))]" />
      <div className="absolute top-1/4 right-0 -z-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 -z-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Title & Pitch */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-sky-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>REAL-TIME DATE AVAILABILITY & INSTANT BOOKINGS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Find Your <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Perfect Ride.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Experience unparalleled automotive freedom. Rent premium luxury sedans, sports coupes,
            and electric vehicles with authoritative transparent pricing and zero hidden fees.
          </p>
        </div>

        {/* Hero Search & Booking Form Card */}
        <div className="mt-12 max-w-5xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pickup Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" /> Pickup Location
                </label>
                <div className="relative">
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc} className="bg-slate-900 text-white">
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Return Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Return Location
                </label>
                <div className="relative">
                  <select
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc} className="bg-slate-900 text-white">
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pickup Date & Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" /> Pickup Date & Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={pickupDateVal}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPickupDateVal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                  <input
                    type="time"
                    value={pickupTimeVal}
                    onChange={(e) => setPickupTimeVal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Return Date & Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Return Date & Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={returnDateVal}
                    min={pickupDateVal}
                    onChange={(e) => setReturnDateVal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                  <input
                    type="time"
                    value={returnTimeVal}
                    onChange={(e) => setReturnTimeVal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" /> Real-time Conflict Guard
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-400" /> Instant Reservation Confirmation
                </span>
              </div>

              <Button type="submit" size="lg" className="w-full sm:w-auto px-8">
                <Search className="w-4 h-4" />
                <span>Search Available Fleet</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
