import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import availabilityApi from '../services/availability.api';
import { mockCars } from '../data/cars';
import { Car } from '../types';
import { useCarFilters } from '../hooks/useCarFilters';
import { useWishlist } from '../hooks/useWishlist';
import { CarCard } from '../components/cars/CarCard';
import { VehicleFilters } from '../components/cars/VehicleFilters';
import { VehicleSearch } from '../components/cars/VehicleSearch';
import { VehicleSort } from '../components/cars/VehicleSort';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  LayoutGrid,
  List,
  Filter,
  X,
  RotateCcw,
  Car as CarIcon,
  SlidersHorizontal,
  Heart,
  Sparkles,
  Loader2,
  Calendar,
} from 'lucide-react';

export const FleetPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlistCount } = useWishlist();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read potential availability query parameters from URL (e.g. from homepage search)
  const urlPickupDate = searchParams.get('pickupDate');
  const urlPickupTime = searchParams.get('pickupTime') || '10:00';
  const urlReturnDate = searchParams.get('returnDate');
  const urlReturnTime = searchParams.get('returnTime') || '18:00';
  const urlLocation = searchParams.get('pickupLocation') || searchParams.get('location') || '';

  const hasAvailabilityFilter = Boolean(urlPickupDate && urlReturnDate);

  // Fetch real cars from PostgreSQL via backend API
  const { data: serverCars, isLoading: isCarsLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      try {
        const res = await api.get<{ cars: Car[]; total: number }>('/cars?limit=50');
        if (res && Array.isArray(res.cars) && res.cars.length > 0) {
          return res.cars;
        }
        return mockCars;
      } catch (err) {
        console.warn('Backend /cars request fallback to mock data:', err);
        return mockCars;
      }
    },
    placeholderData: mockCars,
  });

  // Query available cars if date parameters are present in URL
  const { data: searchResult, isLoading: isSearchLoading } = useQuery({
    queryKey: ['available-cars', urlPickupDate, urlPickupTime, urlReturnDate, urlReturnTime, urlLocation],
    queryFn: async () => {
      if (!urlPickupDate || !urlReturnDate) return null;
      const pickupISO = `${urlPickupDate}T${urlPickupTime}:00+05:30`;
      const returnISO = `${urlReturnDate}T${urlReturnTime}:00+05:30`;
      try {
        return await availabilityApi.searchAvailableCars({
          pickupDateTime: pickupISO,
          returnDateTime: returnISO,
          pickupLocation: urlLocation || undefined,
          limit: 50,
        });
      } catch (err) {
        console.warn('Availability search fallback:', err);
        return null;
      }
    },
    enabled: hasAvailabilityFilter,
  });

  const availableCars = useMemo(() => {
    if (hasAvailabilityFilter && searchResult?.availableCars) {
      return searchResult.availableCars;
    }
    return serverCars || mockCars;
  }, [hasAvailabilityFilter, searchResult, serverCars]);

  const clearAvailabilityDates = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('pickupDate');
    newParams.delete('pickupTime');
    newParams.delete('returnDate');
    newParams.delete('returnTime');
    newParams.delete('pickupLocation');
    setSearchParams(newParams);
  };

  const {
    search,
    category,
    brand,
    fuelType,
    transmission,
    seatingCapacity,
    maxPrice,
    availability,
    wishlistOnly,
    sortBy,
    viewMode,

    setSearch,
    setCategory,
    setBrand,
    setFuelType,
    setTransmission,
    setSeatingCapacity,
    setMaxPrice,
    setAvailability,
    setWishlistOnly,
    setSortBy,
    setViewMode,

    filteredCars,
    totalCount,
    filteredCount,
    activeChips,
    hasActiveFilters,
    clearAllFilters,
  } = useCarFilters(availableCars);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest block mb-1">
            DriveEase Fleet Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#101B2D]">
            Explore Our Fleet
          </h1>
          <p className="text-sm text-[#64748B] mt-1.5 max-w-xl">
            Discover the perfect vehicle for your next journey. Browse our hand-picked fleet of luxury sedans, rugged 4x4s, family SUVs, and long-range electrics.
          </p>
        </div>

        {/* Top Summary Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-[#101B2D] flex items-center gap-2">
            <CarIcon className="w-4 h-4 text-[#2563EB]" />
            <span>
              <strong>{filteredCount}</strong> of {totalCount} Vehicles Available
            </span>
          </div>

          {wishlistCount > 0 && (
            <button
              type="button"
              onClick={() => setWishlistOnly(!wishlistOnly)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                wishlistOnly
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-white border-slate-200 text-[#475569] hover:border-rose-200'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  wishlistOnly ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                }`}
              />
              <span>Saved ({wishlistCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Availability Filter Notification Banner (Phase 4) */}
      {hasAvailabilityFilter && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#1E293B] shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#101B2D]">
                Displaying Vehicles Available for Selected Rental Period
              </p>
              <p className="text-[#475569] text-[11px] mt-0.5">
                {urlPickupDate} ({urlPickupTime}) → {urlReturnDate} ({urlReturnTime})
                {urlLocation ? ` • Hub: ${urlLocation}` : ''}
                {isSearchLoading && ' (Updating fleet availability...)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearAvailabilityDates}
            className="text-xs font-bold text-[#2563EB] hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-blue-200 hover:border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Date Filters</span>
          </button>
        </div>
      )}

      {/* Search & Utility Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="flex-1">
            <VehicleSearch
              value={search}
              onChange={setSearch}
              onClear={() => setSearch('')}
            />
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#101B2D] shadow-sm hover:bg-slate-50 cursor-pointer"
            >
              <Filter className="w-4 h-4 text-[#2563EB]" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              )}
            </button>

            {/* Sort Dropdown */}
            <VehicleSort value={sortBy} onChange={setSortBy} />

            {/* Grid / List Mode */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-1 border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#101B2D] shadow-xs'
                    : 'text-[#64748B] hover:text-[#101B2D]'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#101B2D] shadow-xs'
                    : 'text-[#64748B] hover:text-[#101B2D]'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Removable Active Filter Chips */}
        {hasActiveFilters && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1">
              Active Filters:
            </span>
            {activeChips.map((chip) => (
              <span
                key={chip.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold"
              >
                <span className="text-slate-400 font-normal">{chip.type}:</span>
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="hover:text-blue-900 transition-colors cursor-pointer"
                  title={`Remove ${chip.label}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-[#64748B] hover:text-[#2563EB] font-bold flex items-center gap-1 ml-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Sidebar + Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-24">
          <VehicleFilters
            category={category}
            setCategory={setCategory}
            brand={brand}
            setBrand={setBrand}
            fuelType={fuelType}
            setFuelType={setFuelType}
            transmission={transmission}
            setTransmission={setTransmission}
            seatingCapacity={seatingCapacity}
            setSeatingCapacity={setSeatingCapacity}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            availability={availability}
            setAvailability={setAvailability}
            wishlistOnly={wishlistOnly}
            setWishlistOnly={setWishlistOnly}
            wishlistCount={wishlistCount}
            onReset={clearAllFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        {/* Mobile Filter Sheet / Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
              onClick={() => setMobileFilterOpen(false)}
            />

            {/* Slide-in Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between p-5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="font-bold text-base text-[#101B2D]">Filter Fleet</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <VehicleFilters
                  category={category}
                  setCategory={setCategory}
                  brand={brand}
                  setBrand={setBrand}
                  fuelType={fuelType}
                  setFuelType={setFuelType}
                  transmission={transmission}
                  setTransmission={setTransmission}
                  seatingCapacity={seatingCapacity}
                  setSeatingCapacity={setSeatingCapacity}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  availability={availability}
                  setAvailability={setAvailability}
                  wishlistOnly={wishlistOnly}
                  setWishlistOnly={setWishlistOnly}
                  wishlistCount={wishlistCount}
                  onReset={clearAllFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={clearAllFilters}
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 shadow-md"
                >
                  Show {filteredCount} Cars
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Listings Section */}
        <main className="lg:col-span-3 space-y-6">
          {/* Result Count Status */}
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>
              Showing <strong className="text-[#101B2D]">{filteredCount}</strong> results matching your parameters
            </span>
          </div>

          {/* Cars Grid / List / Empty State */}
          {filteredCars.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <CarIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#101B2D]">
                  No Matching Vehicles Found
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-md mx-auto leading-relaxed">
                  We couldn't find any vehicles matching your active criteria. Try broadening your budget range, clearing brand or category filters, or searching for other models.
                </p>
              </div>
              <div className="pt-2">
                <Button variant="secondary" size="md" onClick={clearAllFilters}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span>Reset All Filters</span>
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'flex flex-col gap-6'
              }
            >
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} viewMode={viewMode} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
