import React from 'react';
import { Search, Calendar, Sliders, CheckCircle, Navigation } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: Search,
      title: 'Find Your Automobile',
      desc: 'Browse our curated fleet by brand, horsepower, category, or transmission preference.',
    },
    {
      num: '02',
      icon: Calendar,
      title: 'Select Rental Dates',
      desc: 'Pick your exact pickup and drop-off dates with our real-time availability calendar.',
    },
    {
      num: '03',
      icon: Sliders,
      title: 'Customize Your Cover',
      desc: 'Select preferred protection tiers, child seats, or portable Wi-Fi with transparent quotes.',
    },
    {
      num: '04',
      icon: CheckCircle,
      title: 'Confirm & Secure',
      desc: 'Complete booking seamlessly online or choose pay-at-handover with instant confirmation.',
    },
    {
      num: '05',
      icon: Navigation,
      title: 'Take the Wheel',
      desc: 'Receive sanitized keys at your selected airport terminal or downtown hub and drive away.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-950/60 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">
            Streamlined Protocol
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            How DriveEase Works
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Five effortless steps between booking your dream vehicle and feeling the road beneath you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative glass-panel rounded-2xl p-6 border border-slate-800 text-center flex flex-col items-center"
              >
                <div className="text-[10px] font-black tracking-widest text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20 mb-4">
                  STEP {s.num}
                </div>

                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-sky-400 mb-4 shadow-lg">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
