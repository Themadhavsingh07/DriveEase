import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Spinner } from '../common/Spinner';
import { Modal } from '../common/Modal';
import { InvoiceModal } from '../booking/InvoiceModal';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import {
  Car,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  User,
  Key,
  ShieldCheck,
  Search,
  Eye,
  Ban,
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'security'>('bookings');
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');

  // Modals state
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);
  const [selectedDetailsBooking, setSelectedDetailsBooking] = useState<Booking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Profile Form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [license, setLicense] = useState(user?.drivingLicenseNumber || '');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);

  // Fetch My Bookings from API
  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', bookingFilter],
    queryFn: async () => {
      const endpoint =
        bookingFilter === 'ALL'
          ? '/bookings/my'
          : `/bookings/my?status=${bookingFilter}`;
      const res = await api.get<{
        bookings: Booking[];
        stats: {
          total: number;
          upcoming: number;
          active: number;
          completed: number;
          cancelled: number;
        };
      }>(endpoint);
      return res;
    },
  });

  const bookings = data?.bookings || [];
  const stats = data?.stats || {
    total: 0,
    upcoming: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  };

  // Cancel Booking Mutation
  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await api.patch<{ booking: Booking; refundAmount: number }>(
        `/bookings/${id}/cancel`,
        { reason }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setCancelModalBooking(null);
      setCancelReason('');
      setCancelError(null);
    },
    onError: (err: any) => {
      setCancelError(err.message || 'Failed to cancel reservation.');
    },
  });

  // Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const res = await api.patch<{ user: any }>('/auth/profile', {
        firstName,
        lastName,
        phone,
        drivingLicenseNumber: license,
      });
      updateUser(res.user);
      setProfileMsg('Profile updated successfully.');
    } catch (err: any) {
      setProfileMsg(err.message || 'Error updating profile.');
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordErr(null);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordErr(err.message || 'Failed to change password.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="blue">Confirmed</Badge>;
      case 'ACTIVE':
        return <Badge variant="emerald">Active On-Road</Badge>;
      case 'COMPLETED':
        return <Badge variant="slate">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="rose">Cancelled</Badge>;
      default:
        return <Badge variant="amber">{status}</Badge>;
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Profile Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                (user?.firstName || 'User') + ' ' + (user?.lastName || '')
              )}&background=0284c7&color=fff&size=128`
            }
            alt={user?.firstName}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-sky-500/20"
          />
          <div>
            <h1 className="text-2xl font-black text-white">
              Welcome back, {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> License Verified:{' '}
                {user?.drivingLicenseNumber || 'DL Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
              activeTab === 'bookings'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Reservations
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Security & Access
          </button>
        </div>
      </div>

      {/* TAB 1: RESERVATIONS / BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-8">
          {/* Overview KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-medium">Total Bookings</span>
              <span className="text-2xl font-black text-white mt-1 block">{stats.total}</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-blue-400 block font-medium">Upcoming</span>
              <span className="text-2xl font-black text-blue-400 mt-1 block">
                {stats.upcoming}
              </span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-emerald-400 block font-medium">Active Rentals</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                {stats.active}
              </span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-medium">Completed</span>
              <span className="text-2xl font-black text-slate-300 mt-1 block">
                {stats.completed}
              </span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center col-span-2 sm:col-span-1">
              <span className="text-xs text-red-400 block font-medium">Cancelled</span>
              <span className="text-2xl font-black text-red-400 mt-1 block">
                {stats.cancelled}
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            {(['ALL', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setBookingFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
                  bookingFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {filter === 'ALL' ? 'All Bookings' : filter}
              </button>
            ))}
          </div>

          {/* Bookings List Cards */}
          {isLoading ? (
            <Spinner size="lg" className="py-20" />
          ) : bookings.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 max-w-lg mx-auto">
              <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No Reservations Found</h3>
              <p className="text-xs text-slate-400 mt-1">
                You do not have any {bookingFilter.toLowerCase()} vehicle bookings right now.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-5"
                onClick={() => (window.location.href = '/cars')}
              >
                Explore Available Fleet
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {bookings.map((booking) => {
                const primaryImage =
                  booking.car?.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80';

                const canCancel =
                  booking.bookingStatus === 'CONFIRMED' ||
                  booking.bookingStatus === 'PENDING';

                return (
                  <div
                    key={booking.id}
                    className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
                  >
                    {/* Left: Car Photo & Details */}
                    <div className="flex items-center gap-5 w-full md:w-auto">
                      <img
                        src={primaryImage}
                        alt={booking.car?.brand || 'Vehicle'}
                        className="w-24 h-20 sm:w-32 sm:h-24 rounded-xl object-cover shrink-0 bg-slate-900"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-sky-400 uppercase">
                            {booking.bookingNumber}
                          </span>
                          {getStatusBadge(booking.bookingStatus)}
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1">
                          {booking.car?.brand || 'Luxury'} {booking.car?.model || 'Vehicle'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {formatDateTime(booking.pickupDateTime)}
                          </span>
                          <span>→</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {formatDateTime(booking.returnDateTime)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-400 block">Total Amount</span>
                        <span className="text-xl font-black text-white">
                          {formatCurrency(booking.totalAmount)}
                        </span>
                        <span className="text-[10px] text-emerald-400 block font-semibold">
                          Payment: {booking.paymentStatus}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDetailsBooking(booking)}
                          title="View complete booking details"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Details
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedInvoiceBooking(booking)}
                          title="View and print tax invoice"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1 text-sky-400" /> Invoice
                        </Button>

                        {canCancel && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setCancelModalBooking(booking)}
                          >
                            <Ban className="w-3.5 h-3.5 mr-1" /> Cancel
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

      {/* TAB 2: PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 mx-auto">
          <h2 className="text-xl font-bold text-white mb-1">Driver Profile & License</h2>
          <p className="text-xs text-slate-400 mb-6">
            Ensure your details match your government photo identification for swift vehicle handover.
          </p>

          {profileMsg && (
            <div className="mb-4 p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-sky-400 text-xs">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Driver's License Number
              </label>
              <input
                type="text"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <Button type="submit" variant="primary" size="md" className="mt-2">
              Save Profile Updates
            </Button>
          </form>
        </div>
      )}

      {/* TAB 3: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 mx-auto">
          <h2 className="text-xl font-bold text-white mb-1">Change Security Password</h2>
          <p className="text-xs text-slate-400 mb-6">
            Update your account password with at least 6 characters.
          </p>

          {passwordMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs">
              {passwordMsg}
            </div>
          )}
          {passwordErr && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs">
              {passwordErr}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                New Secure Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <Button type="submit" variant="primary" size="md" className="mt-2">
              Update Password
            </Button>
          </form>
        </div>
      )}

      {/* INVOICE MODAL */}
      <InvoiceModal
        isOpen={!!selectedInvoiceBooking}
        onClose={() => setSelectedInvoiceBooking(null)}
        booking={selectedInvoiceBooking}
      />

      {/* BOOKING DETAILS MODAL */}
      {selectedDetailsBooking && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDetailsBooking(null)}
          title={`Booking Details: ${selectedDetailsBooking.bookingNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-500 block">Vehicle</span>
                <span className="text-white font-bold text-sm">
                  {selectedDetailsBooking.car ? `${selectedDetailsBooking.car.brand} ${selectedDetailsBooking.car.model}` : 'Luxury Vehicle'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Status</span>
                <div className="mt-1">{getStatusBadge(selectedDetailsBooking.bookingStatus)}</div>
              </div>
              <div>
                <span className="text-slate-500 block">Pickup Location</span>
                <span className="text-slate-200">{selectedDetailsBooking.pickupLocation}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Drop-off Location</span>
                <span className="text-slate-200">{selectedDetailsBooking.dropoffLocation}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Pickup Date & Time</span>
                <span className="text-slate-200">
                  {formatDateTime(selectedDetailsBooking.pickupDateTime)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Return Date & Time</span>
                <span className="text-slate-200">
                  {formatDateTime(selectedDetailsBooking.returnDateTime)}
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">
                Cost Summary
              </h4>
              <div className="flex justify-between">
                <span>Base Rental ({selectedDetailsBooking.rentalDays} days)</span>
                <span className="text-white font-semibold">
                  {formatCurrency(selectedDetailsBooking.basePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Damage Protection ({selectedDetailsBooking.insuranceType})</span>
                <span className="text-white font-semibold">
                  {formatCurrency(selectedDetailsBooking.insurancePrice)}
                </span>
              </div>
              {Number(selectedDetailsBooking.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(selectedDetailsBooking.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span className="text-white font-semibold">
                  {formatCurrency(selectedDetailsBooking.taxAmount)}
                </span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Refundable Deposit</span>
                <span>{formatCurrency(selectedDetailsBooking.securityDeposit)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white text-sm">
                <span>Total Amount</span>
                <span>{formatCurrency(selectedDetailsBooking.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedInvoiceBooking(selectedDetailsBooking);
                  setSelectedDetailsBooking(null);
                }}
              >
                View Invoice
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDetailsBooking(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CANCEL BOOKING MODAL */}
      {cancelModalBooking && (
        <Modal
          isOpen={true}
          onClose={() => setCancelModalBooking(null)}
          title={`Cancel Reservation: ${cancelModalBooking.bookingNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Cancellation & Refund Notice</p>
                <p className="mt-1 leading-relaxed">
                  Cancelling will release your reserved vehicle dates on the live calendar. If
                  cancelled 24h prior to pickup, 100% of the booking amount will be refunded.
                </p>
              </div>
            </div>

            {cancelError && (
              <div className="p-2.5 rounded-lg bg-red-950/40 text-red-400 text-xs">
                {cancelError}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Reason for Cancellation *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please tell us why you need to cancel this booking..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCancelModalBooking(null)}
              >
                Keep Booking
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={cancelMutation.isPending}
                disabled={!cancelReason.trim()}
                onClick={() =>
                  cancelMutation.mutate({
                    id: cancelModalBooking.id,
                    reason: cancelReason,
                  })
                }
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
