import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import availabilityApi from '../services/availability.api';
import {
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  MonthlyCalendarResponse,
  SearchAvailableCarsParams,
  SearchAvailableCarsResponse,
} from '../types/availability';

export const AVAILABILITY_KEYS = {
  all: ['availability'] as const,
  monthly: (carId: string, month: number, year: number) =>
    [...AVAILABILITY_KEYS.all, 'monthly', carId, month, year] as const,
  range: (carId: string, start: string, end: string) =>
    [...AVAILABILITY_KEYS.all, 'range', carId, start, end] as const,
  check: (carId: string, pickup: string, returnDate: string) =>
    [...AVAILABILITY_KEYS.all, 'check', carId, pickup, returnDate] as const,
  search: (params: Record<string, any>) =>
    [...AVAILABILITY_KEYS.all, 'search', params] as const,
};

/**
 * Hook to retrieve monthly calendar availability for a car.
 */
export function useMonthlyAvailability(carId: string, month: number, year: number) {
  return useQuery<MonthlyCalendarResponse>({
    queryKey: AVAILABILITY_KEYS.monthly(carId, month, year),
    queryFn: () => availabilityApi.getMonthlyCalendar(carId, month, year),
    enabled: Boolean(carId) && month >= 1 && month <= 12 && year >= 2024,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to check availability for an arbitrary date range.
 */
export function useCarAvailability(carId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: AVAILABILITY_KEYS.range(carId, startDate || '', endDate || ''),
    queryFn: () => availabilityApi.getDateRangeAvailability(carId, startDate!, endDate!),
    enabled: Boolean(carId && startDate && endDate),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook for checking availability of a vehicle on demand.
 */
export function useCheckAvailability() {
  const queryClient = useQueryClient();

  return useMutation<CheckAvailabilityResponse, Error, CheckAvailabilityRequest>({
    mutationFn: (data: CheckAvailabilityRequest) => availabilityApi.checkAvailability(data),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.setQueryData(
        AVAILABILITY_KEYS.check(variables.carId, variables.pickupDateTime, variables.returnDateTime),
        data
      );
    },
  });
}

/**
 * Hook to search available cars across the fleet for a specific interval.
 */
export function useAvailableCars(params?: SearchAvailableCarsParams, enabled = true) {
  const isRunnable = Boolean(
    enabled && params?.pickupDateTime && params?.returnDateTime
  );

  return useQuery<SearchAvailableCarsResponse>({
    queryKey: AVAILABILITY_KEYS.search(params || {}),
    queryFn: () => availabilityApi.searchAvailableCars(params!),
    enabled: isRunnable,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
