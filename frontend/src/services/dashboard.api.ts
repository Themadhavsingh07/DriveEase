import { api } from '../lib/api';
import { Booking } from '../types';

export interface DashboardOverviewData {
  stats: {
    totalBookings: number;
    upcoming: number;
    active: number;
    completed: number;
    cancelled: number;
    totalSpent: number;
    rewardPoints: number;
  };
  verificationStatus: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | string;
  recentBookings: Booking[];
  unreadNotificationsCount: number;
}

export interface DashboardNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const dashboardApi = {
  /**
   * Fetch authenticated customer overview stats
   */
  getOverview: async (): Promise<DashboardOverviewData> => {
    return api.get<DashboardOverviewData>('/dashboard/overview');
  },

  /**
   * Fetch customer bookings with search, filter, sorting and pagination
   */
  getBookings: async (params?: {
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ bookings: Booking[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const qs = query.toString();
    return api.get(`/dashboard/bookings${qs ? `?${qs}` : ''}`);
  },

  /**
   * Fetch customer notifications
   */
  getNotifications: async (): Promise<{ notifications: DashboardNotification[]; unreadCount: number }> => {
    return api.get('/dashboard/notifications');
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: async (id: string): Promise<void> => {
    return api.patch(`/dashboard/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: async (): Promise<void> => {
    return api.patch('/dashboard/notifications/read-all');
  },
};
