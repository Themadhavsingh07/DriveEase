import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Search, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { mockLocations } from '../../data/benefits';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  // Tomorrow as default pickup, 3 days after as return
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const returnDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  const [pickupLocation, setPickupLocation] = useState(mockLocations[0]);
  const [dropoffLocation, setDropoffLocation] = useState(mockLocations[0]);
  const [pickupDateVal, setPickupDateVal] = useState(tomorrow.toISOString().split('T')[0]);
  const [pickupTimeVal, setPickupTimeVal] = useState('10:00');
  const [returnDateVal, setReturnDateVal] = useState(returnDate.toISOString().split('T')[0]);
  const [returnTimeVal, setReturnTimeVal] = useState('18:00');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const todayStr = new Date().toISOString().split('T')[0];
    if (pickupDateVal < todayStr) {
      setErrorMsg('Pickup date cannot be in the past.');
      return;
    }

    if (returnDateVal < pickupDateVal) {
      setErrorMsg('Return date must be on or after pickup date.');
      return;
    }

    if (returnDateVal === pickupDateVal && returnTimeVal <= pickupTimeVal) {
      setErrorMsg('Return time must be after pickup time for same-day rentals.');
      return;
    }

    const params = new URLSearchParams({
      pickupLocation,
      dropoffLocation,
      pickupDate: pickupDateVal,
      pickupTime: pickupTimeVal,
      returnDate: returnDateVal,
      returnTime: returnTimeVal,
    });
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#101B2D] via-[#16243C] to-[#101B2D] text-white pt-12 pb-24 lg:pt-16 lg:pb-32">
      {/* Background Hero Photography with Subtle Gradient Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=2000&q=80"
          alt="Luxury Car Hero"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101B2D] via-transparent to-[#101B2D]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Header Pitch */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-[#38BDF8] text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PREMIUM COMMERCIAL CAR RENTAL PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Find Your <span className="text-[#38BDF8]">Perfect Ride.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Discover premium cars, transparent pricing, and effortless bookings. Your next journey starts here.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Transparent Pricing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Clean & Verified Fleet
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant Online Booking
            </span>
          </div>
        </div>

        {/* Visually Prominent Booking Search Panel */}
        <div className="mt-12 max-w-5xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-[#1E293B]">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pickup Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#101B2D] flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB]" /> Pickup Location
                </label>
                <div className="relative">
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#1E293B] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                  >
                    {mockLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Return Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#101B2D] flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Return Location
                </label>
                <div className="relative">
                  <select
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#1E293B] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
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
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#101B2D] flex items-center gap-1.5 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-[#2563EB]" /> Pickup Date & Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={pickupDateVal}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPickupDateVal(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                  <input
                    type="time"
                    value={pickupTimeVal}
                    onChange={(e) => setPickupTimeVal(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>
              </div>

              {/* Return Date & Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#101B2D] flex items-center gap-1.5 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Return Date & Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={returnDateVal}
                    min={pickupDateVal}
                    onChange={(e) => setReturnDateVal(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                  <input
                    type="time"
                    value={returnTimeVal}
                    onChange={(e) => setReturnTimeVal(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
                {errorMsg}
              </p>
            )}

            {/* Bottom Form Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <span className="text-xs text-[#64748B]">
                Need a chauffeur or airport pickup? Select options during booking.
              </span>

              <Button type="submit" size="lg" className="w-full sm:w-auto px-8 font-bold shadow-md">
                <Search className="w-4 h-4 mr-1.5" />
                <span>Search Cars</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
