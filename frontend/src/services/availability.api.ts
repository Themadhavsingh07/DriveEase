import api from '../lib/api';
import {
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  MonthlyCalendarResponse,
  DateRangeAvailabilityResponse,
  SearchAvailableCarsParams,
  SearchAvailableCarsResponse,
} from '../types/availability';

export const availabilityApi = {
  /**
   * Check real-time vehicle availability for a specific pickup/return interval.
   */
  checkAvailability: async (data: CheckAvailabilityRequest): Promise<CheckAvailabilityResponse> => {
    return api.post<CheckAvailabilityResponse>('/v1/availability/check', data);
  },

  /**
   * Retrieve monthly calendar availability for a vehicle.
   */
  getMonthlyCalendar: async (
    carId: string,
    month: number,
    year: number
  ): Promise<MonthlyCalendarResponse> => {
    return api.get<MonthlyCalendarResponse>(
      `/v1/availability/cars/${carId}/calendar?month=${month}&year=${year}`
    );
  },

  /**
   * Retrieve availability over an arbitrary date range.
   */
  getDateRangeAvailability: async (
    carId: string,
    startDate: string,
    endDate: string
  ): Promise<DateRangeAvailabilityResponse> => {
    return api.get<DateRangeAvailabilityResponse>(
      `/v1/availability/cars/${carId}?startDate=${startDate}&endDate=${endDate}`
    );
  },

  /**
   * Search all available vehicles across fleet for an interval.
   */
  searchAvailableCars: async (
    params: SearchAvailableCarsParams
  ): Promise<SearchAvailableCarsResponse> => {
    return api.post<SearchAvailableCarsResponse>('/v1/availability/search', params);
  },
};

export default availabilityApi;
