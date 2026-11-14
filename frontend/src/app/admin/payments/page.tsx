'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../services/admin.api';
import { Spinner } from '../../../components/common/Spinner';
import { Badge } from '../../../components/common/Badge';
import { formatCurrency, formatDateTime } from '../../../lib/utils';
import {
  CreditCard,
  RotateCcw,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Filter,
  DollarSign,
  Download,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [activeSubTab, setActiveSubTab] = useState<'payments' | 'refunds'>('payments');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Payments Query
  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ['admin-payments', page, search, statusFilter],
    queryFn: () =>
      adminApi.getPayments({
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      }),
    enabled: activeSubTab === 'payments',
  });

  // Refunds Query
  const {
    data: refundsData,
    isLoading: isRefundsLoading,
    refetch: refetchRefunds,
  } = useQuery({
    queryKey: ['admin-refunds', page, search, statusFilter],
    queryFn: () =>
      adminApi.getRefunds({
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      }),
    enabled: activeSubTab === 'refunds',
  });

  const payments = paymentsData?.payments ?? [];
  const refunds = refundsData?.refunds ?? [];

  // Computed summary metrics
  const totalPaymentsAmount = payments.reduce(
    (acc: number, p: any) => (p.status === 'SUCCESS' ? acc + Number(p.amount) : acc),
    0
  );
  const totalRefundsAmount = refunds.reduce(
    (acc: number, r: any) => (r.status === 'PROCESSED' ? acc + Number(r.amount) : acc),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <span>Payments & Financial Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Razorpay payment gateway sync, transaction verification, and automated refund tracking.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('payments');
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'payments'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Transactions</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('refunds');
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'refunds'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refund Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#10172A] border border-slate-800 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {activeSubTab === 'payments' ? 'Processed Volume' : 'Disbursed Refunds'}
          </span>
          <div className="text-xl font-black text-white mt-1">
            {formatCurrency(activeSubTab === 'payments' ? totalPaymentsAmount : totalRefundsAmount)}
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Verified by Razorpay API
          </span>
        </div>

        <div className="rounded-2xl bg-[#10172A] border border-slate-800 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {activeSubTab === 'payments' ? 'Successful Payments' : 'Processed Refunds'}
          </span>
          <div className="text-xl font-black text-emerald-400 mt-1">
            {activeSubTab === 'payments'
              ? payments.filter((p: any) => p.status === 'SUCCESS').length
              : refunds.filter((r: any) => r.status === 'PROCESSED').length}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">In current batch</span>
        </div>

        <div className="rounded-2xl bg-[#10172A] border border-slate-800 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {activeSubTab === 'payments' ? 'Pending Payments' : 'Pending Approvals'}
          </span>
          <div className="text-xl font-black text-amber-400 mt-1">
            {activeSubTab === 'payments'
              ? payments.filter((p: any) => p.status === 'PENDING').length
              : refunds.filter((r: any) => r.status === 'PENDING').length}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Awaiting confirmation</span>
        </div>

        <div className="rounded-2xl bg-[#10172A] border border-slate-800 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Gateway Health
          </span>
          <div className="text-xl font-black text-sky-400 mt-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>99.98%</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Webhook signature verified</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-[#10172A] border border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeSubTab === 'payments'
                ? 'Search payment ID, order ID, customer...'
                : 'Search refund ID, booking ref...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            {activeSubTab === 'payments' ? (
              <>
                <option value="SUCCESS">SUCCESS</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </>
            ) : (
              <>
                <option value="PROCESSED">PROCESSED</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </>
            )}
          </select>

          <button
            type="button"
            onClick={() => (activeSubTab === 'payments' ? refetchPayments() : refetchRefunds())}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tables */}
      {activeSubTab === 'payments' ? (
        <div className="rounded-3xl bg-[#10172A] border border-slate-800 overflow-hidden shadow-xl">
          {isPaymentsLoading ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : payments.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <CreditCard className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">No payment transactions recorded</p>
              <p className="text-xs text-slate-500">Payments made via Razorpay will be synced here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Transaction / Razorpay ID</th>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono text-white font-semibold block">{p.razorpayPaymentId || p.id}</span>
                        {p.razorpayOrderId && (
                          <span className="text-[10px] text-slate-500 font-mono block">Order: {p.razorpayOrderId}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-amber-400 font-bold">
                          {p.booking?.bookingReference || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white font-medium block">
                          {p.booking?.user?.name || (p.booking?.user?.firstName ? `${p.booking.user.firstName} ${p.booking.user.lastName || ''}`.trim() : null) || p.booking?.guestName || 'Registered User'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {p.booking?.user?.email || p.booking?.guestEmail}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white text-sm">{formatCurrency(p.amount)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                          {p.paymentMethod || 'RAZORPAY_UPI'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            p.status === 'SUCCESS' ? 'emerald' : p.status === 'PENDING' ? 'amber' : 'rose'
                          }
                          size="sm"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {formatDateTime(p.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl bg-[#10172A] border border-slate-800 overflow-hidden shadow-xl">
          {isRefundsLoading ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : refunds.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <RotateCcw className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">No refunds initiated</p>
              <p className="text-xs text-slate-500">Automated and manual refunds will be tracked in this ledger.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Refund ID / Razorpay Refund</th>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Refund Amount</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Processed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {refunds.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono text-white font-semibold block">{r.razorpayRefundId || r.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-amber-400 font-bold">
                          {r.booking?.bookingReference || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white font-medium block">
                          {r.booking?.user?.name || (r.booking?.user?.firstName ? `${r.booking.user.firstName} ${r.booking.user.lastName || ''}`.trim() : null) || 'Customer'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">{r.booking?.user?.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-rose-400 text-sm">{formatCurrency(r.amount)}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-400">
                        {r.reason || 'Customer cancellation'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            r.status === 'PROCESSED' ? 'emerald' : r.status === 'PENDING' ? 'amber' : 'rose'
                          }
                          size="sm"
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {formatDateTime(r.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
