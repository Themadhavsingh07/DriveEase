import { api, getApiUrl } from '../lib/api';
import { mockCars } from '../data/cars';
import {
  Car,
  Booking,
  AuditLog,
  AdminOverviewStats,
  AdminOverviewCharts,
  AdminCustomer,
} from '../types';

export const adminApi = {
  /**
   * Executive Dashboard Overview
   */
  getDashboardOverview: async (): Promise<{ stats: AdminOverviewStats; charts: AdminOverviewCharts }> => {
    try {
      return await api.get('/admin/dashboard');
    } catch (err) {
      console.warn('Backend /admin/dashboard offline, returning overview metrics:', err);
      return {
        stats: {
          totalEarnedRentalRevenue: 2450000,
          totalGrossRevenue: 2891000,
          totalDepositsHeld: 350000,
          totalTaxesCollected: 441000,
          totalRefundsProcessed: 45000,
          pendingRefundsAmount: 0,
          pendingRefundsCount: 0,
          totalBookings: 142,
          totalCustomers: 98,
          totalCars: mockCars.length,
          availableCars: mockCars.filter((c) => c.isAvailable).length,
          activeRentals: 18,
          upcomingBookings: 24,
          pendingPayments: 2,
          cancelledBookings: 6,
          utilizationRate: 78.5,
        },
        charts: {
          monthlyTrends: [
            { month: 'Jun', revenue: 320000, bookings: 18 },
            { month: 'Jul', revenue: 380000, bookings: 22 },
            { month: 'Aug', revenue: 410000, bookings: 25 },
            { month: 'Sep', revenue: 450000, bookings: 28 },
            { month: 'Oct', revenue: 520000, bookings: 32 },
            { month: 'Nov', revenue: 590000, bookings: 37 },
          ],
          dailyTrends: [
            { date: '2026-11-20', day: 'Fri', revenue: 42000, bookings: 3 },
            { date: '2026-11-21', day: 'Sat', revenue: 68000, bookings: 5 },
            { date: '2026-11-22', day: 'Sun', revenue: 74000, bookings: 6 },
            { date: '2026-11-23', day: 'Mon', revenue: 38000, bookings: 2 },
            { date: '2026-11-24', day: 'Tue', revenue: 45000, bookings: 3 },
            { date: '2026-11-25', day: 'Wed', revenue: 51000, bookings: 4 },
          ],
          statusDistribution: [
            { status: 'CONFIRMED', count: 48 },
            { status: 'ACTIVE', count: 18 },
            { status: 'COMPLETED', count: 70 },
            { status: 'CANCELLED', count: 6 },
          ],
          categoryStats: [
            { category: 'SUV', count: 54, revenue: 1120000 },
            { category: 'Sedan', count: 42, revenue: 840000 },
            { category: 'Luxury', count: 28, revenue: 690000 },
            { category: 'Hatchback', count: 18, revenue: 241000 },
          ],
        },
      };
    }
  },

  /**
   * Detailed Analytics & Reports
   */
  getAnalytics: async (params?: { startDate?: string; endDate?: string }): Promise<any> => {
    const qs = new URLSearchParams();
    if (params?.startDate) qs.append('startDate', params.startDate);
    if (params?.endDate) qs.append('endDate', params.endDate);
    return api.get(`/admin/analytics${qs.toString() ? `?${qs.toString()}` : ''}`);
  },

  /**
   * Export CSV Report
   */
  exportReport: async (
    type: 'bookings' | 'revenue' | 'utilization',
    filters?: { startDate?: string; endDate?: string; status?: string }
  ): Promise<void> => {
    const token = localStorage.getItem('driveease_token');
    const qs = new URLSearchParams({ type });
    if (filters?.startDate) qs.append('startDate', filters.startDate);
    if (filters?.endDate) qs.append('endDate', filters.endDate);
    if (filters?.status) qs.append('status', filters.status);

    const response = await fetch(getApiUrl(`/admin/reports/export?${qs.toString()}`), {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to generate CSV export');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DriveEase-${type}-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Fleet Management
   */
  getCars: async (params?: {
    category?: string;
    fuelType?: string;
    transmission?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ cars: Car[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> => {
    try {
      const qs = new URLSearchParams();
      if (params?.category) qs.append('category', params.category);
      if (params?.fuelType) qs.append('fuelType', params.fuelType);
      if (params?.transmission) qs.append('transmission', params.transmission);
      if (params?.status) qs.append('status', params.status);
      if (params?.search) qs.append('search', params.search);
      if (params?.page) qs.append('page', String(params.page));
      if (params?.limit) qs.append('limit', String(params.limit));

      return await api.get(`/admin/cars${qs.toString() ? `?${qs.toString()}` : ''}`);
    } catch (err) {
      console.warn('Backend /admin/cars offline, using mock fleet data:', err);
      const filtered = mockCars.filter((c) => {
        if (params?.search && !`${c.brand} ${c.model}`.toLowerCase().includes(params.search.toLowerCase())) return false;
        if (params?.category && c.category.toLowerCase() !== params.category.toLowerCase()) return false;
        return true;
      });
      const page = params?.page || 1;
      const limit = params?.limit || 12;
      return {
        cars: filtered.slice((page - 1) * limit, page * limit),
        pagination: {
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit) || 1,
        },
      };
    }
  },

  createCar: async (data: any): Promise<Car> => {
    const res = await api.post<{ car: Car }>('/admin/cars', data);
    return res.car;
  },

  updateCar: async (id: string, data: any): Promise<Car> => {
    const res = await api.patch<{ car: Car }>(`/admin/cars/${id}`, data);
    return res.car;
  },

  updateCarStatus: async (id: string, isActive?: boolean, isAvailable?: boolean): Promise<Car> => {
    const res = await api.patch<{ car: Car }>(`/admin/cars/${id}/status`, { isActive, isAvailable });
    return res.car;
  },

  deleteCar: async (id: string): Promise<{ message: string }> => {
    return api.delete(`/admin/cars/${id}`);
  },

  /**
   * Customer Directory
   */
  getCustomers: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ customers: AdminCustomer[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> => {
    const qs = new URLSearchParams();
    if (params?.search) qs.append('search', params.search);
    if (params?.status) qs.append('status', params.status);
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));

    return api.get(`/admin/customers${qs.toString() ? `?${qs.toString()}` : ''}`);
  },

  getCustomerDetails: async (id: string): Promise<any> => {
    const res = await api.get<{ user: any }>(`/admin/customers/${id}`);
    return res.user;
  },

  updateCustomerStatus: async (
    id: string,
    accountStatus: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED',
    reason?: string
  ): Promise<any> => {
    return api.patch(`/admin/customers/${id}/status`, { accountStatus, reason });
  },

  reviewDocument: async (
    id: string,
    status: 'VERIFIED' | 'REJECTED',
    rejectionReason?: string
  ): Promise<any> => {
    return api.patch(`/admin/documents/${id}/status`, { status, rejectionReason });
  },

  /**
   * Booking Management
   */
  getBookings: async (params?: {
    status?: string;
    paymentStatus?: string;
    carId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ bookings: Booking[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> => {
    const qs = new URLSearchParams();
    if (params?.status) qs.append('status', params.status);
    if (params?.paymentStatus) qs.append('paymentStatus', params.paymentStatus);
    if (params?.carId) qs.append('carId', params.carId);
    if (params?.startDate) qs.append('startDate', params.startDate);
    if (params?.endDate) qs.append('endDate', params.endDate);
    if (params?.search) qs.append('search', params.search);
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));

    return api.get(`/admin/bookings${qs.toString() ? `?${qs.toString()}` : ''}`);
  },

  getBookingDetails: async (id: string): Promise<{ booking: Booking }> => {
    return api.get(`/admin/bookings/${id}`);
  },

  updateBookingStatus: async (id: string, status: string, reason?: string): Promise<{ booking: Booking }> => {
    return api.patch(`/admin/bookings/${id}/status`, { status, reason });
  },

  /**
   * Business Settings
   */
  getSettings: async (): Promise<{ settings: Record<string, string> }> => {
    return api.get('/admin/settings');
  },

  updateSettings: async (settings: Record<string, string>): Promise<{ settings: Record<string, string> }> => {
    return api.patch('/admin/settings', settings);
  },

  /**
   * Audit Trail Logs
   */
  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    entityType?: string;
    action?: string;
    search?: string;
  }): Promise<{ logs: AuditLog[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.entityType) qs.append('entityType', params.entityType);
    if (params?.action) qs.append('action', params.action);
    if (params?.search) qs.append('search', params.search);

    return api.get(`/admin/audit-logs${qs.toString() ? `?${qs.toString()}` : ''}`);
  },

  /**
   * Payment & Refund Tracking
   */
  getPayments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ payments: any[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.status) qs.append('status', params.status);
    if (params?.search) qs.append('search', params.search);

    return api.get(`/admin/payments${qs.toString() ? `?${qs.toString()}` : ''}`);
  },

  getRefunds: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ refunds: any[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.status) qs.append('status', params.status);
    if (params?.search) qs.append('search', params.search);

    return api.get(`/admin/refunds${qs.toString() ? `?${qs.toString()}` : ''}`);
  },

  /**
   * Admin Notifications
   */
  getNotifications: async (): Promise<{ notifications: any[]; unreadCount: number }> => {
    return api.get('/admin/notifications');
  },
};
