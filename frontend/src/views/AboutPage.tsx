import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import {
  Car,
  ShieldCheck,
  Award,
  Users,
  Compass,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { mockLocations } from '../data/benefits';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-16 space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest block">
          About DriveEase
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#101B2D] tracking-tight">
          Your Journey, Your Way.
        </h1>
        <p className="text-base text-[#64748B] leading-relaxed">
          Founded with a clear purpose: to elevate the car rental standard in India into a digital-first,
          transparent, and luxurious mobility service you can trust every single kilometer.
        </p>
      </div>

      {/* Brand Mission & Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#101B2D]">Our Mission</h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            To provide seamless, reliable vehicle access with zero paperwork friction, completely transparent
            pricing, and an immaculate fleet ready whenever you need to hit the road.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#101B2D]">Uncompromising Safety</h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Every vehicle in our fleet undergoes a thorough 40-point mechanical inspection, complete interior
            sanitization, and comes with comprehensive roadside cover before any handover.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#101B2D]">Transparent Standard</h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            No surprise add-ons, no hidden fuel penalties, and no delayed security deposit returns. We believe
            customer trust is earned by clarity from quote to receipt.
          </p>
        </div>
      </div>

      {/* Hub Network Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest block">
            Nationwide Coverage
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101B2D]">
            Metropolitan Hubs & Airport Terminal Pickups
          </h2>
          <p className="text-sm text-[#64748B]">
            Convenient physical handover lounges and express curbside terminal dispatch at prime locations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockLocations.slice(0, 9).map((loc, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#1E293B]"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span>{loc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-[#101B2D] text-white rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Join thousands of satisfied drivers across India
        </h2>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">
          Experience our transparent booking engine and certified vehicle collection today.
        </p>
        <Link to="/cars" className="inline-block">
          <Button variant="primary" size="lg" className="font-bold">
            <span>Explore Our Fleet</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
