import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Car } from '../types';
import { useWishlist } from './useWishlist';

export interface FilterChip {
  id: string;
  type: string;
  label: string;
  onRemove: () => void;
}

export function useCarFilters(allCars: Car[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist } = useWishlist();

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [fuelType, setFuelType] = useState(searchParams.get('fuelType') || '');
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '');
  const [seatingCapacity, setSeatingCapacity] = useState(searchParams.get('seats') || '');
  const [maxPrice, setMaxPrice] = useState<number>(
    searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 30000
  );
  const [availability, setAvailability] = useState<'all' | 'available'>(
    (searchParams.get('availability') as 'all' | 'available') || 'all'
  );
  const [wishlistOnly, setWishlistOnly] = useState(searchParams.get('saved') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sync to URL search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    if (fuelType) params.set('fuelType', fuelType);
    if (transmission) params.set('transmission', transmission);
    if (seatingCapacity) params.set('seats', seatingCapacity);
    if (maxPrice < 30000) params.set('maxPrice', maxPrice.toString());
    if (availability === 'available') params.set('availability', 'available');
    if (wishlistOnly) params.set('saved', 'true');
    if (sortBy !== 'recommended') params.set('sortBy', sortBy);

    setSearchParams(params, { replace: true });
  }, [
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
    setSearchParams,
  ]);

  // Client-side filtering & sorting
  const filteredCars = useMemo(() => {
    let result = [...allCars];

    // 1. Text Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((car) => {
        const brandMatch = car.brand?.toLowerCase().includes(q);
        const modelMatch = car.model?.toLowerCase().includes(q);
        const nameMatch = car.name?.toLowerCase().includes(q);
        const categoryMatch = car.category?.toLowerCase().includes(q);
        const fuelMatch = car.fuelType?.toLowerCase().includes(q);
        return brandMatch || modelMatch || nameMatch || categoryMatch || fuelMatch;
      });
    }

    // 2. Category
    if (category) {
      result = result.filter(
        (car) => car.category.toLowerCase() === category.toLowerCase()
      );
    }

    // 3. Brand
    if (brand) {
      result = result.filter(
        (car) => car.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    // 4. Fuel Type
    if (fuelType) {
      result = result.filter(
        (car) => car.fuelType.toLowerCase() === fuelType.toLowerCase()
      );
    }

    // 5. Transmission
    if (transmission) {
      result = result.filter(
        (car) => car.transmission.toLowerCase() === transmission.toLowerCase()
      );
    }

    // 6. Seating Capacity
    if (seatingCapacity) {
      const seats = parseInt(seatingCapacity, 10);
      result = result.filter((car) => car.seatingCapacity >= seats);
    }

    // 7. Max Price
    if (maxPrice) {
      result = result.filter((car) => car.dailyPrice <= maxPrice);
    }

    // 8. Availability
    if (availability === 'available') {
      result = result.filter(
        (car) => car.isAvailable !== false && car.availabilityStatus !== 'Reserved'
      );
    }

    // 9. Wishlist only
    if (wishlistOnly) {
      result = result.filter((car) => wishlist.includes(car.id));
    }

    // 10. Sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.dailyPrice - b.dailyPrice);
        break;
      case 'price_desc':
        result.sort((a, b) => b.dailyPrice - a.dailyPrice);
        break;
      case 'newest':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'recommended':
      default:
        result.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return (b.popularity || 0) - (a.popularity || 0);
        });
        break;
    }

    return result;
  }, [
    allCars,
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
    wishlist,
  ]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearch('');
    setCategory('');
    setBrand('');
    setFuelType('');
    setTransmission('');
    setSeatingCapacity('');
    setMaxPrice(30000);
    setAvailability('all');
    setWishlistOnly(false);
    setSortBy('recommended');
  }, []);

  // Compute active chips
  const activeChips = useMemo(() => {
    const chips: FilterChip[] = [];

    if (search.trim()) {
      chips.push({
        id: 'search',
        type: 'Search',
        label: `"${search.trim()}"`,
        onRemove: () => setSearch(''),
      });
    }

    if (category) {
      chips.push({
        id: 'category',
        type: 'Category',
        label: category,
        onRemove: () => setCategory(''),
      });
    }

    if (brand) {
      chips.push({
        id: 'brand',
        type: 'Brand',
        label: brand,
        onRemove: () => setBrand(''),
      });
    }

    if (fuelType) {
      chips.push({
        id: 'fuel',
        type: 'Fuel',
        label: fuelType,
        onRemove: () => setFuelType(''),
      });
    }

    if (transmission) {
      chips.push({
        id: 'transmission',
        type: 'Transmission',
        label: transmission,
        onRemove: () => setTransmission(''),
      });
    }

    if (seatingCapacity) {
      chips.push({
        id: 'seats',
        type: 'Seats',
        label: `${seatingCapacity}+ Seats`,
        onRemove: () => setSeatingCapacity(''),
      });
    }

    if (maxPrice < 30000) {
      chips.push({
        id: 'price',
        type: 'Max Price',
        label: `≤ ₹${maxPrice.toLocaleString('en-IN')}`,
        onRemove: () => setMaxPrice(30000),
      });
    }

    if (availability === 'available') {
      chips.push({
        id: 'availability',
        type: 'Status',
        label: 'Available Only',
        onRemove: () => setAvailability('all'),
      });
    }

    if (wishlistOnly) {
      chips.push({
        id: 'wishlist',
        type: 'Wishlist',
        label: 'Saved Vehicles Only',
        onRemove: () => setWishlistOnly(false),
      });
    }

    return chips;
  }, [
    search,
    category,
    brand,
    fuelType,
    transmission,
    seatingCapacity,
    maxPrice,
    availability,
    wishlistOnly,
  ]);

  const hasActiveFilters = activeChips.length > 0;

  return {
    // States
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

    // Setters
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

    // Actions & Computed
    filteredCars,
    totalCount: allCars.length,
    filteredCount: filteredCars.length,
    activeChips,
    hasActiveFilters,
    clearAllFilters,
  };
}
