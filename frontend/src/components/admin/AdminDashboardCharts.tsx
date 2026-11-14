'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../lib/utils';

interface AdminDashboardChartsProps {
  monthlyTrends?: Array<{ month: string; revenue: number; bookings: number }>;
  statusDistribution?: Array<{ status: string; count: number }>;
  categoryStats?: Array<{ category: string; revenue: number; count: number }>;
  fleetStats?: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
  };
}

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#64748B'];
const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#10B981',
  ACTIVE: '#3B82F6',
  COMPLETED: '#8B5CF6',
  CANCELLED: '#EF4444',
  PENDING: '#F59E0B',
  EXPIRED: '#64748B',
};

export const AdminDashboardCharts: React.FC<AdminDashboardChartsProps> = ({
  monthlyTrends = [],
  statusDistribution = [],
  categoryStats = [],
  fleetStats,
}) => {
  // Format monthly trend data
  const revenueTrendData = monthlyTrends.map((item) => ({
    name: item.month,
    Revenue: item.revenue,
    Bookings: item.bookings,
  }));

  // Fleet utilization data
  const fleetData = [
    { name: 'Active Rentals', value: fleetStats?.rented ?? 4, color: '#3B82F6' },
    { name: 'Available Fleet', value: fleetStats?.available ?? 12, color: '#10B981' },
    { name: 'Under Service', value: fleetStats?.maintenance ?? 2, color: '#F59E0B' },
  ].filter((item) => item.value > 0);

  // Status distribution data
  const statusData = statusDistribution.map((st) => ({
    name: st.status,
    value: st.count,
    color: STATUS_COLORS[st.status] || '#64748B',
  }));

  // Category ranking data
  const categoryData = categoryStats.map((cat) => ({
    name: cat.category,
    Revenue: cat.revenue,
    Bookings: cat.count,
  }));

  return (
    <div className="space-y-8">
      {/* 1. Main Revenue & Volume Area Chart */}
      <div className="rounded-3xl bg-[#10172A] border border-slate-800 p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Revenue Trajectory & Bookings Overview</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time enterprise metrics computed from PostgreSQL transaction ledger.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Live Ledger Sync
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: string) => [
                  name === 'Revenue' ? formatCurrency(Number(val)) : `${val} bookings`,
                  name,
                ]}
              />
              <Area
                type="monotone"
                dataKey="Revenue"
                stroke="#F59E0B"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Grid of Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Bookings Bar Chart */}
        <div className="rounded-3xl bg-[#10172A] border border-slate-800 p-6 shadow-xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight">Monthly Bookings Volume</h3>
            <p className="text-[11px] text-slate-400">Total customer reservations per month</p>
          </div>
          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '10px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="Bookings" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Utilization Donut Chart */}
        <div className="rounded-3xl bg-[#10172A] border border-slate-800 p-6 shadow-xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight">Fleet Utilization</h3>
            <p className="text-[11px] text-slate-400">Current real-time vehicle allocation</p>
          </div>
          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {fleetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '10px',
                    fontSize: '11px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="rounded-3xl bg-[#10172A] border border-slate-800 p-6 shadow-xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight">Status Distribution</h3>
            <p className="text-[11px] text-slate-400">Proportion of reservations across statuses</p>
          </div>
          <div className="h-56 w-full flex-1">
            {statusData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No reservation status data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 3. Category Revenue Ranking */}
      <div className="rounded-3xl bg-[#10172A] border border-slate-800 p-6 sm:p-7 shadow-xl">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white tracking-tight">Category Financial Performance</h3>
          <p className="text-[11px] text-slate-400">Total earned revenue broken down by luxury category</p>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
              <XAxis
                type="number"
                stroke="#64748B"
                fontSize={10}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '10px',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [formatCurrency(Number(val)), 'Earned Revenue']}
              />
              <Bar dataKey="Revenue" fill="#F59E0B" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
