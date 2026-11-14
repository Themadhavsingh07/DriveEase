import React from 'react';
import { mockTestimonials } from '../../data/testimonials';
import { Star, CheckCircle2, MapPin } from 'lucide-react';

export const TestimonialSection: React.FC = () => {
  return (
    <section className="py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest block mb-1">
            Customer Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101B2D]">
            What Our Drivers Say
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Discover real experiences from drivers who value seamless bookings and premium vehicle standards.
          </p>
          <div className="mt-3 inline-block bg-slate-100 text-slate-600 text-[11px] font-medium px-3 py-1 rounded-full">
            * Demonstration testimonials representing anticipated customer user journeys
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockTestimonials.map((t) => (
            <div
              key={t.id}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                {/* Rating */}
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-[#1E293B] leading-relaxed italic">
                  "{t.review}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/80 flex items-center gap-3.5">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#101B2D] flex items-center gap-1.5">
                    {t.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                  </h4>
                  <p className="text-[11px] text-[#64748B]">{t.role}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" /> {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
