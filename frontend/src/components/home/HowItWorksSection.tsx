import React from 'react';
import { mockHowItWorksSteps } from '../../data/benefits';
import { Search, CalendarDays, ShieldCheck, Navigation } from 'lucide-react';

const stepIconMap: Record<string, React.FC<{ className?: string }>> = {
  Search,
  CalendarDays,
  ShieldCheck,
  Navigation,
};

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#F5F7FA] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest block mb-1">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101B2D]">
            How DriveEase Works
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Four simple steps between picking your dream vehicle and hitting the open road.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {mockHowItWorksSteps.map((step, idx) => {
            const Icon = stepIconMap[step.iconName] || Search;
            return (
              <div
                key={step.stepNumber}
                className="relative bg-white border border-[#E2E8F0] rounded-2xl p-7 text-center shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
              >
                {/* Step badge */}
                <div className="text-xs font-black text-[#2563EB] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full mb-5">
                  STEP {step.stepNumber}
                </div>

                {/* Icon Circle */}
                <div className="w-16 h-16 rounded-2xl bg-[#101B2D] text-white flex items-center justify-center mb-5 shadow-sm">
                  <Icon className="w-7 h-7 text-[#38BDF8]" />
                </div>

                <h3 className="text-base font-bold text-[#101B2D] mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
