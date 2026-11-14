'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../services/admin.api';
import { Spinner } from '../../../components/common/Spinner';
import { Badge } from '../../../components/common/Badge';
import { formatDateTime } from '../../../lib/utils';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Calendar,
  CreditCard,
  Car,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Inbox,
} from 'lucide-react';

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => adminApi.getNotifications(),
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const filteredNotifications = notifications.filter((n: any) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'urgent') return n.type === 'REFUND_REQUEST' || n.priority === 'HIGH';
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'KYC_SUBMITTED':
        return <FileCheck className="w-4 h-4 text-sky-400" />;
      case 'BOOKING_CREATED':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case 'REFUND_REQUEST':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'PAYMENT_SUCCESS':
        return <CreditCard className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>Administrative Command Center Notifications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational alerts, customer document submissions, reservation activity, and security dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#10172A] p-1.5 rounded-2xl border border-slate-800 w-fit text-xs">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
            filter === 'all'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
            filter === 'unread'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-400 text-[10px] font-black">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setFilter('urgent')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
            filter === 'urgent'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Urgent & Refunds
        </button>
      </div>

      {/* Notifications List */}
      <div className="rounded-3xl bg-[#10172A] border border-slate-800 overflow-hidden shadow-xl p-4 sm:p-6 space-y-3">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">All Caught Up!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no pending alerts matching your filter. Platform processes are running normally.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n: any, idx: number) => (
            <div
              key={n.id || idx}
              className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                n.isRead
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
                  : 'bg-slate-900/90 border-slate-700/80 shadow-md'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0 mt-0.5">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{n.title || 'Platform Notification'}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                    {n.priority === 'HIGH' && (
                      <Badge variant="rose" size="sm">
                        High Priority
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{n.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {n.type === 'KYC_SUBMITTED' && (
                  <Link
                    href="/admin/customers"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-bold transition border border-sky-500/20"
                  >
                    <span>Review License</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                {n.type === 'BOOKING_CREATED' && (
                  <Link
                    href="/admin/bookings"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition border border-emerald-500/20"
                  >
                    <span>View Booking</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                {n.type === 'REFUND_REQUEST' && (
                  <Link
                    href="/admin/payments"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition border border-rose-500/20"
                  >
                    <span>Inspect Refund</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
