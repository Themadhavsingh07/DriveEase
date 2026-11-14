import React from 'react';
import { Link } from 'react-router-dom';
import { mockCategories } from '../../data/categories';
import { Car, Zap, Crown, Gauge, Shield, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export const CategorySection: React.FC = () => {
  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest block mb-1">
            Browse By Type
          </span>
          <h2 className="text-3xl font-extrabold text-[#101B2D]">
            Vehicle Categories
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Explore our curated vehicle fleet segmented for every driving preference and occasion.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {mockCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/cars?category=${cat.name}`}
              className="group bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-center hover:bg-white hover:border-[#2563EB]/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block"
            >
              <div className="h-28 rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101B2D]/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </div>

              <h3 className="text-sm font-bold text-[#101B2D] group-hover:text-[#2563EB] transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                From {formatCurrency(cat.startingPrice)}/day
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
