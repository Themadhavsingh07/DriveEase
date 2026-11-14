import React from 'react';
import { ShieldCheck, CircleDollarSign, CalendarRange, Clock4, Award, Sparkles } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const pillars = [
    {
      icon: CircleDollarSign,
      title: '100% Transparent Pricing',
      desc: 'Itemized calculations with zero hidden charges. Taxes, insurance tiers, and refundable deposits are visible upfront.',
      color: 'text-sky-400',
      border: 'border-sky-500/20',
      bg: 'bg-sky-500/10',
    },
    {
      icon: CalendarRange,
      title: 'Real-Time Availability',
      desc: 'Our atomic database scheduler guarantees no double bookings. If a date is available, it is yours.',
      color: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: ShieldCheck,
      title: 'Fully Insured & Sanitized',
      desc: 'Every vehicle undergoes a 40-point mechanical inspection, complete cabin sanitization, and full comprehensive cover.',
      color: 'text-indigo-400',
      border: 'border-indigo-500/20',
      bg: 'bg-indigo-500/10',
    },
    {
      icon: Clock4,
      title: '24/7 White-Glove Concierge',
      desc: 'Round-the-clock roadside assistance, airport curbside handover, and personalized trip dispatch.',
      color: 'text-amber-400',
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/10',
    },
    {
      icon: Award,
      title: 'Flexible Rental Periods',
      desc: 'Rent from 24 hours to 30 days with hassle-free cancellation options and instant refund tracking.',
      color: 'text-rose-400',
      border: 'border-rose-500/20',
      bg: 'bg-rose-500/10',
    },
  ];

  return (
    <section id="why-us" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">
            The DriveEase Standard
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Why Discerning Drivers Choose DriveEase
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Engineered from the ground up to replace traditional rental bureaucracy with
            an effortless, digital-first luxury experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl ${pillar.bg} ${pillar.border} border flex items-center justify-center mb-5`}
                  >
                    <Icon className={`w-6 h-6 ${pillar.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-400">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
