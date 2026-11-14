import React, { useMemo } from 'react';
import { Car } from '../../types';
import { mockCars } from '../../data/cars';
import { CarCard } from './CarCard';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RelatedVehiclesProps {
  currentCar: Car;
}

export const RelatedVehicles: React.FC<RelatedVehiclesProps> = ({ currentCar }) => {
  const relatedCars = useMemo(() => {
    // 1. Same category first
    const sameCategory = mockCars.filter(
      (c) => c.id !== currentCar.id && c.category === currentCar.category
    );

    // 2. Similar price range (+/- 40%)
    const similarPrice = mockCars.filter(
      (c) =>
        c.id !== currentCar.id &&
        c.category !== currentCar.category &&
        Math.abs(c.dailyPrice - currentCar.dailyPrice) <= currentCar.dailyPrice * 0.4
    );

    const candidates = [...sameCategory, ...similarPrice];
    const unique = Array.from(new Set(candidates.map((c) => c.id)))
      .map((id) => candidates.find((c) => c.id === id)!)
      .slice(0, 3);

    // Fallback if not enough candidates
    if (unique.length < 3) {
      const remaining = mockCars
        .filter((c) => c.id !== currentCar.id && !unique.some((u) => u.id === c.id))
        .slice(0, 3 - unique.length);
      return [...unique, ...remaining];
    }

    return unique;
  }, [currentCar]);

  if (relatedCars.length === 0) return null;

  return (
    <section className="pt-10 border-t border-slate-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Recommendations
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101B2D]">
            Similar Cars You May Like
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Compare alternative models in the {currentCar.category} category and comparable price brackets.
          </p>
        </div>

        <Link
          to={`/cars?category=${currentCar.category}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
        >
          <span>View all {currentCar.category}s</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedCars.map((car) => (
          <CarCard key={car.id} car={car} viewMode="grid" />
        ))}
      </div>
    </section>
  );
};
