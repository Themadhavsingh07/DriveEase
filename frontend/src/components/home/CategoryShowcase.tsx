import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { CarCategory } from '../../types';
import { ArrowUpRight } from 'lucide-react';

export const CategoryShowcase: React.FC = () => {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<{ categories: CarCategory[] }>('/cars/categories');
      return res.categories;
    },
  });

  return (
    <section className="py-16 relative border-y border-slate-900 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">
            Automotive Categories
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            Choose Your Driving Persona
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            From whispering electric power to roaring twin-turbo V8s, find the exact machine suited to your journey.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              to={`/cars?category=${cat.slug}`}
              className="group glass-panel rounded-2xl p-4 text-center hover:border-sky-500/40 transition-all duration-300 hover:-translate-y-1 block relative overflow-hidden"
            >
              <div className="h-28 rounded-xl overflow-hidden bg-slate-900 mb-3 relative">
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                {cat.name}
              </h3>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {cat._count?.cars ?? 0} Vehicles
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
