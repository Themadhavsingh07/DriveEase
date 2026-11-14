import { Car } from './index';

export type DayAvailabilityStatus = 'AVAILABLE' | 'PARTIALLY_BOOKED' | 'FULLY_BOOKED' | 'PAST';

export interface CalendarDaySlot {
  date: string; // "YYYY-MM-DD"
  dayOfWeek: number; // 0-6 (Sun-Sat)
  status: DayAvailabilityStatus;
  isAvailable: boolean;
  isPast: boolean;
  reservationCount: number;
  occupiedIntervals: Array<{
    pickupDateTime: string;
    returnDateTime: string;
    effectiveReturnDateTime?: string;
    status: string;
  }>;
}

export interface MonthlyCalendarResponse {
  carId: string;
  year: number;
  month: number;
  daysInMonth: number;
  calendar: CalendarDaySlot[];
}

export interface DateRangeAvailabilityResponse {
  carId: string;
  startDate: string;
  endDate: string;
  rangeDays: number;
  available: boolean;
  conflictsCount: number;
  blockedRanges: Array<{
    bookingNumber: string;
    pickupDateTime: string;
    returnDateTime: string;
    status: string;
  }>;
}

export interface CheckAvailabilityRequest {
  carId: string;
  pickupDateTime: string;
  returnDateTime: string;
  bufferMinutes?: number;
}

export interface CheckAvailabilityResponse {
  available: boolean;
  carId: string;
  pickupDateTime: string;
  returnDateTime: string;
  rentalDays?: number;
  durationHours?: number;
  message: string;
  conflicts?: Array<{
    pickupDateTime: string;
    returnDateTime: string;
    effectiveReturnDateTime?: string;
  }>;
  car?: {
    id: string;
    brand: string;
    model: string;
    dailyPrice: number;
    category?: string;
  };
}

export interface SearchAvailableCarsParams {
  pickupLocation?: string;
  pickupDateTime: string;
  returnDateTime: string;
  category?: string;
  brand?: string;
  fuelType?: string;
  transmission?: string;
  seatingCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface SearchAvailableCarsResponse {
  availableCars: Car[];
  cars: Car[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  searchInterval: {
    pickupDateTime: string;
    returnDateTime: string;
    rentalDays: number;
    durationHours: number;
  };
}

export interface DateSelectionState {
  pickupDate: string; // "YYYY-MM-DD"
  pickupTime: string; // "10:00"
  returnDate: string; // "YYYY-MM-DD"
  returnTime: string; // "18:00"
}
