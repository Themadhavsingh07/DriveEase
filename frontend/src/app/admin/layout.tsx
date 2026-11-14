'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/admin.api';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Car,
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  Bell,
  Settings,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  ShieldAlert,
  ShieldCheck,
  User,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isLoading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Unread notifications query
  const { data: notificationsData } = useQuery({
    queryKey: ['admin-notifications-summary'],
    queryFn: () => adminApi.getNotifications(),
    enabled: !!user && user.role === 'ADMIN',
    refetchInterval: 30000,
  });

  const unreadCount = notificationsData?.unreadCount ?? 0;
  const notifications = notificationsData?.notifications ?? [];

  // Protect Admin route
  useEffect(() => {
    if (!isLoading && pathname !== '/admin/login') {
      if (!user || user.role !== 'ADMIN') {
        router.replace('/admin/login');
      }
    }
  }, [user, isLoading, pathname, router]);

  // Don't render shell on /admin/login
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">DriveEase Master Control</h2>
            <p className="text-xs text-slate-400 mt-1">Authenticating administrative credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Vehicles', path: '/admin/cars', icon: Car },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'Payments & Refunds', path: '/admin/payments', icon: CreditCard },
    { label: 'Analytics & Reports', path: '/admin/analytics', icon: TrendingUp },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: History },
  ];

  // Breadcrumbs title
  const currentPath = pathname || '';
  const currentNav = navItems.find((item) => currentPath.startsWith(item.path)) || { label: 'Admin Portal' };

  // Admin Name
  const adminName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin';

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] flex flex-col antialiased">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col bg-[#10172A] border-r border-slate-800 transition-all duration-300 ${
            collapsed ? 'w-20' : 'w-64'
          } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          {/* Brand Logo Header */}
          <div className="h-18 px-5 flex items-center justify-between border-b border-slate-800">
            <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
                <Car className="w-5 h-5 text-slate-950" />
              </div>
              {!collapsed && (
                <div className="leading-tight">
                  <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                    Drive<span className="text-amber-400">Ease</span>
                  </span>
                  <span className="inline-block text-[10px] font-bold text-amber-400/90 tracking-wider uppercase bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    Enterprise
                  </span>
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/admin/dashboard' && currentPath.startsWith(item.path));
              // Admin Name
  const adminName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin';

  return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/5'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {item.badge && !collapsed && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 shrink-0">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && collapsed && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#10172A]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Card at bottom */}
          <div className="p-3 border-t border-slate-800">
            <div
              className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800 ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                {adminName.charAt(0) || 'A'}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{adminName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              )}
              {!collapsed && (
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    router.push('/admin/login');
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Content Shell */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header */}
          <header className="h-18 px-6 bg-[#10172A]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Admin</span>
                <span className="text-slate-600">/</span>
                <span className="font-bold text-white">{currentNav.label}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              {/* Global Search Input */}
              <div className="relative hidden md:block w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Quick search... (⌘K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Quick Action Button */}
              <Link
                href="/admin/cars?action=add"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vehicle</span>
              </Link>

              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#131B2E] border border-slate-700/80 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-white">Administrative Notifications</h4>
                      </div>
                      <Link
                        href="/admin/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        View All
                      </Link>
                    </div>

                    <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">All systems operational. No unread notifications.</p>
                      ) : (
                        notifications.slice(0, 5).map((n: any, idx: number) => (
                          <div
                            key={n.id || idx}
                            className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-2.5 hover:bg-slate-800/50 transition"
                          >
                            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{n.title || 'Platform Alert'}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-500 mt-1 block">
                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    {adminName.charAt(0) || 'A'}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-semibold text-white max-w-[100px] truncate">
                    {adminName}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#131B2E] border border-slate-700/80 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white">{adminName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        ENTERPRISE ADMIN
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>Public Storefront</span>
                      </Link>
                      <Link
                        href="/admin/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Platform Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={async () => {
                          await logout();
                          router.push('/admin/login');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
