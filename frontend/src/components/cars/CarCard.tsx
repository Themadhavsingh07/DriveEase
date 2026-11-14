import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { WishlistButton } from './WishlistButton';
import { formatCurrency } from '../../lib/utils';
import { Users, Gauge, Fuel, Settings2, Star, ArrowRight, Calendar, Sparkles } from 'lucide-react';

export interface CarCardProps {
  car: Car;
  viewMode?: 'grid' | 'list';
}

export const CarCard: React.FC<CarCardProps> = ({ car, viewMode = 'grid' }) => {
  const primaryImage =
    car.images?.find((img) => img.isPrimary)?.url ||
    car.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80';

  const isAvailable = car.isAvailable !== false && car.availabilityStatus !== 'Reserved';
  const isAvailableForInterval = (car as any).isAvailableForInterval === true;

  // -------------------------
  // LIST VIEW MODE
  // -------------------------
  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-200 group">
        {/* Car Image Column */}
        <div className="relative md:w-80 h-56 md:h-auto shrink-0 bg-slate-100 overflow-hidden">
          <img
            src={primaryImage}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Badges on Image */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <Badge variant="navy" size="sm">{car.category}</Badge>
            {isAvailableForInterval ? (
              <Badge variant="success" size="sm">Available for Dates</Badge>
            ) : isAvailable ? (
              <Badge variant="success" size="sm">Available</Badge>
            ) : (
              <Badge variant="danger" size="sm">Reserved</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton carId={car.id} size="sm" />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#2563EB] tracking-wider uppercase block">
                  {car.brand} • {car.year}
                </span>
                <Link to={`/cars/${car.id}`} className="group-hover:text-[#2563EB] transition-colors">
                  <h3 className="text-xl font-bold text-[#101B2D] mt-0.5">
                    {car.brand} {car.model}
                  </h3>
                </Link>
                {car.description && (
                  <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2 max-w-2xl leading-relaxed">
                    {car.description}
                  </p>
                )}
              </div>

              {/* Rating Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shrink-0">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>{car.rating ? car.rating.toFixed(1) : '4.8'}</span>
                <span className="text-slate-400 font-normal">({car.reviewCount || 24})</span>
              </div>
            </div>

            {/* Spec Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-xs text-[#1E293B]">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <Settings2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span className="font-semibold truncate">{car.transmission}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <Fuel className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold truncate">{car.fuelType}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold truncate">{car.seatingCapacity} Seats</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <Gauge className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold truncate">{car.mileage}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-100">
            <div>
              <span className="text-[11px] text-[#64748B] block font-medium">Daily Rental Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#101B2D]">
                  {formatCurrency(car.dailyPrice)}
                </span>
                <span className="text-xs text-[#64748B] font-semibold">/ day</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Link to={`/cars/${car.id}`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto font-semibold">
                  <span>View Details</span>
                </Button>
              </Link>
              <Link to={`/cars/${car.id}#book`} className="w-full sm:w-auto">
                <Button variant="primary" size="sm" className="w-full sm:w-auto font-semibold shadow-sm">
                  <span>Book Now</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------
  // GRID VIEW MODE
  // -------------------------
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden flex flex-col group shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300">
      {/* Car Image Header */}
      <div className="relative h-52 bg-slate-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <Badge variant="navy" size="sm">{car.category}</Badge>
          {isAvailableForInterval ? (
            <Badge variant="success" size="sm">Available for Dates</Badge>
          ) : isAvailable ? (
            <Badge variant="success" size="sm">Available</Badge>
          ) : (
            <Badge variant="danger" size="sm">Reserved</Badge>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton carId={car.id} size="sm" />
        </div>

        {/* Rating Floating Tag */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-amber-800 text-xs font-bold shadow-sm">
          <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
          <span>{car.rating ? car.rating.toFixed(1) : '4.8'}</span>
          <span className="text-[10px] text-slate-400 font-normal">({car.reviewCount || 24})</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider block">
            {car.brand} • {car.year}
          </span>
          <Link to={`/cars/${car.id}`} className="group-hover:text-[#2563EB] transition-colors">
            <h3 className="text-lg font-bold text-[#101B2D] mt-0.5 line-clamp-1">
              {car.brand} {car.model}
            </h3>
          </Link>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-[#1E293B]">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <Settings2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span className="font-semibold truncate">{car.transmission}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <Fuel className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold truncate">{car.fuelType}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold truncate">{car.seatingCapacity} Seats</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <Gauge className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="font-semibold truncate">{car.mileage}</span>
            </div>
          </div>
        </div>

        {/* Card Footer: Pricing & Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#64748B] block font-medium uppercase tracking-wider">
              Daily Rate
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-black text-[#101B2D]">
                {formatCurrency(car.dailyPrice)}
              </span>
              <span className="text-[11px] text-[#64748B] font-semibold">/day</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link to={`/cars/${car.id}`}>
              <Button variant="outline" size="sm" className="px-2.5 py-1.5 text-xs font-semibold">
                Details
              </Button>
            </Link>
            <Link to={`/cars/${car.id}#book`}>
              <Button variant="primary" size="sm" className="px-3 py-1.5 text-xs font-semibold shadow-sm">
                <span>Book</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VehicleCard = CarCard;
