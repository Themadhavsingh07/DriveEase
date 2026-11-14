import React from 'react';
import { Compass, CheckCircle2, ShieldAlert, Sparkles, AlertOctagon, Car, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RentalGuidelinesPage: React.FC = () => {
  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
          <HeartHandshake className="w-4 h-4" />
          <span>Trust & Safety</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#101B2D] tracking-tight">
          DriveEase Rental Guidelines
        </h1>
        <p className="text-sm sm:text-base text-[#64748B]">
          Essential instructions, best practices, and community guidelines to ensure a flawless driving journey.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1: Pre-Trip Handover */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#101B2D]">Before You Drive: The Handover Protocol</h2>
              <p className="text-xs text-[#64748B]">Takes less than 3 minutes with your concierge</p>
            </div>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#334155]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Perform a 360° exterior walkaround; verify any existing minor scratches on the handover form.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Verify fuel gauge or EV battery percentage matches the dashboard starting reading.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Confirm the glovebox contains physical RC copy, commercial insurance, and pollution certificate.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Adjust mirrors, seat ergonomics, and sync Apple CarPlay / Android Auto before setting off.</span>
            </li>
          </ul>
        </div>

        {/* Step 2: On The Road */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#101B2D]">During Your Journey: Safety & Etiquette</h2>
              <p className="text-xs text-[#64748B]">Respecting regulations and preserving vehicle health</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#475569]">
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1.5">
              <h4 className="font-bold text-[#101B2D]">Speed Advisory</h4>
              <p>Adhere strictly to posted highway speed limits (max 100-120 km/h). Telematics alert at sustained excessive speeds.</p>
            </div>
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1.5">
              <h4 className="font-bold text-[#101B2D]">FASTag & Tolls</h4>
              <p>All cars come equipped with active FASTag. Toll charges incurred are automatically deducted from deposit or billed at check-in.</p>
            </div>
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1.5">
              <h4 className="font-bold text-[#101B2D]">Smoke-Free Cabin</h4>
              <p>Strictly 100% non-smoking fleet. A deep cleaning sanitization penalty of ₹3,500 applies if tobacco residue is detected.</p>
            </div>
          </div>
        </div>

        {/* Step 3: Returning */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#101B2D]">Returning Your Car: Closing Your Rental</h2>
              <p className="text-xs text-[#64748B]">Effortless wrap-up and instant digital sign-off</p>
            </div>
          </div>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#475569]">
            <li>Return the car at your scheduled dropoff hub or selected doorstep return address.</li>
            <li>Take 60 seconds to inspect the cabin, boot, and door pockets for mobile phones, chargers, or sunglasses.</li>
            <li>Sign off on the digital return checklist with your concierge.</li>
            <li>Your refundable deposit is released automatically and tracked in your <Link to="/dashboard" className="text-[#2563EB] font-semibold hover:underline">Customer Dashboard</Link>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RentalGuidelinesPage;
