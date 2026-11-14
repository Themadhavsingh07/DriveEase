import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Car } from '../../types';
import { CarCard } from '../cars/CarCard';
import { Spinner } from '../common/Spinner';
import { ArrowRight, Sparkles } from 'lucide-react';

export const FeaturedCars: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-cars'],
    queryFn: async () => {
      const res = await api.get<{ cars: Car[] }>('/cars/featured');
      return res.cars;
    },
  });

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Curated Fleet Selection
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Featured Luxury & Performance
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Hand-picked flagship automobiles meticulously maintained for supreme performance,
              unrivaled aesthetics, and pristine luxury comfort.
            </p>
          </div>

          <Link
            to="/cars"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors group"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cars Grid */}
        {isLoading ? (
          <Spinner size="lg" className="py-16" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.slice(0, 6).map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
