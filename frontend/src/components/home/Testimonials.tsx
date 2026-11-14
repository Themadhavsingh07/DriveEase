import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Vikramaditya Singhania',
      role: 'Managing Partner, Alpha Ventures',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      car: 'BMW M3 Competition',
      rating: 5,
      review:
        'DriveEase provided immaculate service for our corporate delegation in Mumbai. The M3 was handed over punctually at BKC in showroom perfection. Transparent invoicing made reimbursement seamless.',
    },
    {
      name: 'Ananya Deshmukh',
      role: 'Creative Director',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      car: 'Porsche 911 Carrera GTS',
      rating: 5,
      review:
        'The live date calendar is a breath of fresh air. No phone calls, no waiting for confirmation. Booked the Carrera for a weekend coastal drive to Alibaug, and the entire experience was elite.',
    },
    {
      name: 'Karan Mehra',
      role: 'Tech Entrepreneur',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      car: 'Tesla Model S Plaid',
      rating: 5,
      review:
        'Supercharging access included, clean vehicle handover at Airport Terminal 2, and the Plaid acceleration was breathtaking. Will definitely be renting again through DriveEase.',
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">
            Verified Customer Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Driven by Passion, Trusted by Leaders
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Discover why entrepreneurs, executives, and automotive connoisseurs rely on DriveEase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{t.review}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-500/30"
                />
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {t.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  </h4>
                  <p className="text-[11px] text-slate-400">{t.role}</p>
                  <span className="text-[10px] text-sky-400/90 font-medium block">
                    Rented: {t.car}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
