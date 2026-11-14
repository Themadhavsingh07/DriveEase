import React from 'react';
import { mockBenefits } from '../../data/benefits';
import {
  Car,
  BadgePercent,
  ShieldCheck,
  CalendarRange,
  Headphones,
  Sparkles,
} from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Car,
  BadgePercent,
  ShieldCheck,
  CalendarRange,
  Headphones,
  Sparkles,
};

export const WhyChooseUsSection: React.FC = () => {
  return (
    <section className="py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest block mb-1">
            Platform Benefits
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101B2D]">
            Why Choose DriveEase
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Engineered to replace traditional rental bureaucracy with an effortless, transparent mobility standard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockBenefits.map((benefit) => {
            const Icon = iconMap[benefit.iconName] || Sparkles;
            return (
              <div
                key={benefit.id}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-7 hover:bg-white hover:border-[#2563EB]/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#101B2D] mb-2">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
