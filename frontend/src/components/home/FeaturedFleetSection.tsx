import React from 'react';
import { Link } from 'react-router-dom';
import { mockCars } from '../../data/cars';
import { CarCard } from '../cars/CarCard';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export const FeaturedFleetSection: React.FC = () => {
  // Take first 6 cars
  const featuredCars = mockCars.slice(0, 6);

  return (
    <section className="py-24 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Curated Fleet Selection
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101B2D] tracking-tight">
              Explore Our Premium Fleet
            </h2>
            <p className="text-[#64748B] text-sm mt-1 max-w-xl">
              Choose from our carefully selected collection of vehicles.
            </p>
          </div>

          <Link to="/cars">
            <Button variant="outline" size="sm" className="font-semibold">
              <span>View All Vehicles ({mockCars.length})</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* 6 Car Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCars.map((car) => (
            <CarCard key={car.id} car={car} viewMode="grid" />
          ))}
        </div>
      </div>
    </section>
  );
};
