import React from 'react';
import { Link } from 'react-router-dom';
import { mockHowItWorksSteps } from '../data/benefits';
import { Button } from '../components/common/Button';
import {
  Search,
  CalendarDays,
  ShieldCheck,
  Navigation,
  FileCheck2,
  Clock,
  Sparkles,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

const stepIconMap: Record<string, React.FC<{ className?: string }>> = {
  Search,
  CalendarDays,
  ShieldCheck,
  Navigation,
};

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="py-16 space-y-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest block">
          Rental Protocol Guide
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#101B2D] tracking-tight">
          How DriveEase Works
        </h1>
        <p className="text-base text-[#64748B] leading-relaxed">
          From browsing our certified fleet to dropping off the keys, our streamlined four-step
          process is engineered for complete transparency, speed, and peace of mind.
        </p>
      </div>

      {/* 4 Steps Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {mockHowItWorksSteps.map((step) => {
          const Icon = stepIconMap[step.iconName] || Search;
          return (
            <div
              key={step.stepNumber}
              className="bg-white border border-[#E2E8F0] rounded-3xl p-8 text-center shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
            >
              <div className="text-xs font-black text-[#2563EB] bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full mb-6">
                STEP {step.stepNumber}
              </div>

              <div className="w-16 h-16 rounded-2xl bg-[#101B2D] text-white flex items-center justify-center mb-6 shadow-sm">
                <Icon className="w-7 h-7 text-[#38BDF8]" />
              </div>

              <h3 className="text-lg font-bold text-[#101B2D] mb-2">{step.title}</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Requirements & Guidelines */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E2E8F0] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-[#101B2D]">Documents Required</h4>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Original valid Driver's License held for at least one year and Government Photo ID (Aadhaar or Passport). International Driving Permit for foreign nationals.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-[#101B2D]">Security Deposit Policy</h4>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Refundable security deposit clearly itemized separately. It is held securely during your rental and refunded within 24 to 48 hours of vehicle return.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-[#101B2D]">Flexible Cancellation</h4>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Free cancellations up to 24 hours prior to scheduled pickup for a 100% full refund with zero hidden cancellation fees.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-[#101B2D] text-white rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ready to experience your next journey?
        </h2>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">
          Explore our complete fleet of verified hatchbacks, sedans, 4x4 SUVs, and luxury performance cars.
        </p>
        <Link to="/cars" className="inline-block">
          <Button variant="primary" size="lg" className="font-bold">
            <span>Explore Available Fleet</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
