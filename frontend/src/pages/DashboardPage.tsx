import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../services/booking.api';
import { dashboardApi, DashboardNotification } from '../services/dashboard.api';
import { api } from '../lib/api';
import { Booking } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatCurrency } from '../lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Download,
  AlertCircle,
  LogOut,
  User,
  Sparkles,
  Car as CarIcon,
  XCircle,
  Loader2,
  CheckCircle2,
  Bell,
  Check,
  Search,
  Eye,
  ArrowRight,
  ExternalLink,
  FileCheck,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');
  const [bookingFilter, setBookingFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'price-desc' | 'price-asc'>('newest');

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Cancellation modal state
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Invoice download tracking
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Sync inputs with authenticated user
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setLicense(user.drivingLicenseNumber || '');
    }
  }, [user]);

  // Protect route
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login?redirect=/dashboard');
    }
  }, [isAuthLoading, isAuthenticated, navigate]);

  // Fetch real customer bookings
  const { data: bookingsData, isLoading: isBookingsLoading } = useQuery({
    queryKey: ['my-bookings', bookingFilter],
    queryFn: () => bookingApi.getMyBookings(bookingFilter),
    enabled: isAuthenticated,
  });

  // Fetch customer notifications
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: () => dashboardApi.getNotifications(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const rawBookings = bookingsData?.bookings || [];
  const stats = bookingsData?.stats || {
    total: 0,
    upcoming: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  };

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  // Filter & Sort Bookings on Client
  const bookings = React.useMemo(() => {
    let result = [...rawBookings];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.bookingNumber?.toLowerCase().includes(q) ||
          b.car?.brand?.toLowerCase().includes(q) ||
          b.car?.model?.toLowerCase().includes(q) ||
          b.pickupLocation?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOption === 'price-desc') {
        return Number(b.totalAmount) - Number(a.totalAmount);
      }
      if (sortOption === 'price-asc') {
        return Number(a.totalAmount) - Number(b.totalAmount);
      }
      return 0;
    });

    return result;
  }, [rawBookings, searchQuery, sortOption]);

  // Notification Mutations
  const markReadMutation = useMutation({
    mutationFn: (id: string) => dashboardApi.markNotificationRead(id),
    onSuccess: () => refetchNotifications(),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => dashboardApi.markAllNotificationsRead(),
    onSuccess: () => refetchNotifications(),
  });

  // Cancellation mutation
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      bookingApi.cancelBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setCancellingBooking(null);
      setCancellationReason('');
    },
    onError: (err: any) => {
      setCancelError(err.message || 'Failed to cancel reservation');
    },
  });

  if (isAuthLoading || !user) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#2563EB] mx-auto mb-4" />
        <p className="text-xs text-[#64748B]">Loading your customer dashboard...</p>
      </div>
    );
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const data = await api.patch<{ user: any }>('/users/profile', {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        phone,
        drivingLicenseNumber: license,
      });

      updateUser(data.user);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile information.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDownloadInvoice = async (booking: Booking) => {
    setDownloadingId(booking.id);
    try {
      await bookingApi.downloadInvoice(booking.id, booking.bookingNumber);
    } catch (err: any) {
      alert(err.message || 'Failed to download invoice');
    } finally {
      setDownloadingId(null);
    }
  };

  // Preview refund calculation
  const getRefundPreview = (b: Booking) => {
    const now = new Date().getTime();
    const pickup = new Date(b.pickupDateTime).getTime();
    const hours = (pickup - now) / (1000 * 60 * 60);

    const total = Number(b.totalAmount);
    const deposit = Number(b.securityDeposit);
    const rental = Math.max(0, total - deposit);

    if (hours >= 24) {
      return {
        fee: 0,
        refund: total,
        note: 'Full 100% refund (> 24 hours prior to pickup).',
      };
    } else if (hours >= 0) {
      const fee = Math.round(rental * 0.2);
      return {
        fee,
        refund: total - fee,
        note: '20% late fee on rental portion. Security deposit is 100% refunded.',
      };
    } else {
      return {
        fee: rental,
        refund: deposit,
        note: 'Pickup time has already passed.',
      };
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#101B2D] text-white flex items-center justify-center font-black text-xl ring-4 ring-blue-100 shadow-sm shrink-0">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#101B2D]">
                {user.firstName} {user.lastName}
              </h1>
              <Badge variant="blue" size="sm">
                {user.role === 'ADMIN' ? 'Administrator' : 'Verified Driver'}
              </Badge>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              {user.email} • {user.phone || 'No phone set'}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> License:{' '}
                {user.drivingLicenseNumber || 'Not submitted yet'}
              </span>
              <Link
                to="/dashboard/profile"
                className="text-[#2563EB] hover:text-[#1D4ED8] font-bold text-[11px] underline flex items-center gap-1 ml-1"
              >
                Upload / Verify Documents <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Action Controls & Notifications */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-black text-slate-800">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-400">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-xs transition-colors ${
                          n.isRead
                            ? 'bg-slate-50/60 border-slate-100 text-slate-600'
                            : 'bg-blue-50/50 border-blue-100 text-slate-900 font-medium'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-bold text-xs">{n.title}</h5>
                          {!n.isRead && (
                            <button
                              type="button"
                              onClick={() => markReadMutation.mutate(n.id)}
                              className="text-blue-600 hover:text-blue-800 cursor-pointer"
                              title="Mark read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{n.message}</p>
                        <span className="text-[9px] text-slate-400 block mt-1">
                          {new Date(n.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tab Controls */}
          <div className="flex items-center bg-[#F8FAFC] p-1.5 rounded-2xl border border-[#E2E8F0] text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#101B2D] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#101B2D]'
              }`}
            >
              My Reservations
            </button>
            <Link
              to="/dashboard/profile"
              className="px-4 py-2 rounded-xl font-bold transition-all cursor-pointer text-[#64748B] hover:text-[#101B2D] hover:bg-slate-200/50 flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-600" /> Driver Profile & Docs
            </Link>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Sign out of account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TAB 1: RESERVATIONS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total Bookings', value: stats.total, color: 'text-[#101B2D]' },
              { label: 'Upcoming', value: stats.upcoming, color: 'text-blue-600' },
              { label: 'Active Rentals', value: stats.active, color: 'text-indigo-600' },
              { label: 'Completed', value: stats.completed, color: 'text-emerald-600' },
              { label: 'Cancelled', value: stats.cancelled, color: 'text-rose-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm text-center">
                <span className="text-[11px] font-semibold text-[#64748B] block">{s.label}</span>
                <span className={`text-2xl font-black mt-0.5 block ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Search, Filter Pills & Sorting */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {['ALL', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setBookingFilter(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bookingFilter === f
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'bg-slate-50 text-[#64748B] border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Search and Sort controls */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search reference, vehicle, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
              </select>
            </div>
          </div>

          {/* Bookings List */}
          {isBookingsLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mx-auto mb-2" />
              <p className="text-xs text-[#64748B]">Fetching your reservations...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <CarIcon className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-[#101B2D]">No Reservations Found</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                {searchQuery
                  ? `No bookings match "${searchQuery}". Try clearing your search.`
                  : `You don't have any reservations under the "${bookingFilter}" filter. Browse our premium fleet and start your next journey!`}
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate('/cars')}>
                Browse Available Cars
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((b) => {
                const car = b.car;
                const isCancellable =
                  ['CONFIRMED', 'PENDING'].includes(b.bookingStatus) &&
                  new Date(b.pickupDateTime) > new Date();

                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-4">
                      {car?.images?.[0]?.url ? (
                        <img
                          src={car.images[0].url}
                          alt={car.brand}
                          className="w-24 h-20 sm:w-28 sm:h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-24 h-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <CarIcon className="w-8 h-8 text-slate-400" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#2563EB]">
                            {b.bookingNumber}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              b.bookingStatus === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.bookingStatus === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : b.bookingStatus === 'ACTIVE'
                                ? 'bg-blue-100 text-blue-800'
                                : b.bookingStatus === 'COMPLETED'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {b.bookingStatus}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Payment: {b.paymentStatus}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-[#101B2D]">
                          {car ? `${car.brand} ${car.model}` : 'Premium Vehicle'}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />{' '}
                            {new Date(b.pickupDateTime).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span>→</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />{' '}
                            {new Date(b.returnDateTime).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span>•</span>
                          <span className="text-slate-500 font-medium">
                            {b.rentalDays} Day(s)
                          </span>
                        </div>

                        <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {b.pickupLocation}
                        </p>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-[#64748B] block">Total Amount</span>
                        <span className="text-lg font-black text-[#101B2D]">
                          {formatCurrency(Number(b.totalAmount))}
                        </span>
                      </div>

                      <div className="flex items-center flex-wrap gap-2">
                        {/* View Details Button */}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/dashboard/bookings/${b.id}`)}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </Button>

                        {/* Download Invoice Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={downloadingId === b.id}
                          onClick={() => handleDownloadInvoice(b)}
                          className="flex items-center gap-1 text-xs"
                        >
                          {downloadingId === b.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          Invoice (PDF)
                        </Button>

                        {/* Cancel Button */}
                        {isCancellable && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCancelError(null);
                              setCancellingBooking(b);
                            }}
                            className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CANCELLATION CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(cancellingBooking)}
        onClose={() => setCancellingBooking(null)}
        title="Confirm Reservation Cancellation"
        maxWidth="lg"
      >
        {cancellingBooking && (
          <div className="space-y-4 text-xs">
            {cancelError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cancelError}</span>
              </div>
            )}

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Ref:</span>
                <span className="font-mono font-bold text-slate-800">
                  {cancellingBooking.bookingNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-bold text-slate-800">
                  {cancellingBooking.car?.brand} {cancellingBooking.car?.model}
                </span>
              </div>
            </div>

            {/* Refund Preview */}
            {(() => {
              const preview = getRefundPreview(cancellingBooking);
              return (
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 space-y-2">
                  <h4 className="font-black text-amber-900 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Cancellation Policy & Refund Preview
                  </h4>
                  <div className="flex justify-between text-amber-800">
                    <span>Estimated Refund:</span>
                    <strong className="text-sm font-black text-emerald-700">
                      {formatCurrency(preview.refund)}
                    </strong>
                  </div>
                  {preview.fee > 0 && (
                    <div className="flex justify-between text-amber-800">
                      <span>Cancellation Fee:</span>
                      <strong className="text-rose-700">
                        {formatCurrency(preview.fee)}
                      </strong>
                    </div>
                  )}
                  <p className="text-[11px] text-amber-700 mt-1 border-t border-amber-200/60 pt-1">
                    {preview.note}
                  </p>
                </div>
              );
            })()}

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Reason for cancellation *
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please tell us why you are cancelling..."
                rows={3}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingBooking(null)}
              >
                Keep Reservation
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={!cancellationReason.trim()}
                isLoading={cancelMutation.isPending}
                onClick={() =>
                  cancelMutation.mutate({
                    id: cancellingBooking.id,
                    reason: cancellationReason,
                  })
                }
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
