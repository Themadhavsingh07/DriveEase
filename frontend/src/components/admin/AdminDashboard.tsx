import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/admin.api';
import { documentApi } from '../../services/document.api';
import api from '../../lib/api';
import {
  Car,
  Booking,
  User,
  CarCategory,
  AdminCustomer,
  AuditLog,
  AdminOverviewStats,
  AdminOverviewCharts,
} from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Spinner } from '../common/Spinner';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import {
  ShieldAlert,
  Car as CarIcon,
  CircleDollarSign,
  TrendingUp,
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Sliders,
  Sparkles,
  Download,
  Settings,
  FileCheck,
  ShieldCheck,
  ShieldX,
  History,
  FileSpreadsheet,
  Check,
  X,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart3,
  Calendar,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface AdminDashboardProps {
  initialTab?: string;
}

type TabType =
  | 'overview'
  | 'vehicles'
  | 'bookings'
  | 'customers'
  | 'analytics'
  | 'settings'
  | 'audit-logs'
  | 'coupons';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Normalize initial tab
  const getNormalizedTab = (tab?: string): TabType => {
    if (!tab) return 'overview';
    const lower = tab.toLowerCase();
    if (lower === 'cars') return 'vehicles';
    if (lower === 'dashboard') return 'overview';
    if (
      [
        'overview',
        'vehicles',
        'bookings',
        'customers',
        'analytics',
        'settings',
        'audit-logs',
        'coupons',
      ].includes(lower)
    ) {
      return lower as TabType;
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getNormalizedTab(initialTab));

  useEffect(() => {
    if (initialTab) {
      setActiveTab(getNormalizedTab(initialTab));
    }
  }, [initialTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    navigate(`/admin/${tab === 'vehicles' ? 'cars' : tab}`, { replace: true });
  };

  // ==========================================
  // 1. OVERVIEW / DASHBOARD STATE & QUERIES
  // ==========================================
  const { data: overviewData, isLoading: isOverviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => adminApi.getDashboardOverview(),
  });

  const stats = overviewData?.stats;
  const charts = overviewData?.charts;

  // ==========================================
  // 2. FLEET / VEHICLES STATE & QUERIES
  // ==========================================
  const [carSearch, setCarSearch] = useState('');
  const [carCategoryFilter, setCarCategoryFilter] = useState('');
  const [carStatusFilter, setCarStatusFilter] = useState('ALL');
  const [carPage, setCarPage] = useState(1);

  const { data: carsData, isLoading: isCarsLoading, refetch: refetchCars } = useQuery({
    queryKey: ['admin-cars', carSearch, carCategoryFilter, carStatusFilter, carPage],
    queryFn: () =>
      adminApi.getCars({
        search: carSearch,
        category: carCategoryFilter,
        status: carStatusFilter,
        page: carPage,
        limit: 12,
      }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<{ categories: CarCategory[] }>('/cars/categories');
      return res.categories;
    },
  });

  // Add / Edit Car Modal State
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState(2024);
  const [carCategoryId, setCarCategoryId] = useState('');
  const [carTransmission, setCarTransmission] = useState<'AUTOMATIC' | 'MANUAL'>('AUTOMATIC');
  const [carFuelType, setCarFuelType] = useState<
    'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID'
  >('PETROL');
  const [carSeats, setCarSeats] = useState(5);
  const [carMileage, setCarMileage] = useState('14 km/l');
  const [carDailyPrice, setCarDailyPrice] = useState(7500);
  const [carSecurityDeposit, setCarSecurityDeposit] = useState(15000);
  const [carPickupLoc, setCarPickupLoc] = useState('Bandra Kurla Complex, Mumbai');
  const [carDropoffLoc, setCarDropoffLoc] = useState('Bandra Kurla Complex, Mumbai');
  const [carImageUrl, setCarImageUrl] = useState('');
  const [carFeatures, setCarFeatures] = useState(
    'Apple CarPlay, 360 Camera, Heated Seats, Sound System'
  );
  const [carFormError, setCarFormError] = useState('');

  const openAddCar = () => {
    setEditingCar(null);
    setCarBrand('');
    setCarModel('');
    setCarYear(2024);
    setCarCategoryId(categories?.[0]?.id || '');
    setCarTransmission('AUTOMATIC');
    setCarFuelType('PETROL');
    setCarSeats(5);
    setCarMileage('14 km/l');
    setCarDailyPrice(7500);
    setCarSecurityDeposit(15000);
    setCarPickupLoc('Bandra Kurla Complex, Mumbai');
    setCarDropoffLoc('Bandra Kurla Complex, Mumbai');
    setCarImageUrl('');
    setCarFeatures('Apple CarPlay, 360 Camera, Heated Seats, Sound System');
    setCarFormError('');
    setIsCarModalOpen(true);
  };

  const openEditCar = (c: Car) => {
    setEditingCar(c);
    setCarBrand(c.brand);
    setCarModel(c.model);
    setCarYear(c.year);
    setCarCategoryId(c.categoryId || '');
    setCarTransmission((c.transmission?.toUpperCase() as any) || 'AUTOMATIC');
    setCarFuelType((c.fuelType?.toUpperCase() as any) || 'PETROL');
    setCarSeats(c.seatingCapacity);
    setCarMileage(c.mileage || '14 km/l');
    setCarDailyPrice(Number(c.dailyPrice));
    setCarSecurityDeposit(Number(c.securityDeposit));
    setCarPickupLoc(c.pickupLocation || 'Bandra Kurla Complex, Mumbai');
    setCarDropoffLoc(c.dropoffLocation || 'Bandra Kurla Complex, Mumbai');
    setCarImageUrl(c.images?.[0]?.url || '');
    setCarFeatures(c.features ? c.features.join(', ') : '');
    setCarFormError('');
    setIsCarModalOpen(true);
  };

  const saveCarMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        brand: carBrand,
        model: carModel,
        year: Number(carYear),
        categoryId: carCategoryId || categories?.[0]?.id,
        transmission: carTransmission,
        fuelType: carFuelType,
        seatingCapacity: Number(carSeats),
        mileage: carMileage,
        dailyPrice: Number(carDailyPrice),
        securityDeposit: Number(carSecurityDeposit),
        pickupLocation: carPickupLoc,
        dropoffLocation: carDropoffLoc,
        features: carFeatures
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean),
        images: carImageUrl
          ? [
              {
                url: carImageUrl,
                isPrimary: true,
                caption: `${carBrand} ${carModel}`,
              },
            ]
          : undefined,
      };

      if (editingCar) {
        return adminApi.updateCar(editingCar.id, payload);
      } else {
        return adminApi.createCar(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      setIsCarModalOpen(false);
      setEditingCar(null);
    },
    onError: (err: any) => {
      setCarFormError(err.message || 'Failed to save vehicle');
    },
  });

  const toggleCarStatusMutation = useMutation({
    mutationFn: ({
      id,
      isActive,
      isAvailable,
    }: {
      id: string;
      isActive?: boolean;
      isAvailable?: boolean;
    }) => adminApi.updateCarStatus(id, isActive, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
  });

  // ==========================================
  // 3. BOOKINGS STATE & QUERIES
  // ==========================================
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [bookingPaymentFilter, setBookingPaymentFilter] = useState('');
  const [bookingPage, setBookingPage] = useState(1);

  const {
    data: bookingsResponse,
    isLoading: isBookingsLoading,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: [
      'admin-bookings-full',
      bookingSearch,
      bookingStatusFilter,
      bookingPaymentFilter,
      bookingPage,
    ],
    queryFn: () =>
      adminApi.getBookings({
        search: bookingSearch,
        status: bookingStatusFilter,
        paymentStatus: bookingPaymentFilter,
        page: bookingPage,
        limit: 15,
      }),
  });

  const bookingsList = bookingsResponse?.bookings || [];
  const bookingsPagination = bookingsResponse?.pagination;

  // Booking Status Transition Modal
  const [statusTransitionBooking, setStatusTransitionBooking] = useState<Booking | null>(null);
  const [newBookingStatus, setNewBookingStatus] = useState<string>('');
  const [statusChangeReason, setStatusChangeReason] = useState<string>('');
  const [statusChangeError, setStatusChangeError] = useState<string>('');

  const updateBookingStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: string;
      reason: string;
    }) => adminApi.updateBookingStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings-full'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      setStatusTransitionBooking(null);
      setStatusChangeReason('');
    },
    onError: (err: any) => {
      setStatusChangeError(err.message || 'Failed to update reservation status');
    },
  });

  // ==========================================
  // 4. CUSTOMERS STATE & QUERIES
  // ==========================================
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('');
  const [customerPage, setCustomerPage] = useState(1);

  const {
    data: customersResponse,
    isLoading: isCustomersLoading,
    refetch: refetchCustomers,
  } = useQuery({
    queryKey: [
      'admin-customers-full',
      customerSearch,
      customerStatusFilter,
      customerPage,
    ],
    queryFn: () =>
      adminApi.getCustomers({
        search: customerSearch,
        status: customerStatusFilter,
        page: customerPage,
        limit: 15,
      }),
  });

  const customersList = customersResponse?.customers || [];
  const customersPagination = customersResponse?.pagination;

  // Customer Status Update Modal
  const [managingCustomer, setManagingCustomer] = useState<AdminCustomer | null>(null);
  const [newAccountStatus, setNewAccountStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'BLOCKED'>('ACTIVE');
  const [accountStatusReason, setAccountStatusReason] = useState('');
  const [accountStatusError, setAccountStatusError] = useState('');

  const updateCustomerStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
      reason: string;
    }) => adminApi.updateCustomerStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers-full'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
      setManagingCustomer(null);
      setAccountStatusReason('');
    },
    onError: (err: any) => {
      setAccountStatusError(err.message || 'Failed to update customer account status');
    },
  });

  // Customer Details & Document Inspection Modal
  const [inspectingCustomerId, setInspectingCustomerId] = useState<string | null>(null);
  const { data: inspectedCustomer, isLoading: isInspectingLoading } = useQuery({
    queryKey: ['customer-detail', inspectingCustomerId],
    queryFn: () => adminApi.getCustomerDetails(inspectingCustomerId || ''),
    enabled: Boolean(inspectingCustomerId),
  });

  // Document Verification Actions
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [documentReviewError, setDocumentReviewError] = useState('');

  const reviewDocumentMutation = useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason,
    }: {
      id: string;
      status: 'VERIFIED' | 'REJECTED';
      rejectionReason?: string;
    }) => adminApi.reviewDocument(id, status, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-detail', inspectingCustomerId] });
      queryClient.invalidateQueries({ queryKey: ['admin-customers-full'] });
      setRejectingDocId(null);
      setRejectionReasonInput('');
    },
    onError: (err: any) => {
      setDocumentReviewError(err.message || 'Failed to review document');
    },
  });

  // ==========================================
  // 5. ANALYTICS & REPORTS STATE & QUERIES
  // ==========================================
  const [analyticsStartDate, setAnalyticsStartDate] = useState('');
  const [analyticsEndDate, setAnalyticsEndDate] = useState('');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['admin-analytics-view', analyticsStartDate, analyticsEndDate],
    queryFn: () =>
      adminApi.getAnalytics({
        startDate: analyticsStartDate,
        endDate: analyticsEndDate,
      }),
  });

  const handleExportReport = async (type: 'bookings' | 'revenue' | 'utilization') => {
    setIsExporting(type);
    try {
      await adminApi.exportReport(type, {
        startDate: analyticsStartDate,
        endDate: analyticsEndDate,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to export CSV report');
    } finally {
      setIsExporting(null);
    }
  };

  // ==========================================
  // 6. BUSINESS SETTINGS STATE & QUERIES
  // ==========================================
  const { data: settingsData, isLoading: isSettingsLoading, refetch: refetchSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings(),
  });

  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({
    BUSINESS_NAME: 'DriveEase Luxury Rentals',
    SUPPORT_EMAIL: 'concierge@driveease.com',
    SUPPORT_PHONE: '+91 98765 43210',
    HEADQUARTERS_ADDRESS: 'BKC, Mumbai, Maharashtra 400051',
    CURRENCY: 'INR',
    TIMEZONE: 'Asia/Kolkata',
    DEFAULT_TAX_RATE: '18',
    HOLD_DURATION_MINUTES: '15',
    CANCELLATION_REFUND_POLICY: 'Full refund if cancelled > 24 hours prior to pickup. 20% rental fee applies thereafter.',
  });

  useEffect(() => {
    if (settingsData?.settings) {
      setSettingsForm((prev) => ({ ...prev, ...settingsData.settings }));
    }
  }, [settingsData]);

  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Record<string, string>) =>
      adminApi.updateSettings(newSettings),
    onSuccess: () => {
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3500);
      refetchSettings();
    },
    onError: (err: any) => {
      setSettingsError(err.message || 'Failed to update business settings');
    },
  });

  // ==========================================
  // 7. AUDIT TRAIL LOGS STATE & QUERIES
  // ==========================================
  const [auditPage, setAuditPage] = useState(1);
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditEntityFilter, setAuditEntityFilter] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  const { data: auditResponse, isLoading: isAuditLoading } = useQuery({
    queryKey: [
      'admin-audit-logs',
      auditPage,
      auditActionFilter,
      auditEntityFilter,
      auditSearch,
    ],
    queryFn: () =>
      adminApi.getAuditLogs({
        page: auditPage,
        limit: 20,
        action: auditActionFilter,
        entityType: auditEntityFilter,
        search: auditSearch,
      }),
  });

  const auditLogs = auditResponse?.logs || [];
  const auditPagination = auditResponse?.pagination;

  // Audit detail viewer modal
  const [viewingAuditLog, setViewingAuditLog] = useState<AuditLog | null>(null);

  // ==========================================
  // 8. COUPONS STATE & QUERIES
  // ==========================================
  const [couponCode, setCouponCode] = useState('');
  const [couponValue, setCouponValue] = useState(10);
  const [couponType, setCouponType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');

  const { data: couponsData, refetch: refetchCoupons } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await api.get<{ coupons: any[] }>('/admin/coupons');
      return res.coupons;
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: async () => {
      return await api.post('/admin/coupons', {
        code: couponCode,
        discountType: couponType,
        discountValue: couponValue,
        minBookingAmount: 3000,
      });
    },
    onSuccess: () => {
      refetchCoupons();
      setCouponCode('');
    },
  });

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">DriveEase Master Control</h1>
              <Badge variant="amber" size="sm">
                Admin Console
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time enterprise dashboard: fleet inventory, customer verifications, revenue analytics, and audit security.
            </p>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs overflow-x-auto w-full md:w-auto shadow-inner">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'vehicles', label: 'Fleet', icon: CarIcon },
            { id: 'bookings', label: 'Bookings', icon: Calendar },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'analytics', label: 'Reports', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'audit-logs', label: 'Audit Trail', icon: History },
            { id: 'coupons', label: 'Coupons', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as TabType)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: EXECUTIVE ANALYTICS OVERVIEW                            */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {isOverviewLoading ? (
            <Spinner size="lg" className="py-24" />
          ) : (
            <>
              {/* Primary KPI Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
                {/* Earned Rental Revenue (Excluding Deposits) */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Paid Rental Revenue
                    </span>
                    <CircleDollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {formatCurrency(stats?.totalEarnedRentalRevenue || 0)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Excludes refundable security deposits</span>
                  </div>
                </div>

                {/* Gross Collections */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                      Gross Collected
                    </span>
                    <TrendingUp className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {formatCurrency(stats?.totalGrossRevenue || 0)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Includes taxes & security deposits
                  </div>
                </div>

                {/* Deposits Held */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      Deposits Held
                    </span>
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {formatCurrency(stats?.totalDepositsHeld || 0)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Refundable security on active rentals
                  </div>
                </div>

                {/* Fleet Utilization */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                      Fleet Utilization
                    </span>
                    <CarIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {stats?.utilizationRate || 0}%
                    </div>
                    <span className="text-xs text-slate-400">
                      ({stats?.activeRentals || 0} / {stats?.totalCars || 0} Cars)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {stats?.availableCars || 0} vehicles available in hubs
                  </div>
                </div>
              </div>

              {/* Secondary Operational Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Bookings</span>
                  <span className="text-xl font-black text-white mt-0.5 block">{stats?.totalBookings || 0}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Upcoming Trips</span>
                  <span className="text-xl font-black text-sky-400 mt-0.5 block">{stats?.upcomingBookings || 0}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Taxes Collected</span>
                  <span className="text-xl font-black text-indigo-400 mt-0.5 block">{formatCurrency(stats?.totalTaxesCollected || 0)}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Customers</span>
                  <span className="text-xl font-black text-purple-400 mt-0.5 block">{stats?.totalCustomers || 0}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Cancelled / Refunds</span>
                  <span className="text-xl font-black text-rose-400 mt-0.5 block">{stats?.cancelledBookings || 0}</span>
                </div>
              </div>

              {/* Monthly Revenue Trend Visualizer */}
              <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white">Monthly Earned Revenue & Volume</h3>
                    <p className="text-xs text-slate-400">Computed strictly from real PostgreSQL booking records.</p>
                  </div>
                  <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                    6 Months Trailing
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3.5 pt-2">
                  {charts?.monthlyTrends?.map((item) => (
                    <div
                      key={item.month}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1 hover:border-slate-700 transition-colors"
                    >
                      <span className="text-xs font-black text-sky-400 block">{item.month}</span>
                      <div className="text-base font-black text-white">{formatCurrency(item.revenue)}</div>
                      <span className="text-[10px] text-slate-400 block">{item.bookings} Bookings</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Distribution & Category Revenue */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booking Status Distribution */}
                <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white">Reservation Status Breakdown</h3>
                  <div className="space-y-3">
                    {charts?.statusDistribution?.map((st) => (
                      <div key={st.status} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">{st.status}</span>
                          <span className="text-white font-mono">{st.count}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              st.status === 'CONFIRMED'
                                ? 'bg-emerald-500'
                                : st.status === 'ACTIVE'
                                ? 'bg-blue-500'
                                : st.status === 'COMPLETED'
                                ? 'bg-purple-500'
                                : 'bg-rose-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (st.count / (stats?.totalBookings || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Vehicle Categories */}
                <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white">Popular Fleet Categories</h3>
                  <div className="space-y-3">
                    {charts?.categoryStats?.map((cat) => (
                      <div
                        key={cat.category}
                        className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex justify-between items-center text-xs"
                      >
                        <span className="font-bold text-white">{cat.category}</span>
                        <div className="text-right">
                          <span className="font-mono text-sky-400 font-bold block">
                            {formatCurrency(cat.revenue)}
                          </span>
                          <span className="text-[10px] text-slate-400">{cat.count} Bookings</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: FLEET MANAGEMENT                                        */}
      {/* ============================================================== */}
      {activeTab === 'vehicles' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">Fleet Inventory Management</h2>
              <p className="text-xs text-slate-400">
                Manage vehicles, update rates, toggle soft activation, and inspect fleet availability.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={openAddCar} className="flex items-center gap-1.5 text-xs">
              <Plus className="w-4 h-4" /> Add Luxury Vehicle
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search brand, model, features..."
                value={carSearch}
                onChange={(e) => {
                  setCarSearch(e.target.value);
                  setCarPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={carCategoryFilter}
                onChange={(e) => {
                  setCarCategoryFilter(e.target.value);
                  setCarPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={carStatusFilter}
                onChange={(e) => {
                  setCarStatusFilter(e.target.value);
                  setCarPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active (Live in Fleet)</option>
                <option value="INACTIVE">Deactivated</option>
              </select>
            </div>
          </div>

          {/* Cars Grid */}
          {isCarsLoading ? (
            <Spinner size="lg" className="py-20" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carsData?.cars?.map((c) => {
                const isActive = (c as any).isActive !== false;
                const isAvailable = c.isAvailable;

                return (
                  <div
                    key={c.id}
                    className={`glass-panel rounded-2xl overflow-hidden border transition-all flex flex-col justify-between ${
                      isActive ? 'border-slate-800' : 'border-rose-900/40 opacity-75'
                    }`}
                  >
                    <div className="relative h-44 bg-slate-950">
                      <img
                        src={
                          c.images?.[0]?.url ||
                          'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={c.brand}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isActive ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isAvailable
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isAvailable ? 'AVAILABLE' : 'RESERVED'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                          {c.brand} • {c.year}
                        </span>
                        <h3 className="text-base font-bold text-white">
                          {c.brand} {c.model}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {c.category} • {c.transmission} • {c.fuelType}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800/80">
                        <span>
                          Rate: <strong className="text-white">{formatCurrency(c.dailyPrice)}</strong>/day
                        </span>
                        <span className="text-slate-400">
                          Deposit: {formatCurrency(c.securityDeposit)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => openEditCar(c)}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>

                        {/* Soft Activate / Deactivate Toggle */}
                        <Button
                          variant="outline"
                          size="sm"
                          className={`text-xs ${
                            isActive
                              ? 'text-rose-400 border-rose-900/60 hover:bg-rose-950/40'
                              : 'text-emerald-400 border-emerald-900/60 hover:bg-emerald-950/40'
                          }`}
                          onClick={() =>
                            toggleCarStatusMutation.mutate({
                              id: c.id,
                              isActive: !isActive,
                              isAvailable: !isActive,
                            })
                          }
                          title={isActive ? 'Soft de-activate vehicle' : 'Reactivate vehicle'}
                        >
                          {isActive ? 'Deactivate' : 'Reactivate'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {carsData?.pagination && carsData.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={carPage <= 1}
                onClick={() => setCarPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-xs text-slate-400">
                Page {carPage} of {carsData.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={carPage >= carsData.pagination.totalPages}
                onClick={() => setCarPage((p) => p + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: BOOKINGS MASTER CONTROL                                */}
      {/* ============================================================== */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">Master Reservations Ledger</h2>
              <p className="text-xs text-slate-400">
                Centralized oversight of all customer bookings, pickup timelines, and authorized status workflows.
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search reference #, driver name or email..."
                value={bookingSearch}
                onChange={(e) => {
                  setBookingSearch(e.target.value);
                  setBookingPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={bookingStatusFilter}
                onChange={(e) => {
                  setBookingStatusFilter(e.target.value);
                  setBookingPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="ACTIVE">ACTIVE (On-Road)</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="PENDING">PENDING</option>
              </select>

              <select
                value={bookingPaymentFilter}
                onChange={(e) => {
                  setBookingPaymentFilter(e.target.value);
                  setBookingPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Payments</option>
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="REFUNDED">REFUNDED</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          {isBookingsLoading ? (
            <Spinner size="lg" className="py-20" />
          ) : (
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                      <th className="p-4">Reference</th>
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Dates</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {bookingsList.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-sky-400">
                          {b.bookingNumber}
                          <span className="block text-[10px] text-slate-500 font-normal">
                            Pay: {b.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-white">
                          {b.car ? `${b.car.brand} ${b.car.model}` : 'Vehicle'}
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-slate-200">{b.driverName || 'Guest'}</p>
                          <p className="text-[10px] text-slate-400">{b.driverEmail}</p>
                        </td>
                        <td className="p-4 text-slate-300">
                          {formatDateTime(b.pickupDateTime)}
                          <span className="block text-[10px] text-slate-500">
                            {b.rentalDays} Day(s)
                          </span>
                        </td>
                        <td className="p-4 font-bold text-white">
                          {formatCurrency(b.totalAmount)}
                          <span className="block text-[10px] text-slate-500 font-normal">
                            Dep: {formatCurrency(b.securityDeposit)}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              b.bookingStatus === 'ACTIVE'
                                ? 'emerald'
                                : b.bookingStatus === 'CONFIRMED'
                                ? 'blue'
                                : b.bookingStatus === 'COMPLETED'
                                ? 'slate'
                                : b.bookingStatus === 'CANCELLED'
                                ? 'rose'
                                : 'amber'
                            }
                            size="sm"
                          >
                            {b.bookingStatus}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs py-1"
                            onClick={() => {
                              setStatusTransitionBooking(b);
                              setNewBookingStatus(b.bookingStatus);
                              setStatusChangeReason('');
                              setStatusChangeError('');
                            }}
                          >
                            Change Status
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bookings Pagination */}
          {bookingsPagination && bookingsPagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={bookingPage <= 1}
                onClick={() => setBookingPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-xs text-slate-400">
                Page {bookingPage} of {bookingsPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={bookingPage >= bookingsPagination.totalPages}
                onClick={() => setBookingPage((p) => p + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CUSTOMER DIRECTORY                                      */}
      {/* ============================================================== */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">Registered Customer Directory</h2>
              <p className="text-xs text-slate-400">
                Manage user accounts, review uploaded driving licenses, and adjust account access.
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setCustomerPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={customerStatusFilter}
              onChange={(e) => {
                setCustomerStatusFilter(e.target.value);
                setCustomerPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Account Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>

          {/* Customers Table */}
          {isCustomersLoading ? (
            <Spinner size="lg" className="py-20" />
          ) : (
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Driving License</th>
                    <th className="p-4">Bookings</th>
                    <th className="p-4">Total Spend</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {customersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                        <div className="text-[10px] text-slate-500">{u.phone || 'No phone'}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            u.accountStatus === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : u.accountStatus === 'SUSPENDED'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {u.accountStatus || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.documentStatus === 'VERIFIED'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : u.documentStatus === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                              : u.documentStatus === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {u.documentStatus || 'NOT_SUBMITTED'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-sky-400">{u.totalBookings} Trips</td>
                      <td className="p-4 font-bold text-emerald-400">
                        {formatCurrency(u.totalSpent || 0)}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs py-1"
                          onClick={() => setInspectingCustomerId(u.id)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Details & Docs
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs py-1"
                          onClick={() => {
                            setManagingCustomer(u);
                            setNewAccountStatus(
                              (u.accountStatus as any) || 'ACTIVE'
                            );
                            setAccountStatusReason('');
                            setAccountStatusError('');
                          }}
                        >
                          Status
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: REVENUE ANALYTICS & REPORTS                             */}
      {/* ============================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">Revenue Intelligence & CSV Reports</h2>
              <p className="text-xs text-slate-400">
                Audit complete revenue breakdowns and export one-click structured reports for compliance.
              </p>
            </div>

            {/* Export Report Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isExporting !== null}
                onClick={() => handleExportReport('bookings')}
                className="text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                {isExporting === 'bookings' ? 'Exporting...' : 'Export Bookings (CSV)'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isExporting !== null}
                onClick={() => handleExportReport('revenue')}
                className="text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                {isExporting === 'revenue' ? 'Exporting...' : 'Export Revenue (CSV)'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isExporting !== null}
                onClick={() => handleExportReport('utilization')}
                className="text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                {isExporting === 'utilization' ? 'Exporting...' : 'Export Fleet (CSV)'}
              </Button>
            </div>
          </div>

          {/* Date Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>Date Range:</span>
              <input
                type="date"
                value={analyticsStartDate}
                onChange={(e) => setAnalyticsStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none"
              />
              <span>to</span>
              <input
                type="date"
                value={analyticsEndDate}
                onChange={(e) => setAnalyticsEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none"
              />
            </div>
            {(analyticsStartDate || analyticsEndDate) && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs py-1"
                onClick={() => {
                  setAnalyticsStartDate('');
                  setAnalyticsEndDate('');
                }}
              >
                Reset Dates
              </Button>
            )}
          </div>

          {/* Detailed Financial Breakdown Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block tracking-wider">
                Earned Rental Income
              </span>
              <div className="text-3xl font-black text-white">
                {formatCurrency(analyticsData?.revenue?.rentalRevenue || 0)}
              </div>
              <p className="text-xs text-slate-400">
                Core daily hire fees collected from completed and paid bookings.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold uppercase text-amber-400 block tracking-wider">
                Security Deposits Managed
              </span>
              <div className="text-3xl font-black text-white">
                {formatCurrency(analyticsData?.revenue?.depositsCollected || 0)}
              </div>
              <p className="text-xs text-slate-400">
                Held in escrow during trips; refunded to customers upon vehicle inspection.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold uppercase text-indigo-400 block tracking-wider">
                Total Taxes & Fees
              </span>
              <div className="text-3xl font-black text-white">
                {formatCurrency(analyticsData?.revenue?.taxes || 0)}
              </div>
              <p className="text-xs text-slate-400">
                GST / statutory sales taxes collected for filing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: BUSINESS SETTINGS                                      */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          <div>
            <h2 className="text-xl font-black text-white">Platform Business Configuration</h2>
            <p className="text-xs text-slate-400">
              Configure organizational details, operational currency, and cancellation fee rules.
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Business settings updated successfully and logged in audit history!</span>
            </div>
          )}

          {settingsError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{settingsError}</span>
            </div>
          )}

          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Business Name</label>
                <input
                  type="text"
                  value={settingsForm.BUSINESS_NAME || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, BUSINESS_NAME: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Support Email</label>
                <input
                  type="email"
                  value={settingsForm.SUPPORT_EMAIL || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, SUPPORT_EMAIL: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Support Phone</label>
                <input
                  type="text"
                  value={settingsForm.SUPPORT_PHONE || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, SUPPORT_PHONE: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Currency Code</label>
                <input
                  type="text"
                  value={settingsForm.CURRENCY || 'INR'}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, CURRENCY: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  value={settingsForm.DEFAULT_TAX_RATE || '18'}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, DEFAULT_TAX_RATE: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Checkout Lock Hold (Minutes)</label>
                <input
                  type="number"
                  value={settingsForm.HOLD_DURATION_MINUTES || '15'}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, HOLD_DURATION_MINUTES: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="font-bold text-slate-300 block mb-1">Cancellation Policy Description</label>
              <textarea
                rows={2}
                value={settingsForm.CANCELLATION_REFUND_POLICY || ''}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, CANCELLATION_REFUND_POLICY: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                isLoading={updateSettingsMutation.isPending}
                onClick={() => updateSettingsMutation.mutate(settingsForm)}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: AUDIT TRAIL LOGS                                        */}
      {/* ============================================================== */}
      {activeTab === 'audit-logs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">System Security & Audit Trail</h2>
              <p className="text-xs text-slate-400">
                Immutable activity log recording all administrative modifications, IP addresses, and events.
              </p>
            </div>
          </div>

          {/* Audit Logs Table */}
          {isAuditLoading ? (
            <Spinner size="lg" className="py-20" />
          ) : (
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Admin Email</th>
                    <th className="p-4">Entity</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-sky-400">{log.action}</span>
                      </td>
                      <td className="p-4 font-medium text-slate-200">
                        {log.adminEmail || log.admin?.email || 'System'}
                      </td>
                      <td className="p-4 text-slate-300">
                        {log.entityType}
                        {log.entityId && (
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {log.entityId}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 font-mono">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs py-1"
                          onClick={() => setViewingAuditLog(log)}
                        >
                          View JSON
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {auditPagination && auditPagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={auditPage <= 1}
                onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-xs text-slate-400">
                Page {auditPage} of {auditPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={auditPage >= auditPagination.totalPages}
                onClick={() => setAuditPage((p) => p + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 8: COUPONS                                                 */}
      {/* ============================================================== */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">Promo Codes & Discounts</h2>
            <p className="text-xs text-slate-400">Manage promotional discount codes for reservations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Create New Promo Code</h3>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. LUXURY20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Discount Value</label>
                <input
                  type="number"
                  value={couponValue}
                  onChange={(e) => setCouponValue(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                disabled={!couponCode}
                onClick={() => createCouponMutation.mutate()}
              >
                Create Promo Code
              </Button>
            </div>

            <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4">Active Promo Codes</h3>
              <div className="space-y-3">
                {couponsData?.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-sky-400 font-mono text-sm">{c.code}</span>
                      <p className="text-slate-400 mt-0.5">{c.description || 'Promotional coupon'}</p>
                    </div>
                    <span className="font-bold text-white">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}% Off`
                        : `₹${c.discountValue} Off`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT CAR                                         */}
      {/* ============================================================== */}
      <Modal
        isOpen={isCarModalOpen}
        onClose={() => setIsCarModalOpen(false)}
        title={editingCar ? `Edit ${editingCar.brand} ${editingCar.model}` : 'Add New Luxury Vehicle'}
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveCarMutation.mutate();
          }}
          className="space-y-4 text-xs"
        >
          {carFormError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300">
              {carFormError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Brand *</label>
              <input
                type="text"
                placeholder="e.g. Porsche"
                value={carBrand}
                onChange={(e) => setCarBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Model *</label>
              <input
                type="text"
                placeholder="e.g. 911 GT3 RS"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Year</label>
              <input
                type="number"
                value={carYear}
                onChange={(e) => setCarYear(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Category</label>
              <select
                value={carCategoryId}
                onChange={(e) => setCarCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              >
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Transmission</label>
              <select
                value={carTransmission}
                onChange={(e) => setCarTransmission(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              >
                <option value="AUTOMATIC">AUTOMATIC</option>
                <option value="MANUAL">MANUAL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Daily Rate (₹) *</label>
              <input
                type="number"
                value={carDailyPrice}
                onChange={(e) => setCarDailyPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Refundable Deposit (₹) *</label>
              <input
                type="number"
                value={carSecurityDeposit}
                onChange={(e) => setCarSecurityDeposit(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={carImageUrl}
              onChange={(e) => setCarImageUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Features (comma separated)</label>
            <input
              type="text"
              value={carFeatures}
              onChange={(e) => setCarFeatures(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsCarModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={saveCarMutation.isPending}
            >
              Save Vehicle
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: BOOKING STATUS TRANSITION                               */}
      {/* ============================================================== */}
      <Modal
        isOpen={Boolean(statusTransitionBooking)}
        onClose={() => setStatusTransitionBooking(null)}
        title={`Update Reservation: ${statusTransitionBooking?.bookingNumber}`}
        maxWidth="md"
      >
        {statusTransitionBooking && (
          <div className="space-y-4 text-xs">
            {statusChangeError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300">
                {statusChangeError}
              </div>
            )}

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-bold text-white">{statusTransitionBooking.bookingStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle:</span>
                <span className="text-slate-200">
                  {statusTransitionBooking.car?.brand} {statusTransitionBooking.car?.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="text-slate-200">{statusTransitionBooking.driverName}</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Target Status *</label>
              <select
                value={newBookingStatus}
                onChange={(e) => setNewBookingStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
              >
                <option value="CONFIRMED">CONFIRMED (Reserved & ready)</option>
                <option value="ACTIVE">ACTIVE (On-Road with customer)</option>
                <option value="COMPLETED">COMPLETED (Vehicle returned & verified)</option>
                <option value="CANCELLED">CANCELLED (Trip terminated)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Audit Reason for Status Change *</label>
              <textarea
                rows={2}
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                placeholder="e.g. Vehicle handed over at BKC Mumbai hub with full tank and clean inspection."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusTransitionBooking(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!statusChangeReason.trim()}
                isLoading={updateBookingStatusMutation.isPending}
                onClick={() =>
                  updateBookingStatusMutation.mutate({
                    id: statusTransitionBooking.id,
                    status: newBookingStatus,
                    reason: statusChangeReason,
                  })
                }
              >
                Confirm Transition
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: CUSTOMER STATUS MANAGEMENT                              */}
      {/* ============================================================== */}
      <Modal
        isOpen={Boolean(managingCustomer)}
        onClose={() => setManagingCustomer(null)}
        title={`Manage Account Status: ${managingCustomer?.name}`}
        maxWidth="md"
      >
        {managingCustomer && (
          <div className="space-y-4 text-xs">
            {accountStatusError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300">
                {accountStatusError}
              </div>
            )}

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-white">{managingCustomer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-300">{managingCustomer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-mono text-sky-400 font-bold">{managingCustomer.accountStatus}</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Set Account Status *</label>
              <select
                value={newAccountStatus}
                onChange={(e) => setNewAccountStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE (Full booking privileges)</option>
                <option value="SUSPENDED">SUSPENDED (Temporary hold on new rentals)</option>
                <option value="BLOCKED">BLOCKED (Access prohibited due to policy violations)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Audit Reason *</label>
              <textarea
                rows={2}
                value={accountStatusReason}
                onChange={(e) => setAccountStatusReason(e.target.value)}
                placeholder="Reason for changing customer account status..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setManagingCustomer(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!accountStatusReason.trim()}
                isLoading={updateCustomerStatusMutation.isPending}
                onClick={() =>
                  updateCustomerStatusMutation.mutate({
                    id: managingCustomer.id,
                    status: newAccountStatus,
                    reason: accountStatusReason,
                  })
                }
              >
                Save Account Status
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: CUSTOMER PROFILE & DRIVING LICENSE REVIEW               */}
      {/* ============================================================== */}
      <Modal
        isOpen={Boolean(inspectingCustomerId)}
        onClose={() => setInspectingCustomerId(null)}
        title="Customer Profile & Document Review"
        maxWidth="2xl"
      >
        {isInspectingLoading ? (
          <Spinner size="md" className="py-12" />
        ) : inspectedCustomer ? (
          <div className="space-y-6 text-xs">
            {/* Customer Header Info */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <h4 className="text-base font-black text-white">
                  {inspectedCustomer.firstName} {inspectedCustomer.lastName}
                </h4>
                <p className="text-slate-400 mt-0.5">
                  {inspectedCustomer.email} • {inspectedCustomer.phone || 'No phone'}
                </p>
              </div>
              <Badge variant="blue" size="sm">
                Joined: {new Date(inspectedCustomer.createdAt).toLocaleDateString()}
              </Badge>
            </div>

            {/* Driving License Review Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-sky-400" /> Submitted Driving License Documents
              </h4>

              {inspectedCustomer.documents?.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-slate-400">
                  Customer has not submitted driving license documents yet.
                </div>
              ) : (
                inspectedCustomer.documents?.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">
                            {doc.documentNumber || 'License Number Pending'}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              doc.verificationStatus === 'VERIFIED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : doc.verificationStatus === 'REJECTED'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {doc.verificationStatus}
                          </span>
                        </div>
                        {doc.expiryDate && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Expiry Date: {new Date(doc.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Review Buttons */}
                      {doc.verificationStatus === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            onClick={() =>
                              reviewDocumentMutation.mutate({
                                id: doc.id,
                                status: 'VERIFIED',
                              })
                            }
                            isLoading={reviewDocumentMutation.isPending}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="text-xs"
                            onClick={() => setRejectingDocId(doc.id)}
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Rejection input box if opened */}
                    {rejectingDocId === doc.id && (
                      <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 space-y-2">
                        <label className="font-bold text-rose-300 block">
                          Reason for document rejection:
                        </label>
                        <input
                          type="text"
                          value={rejectionReasonInput}
                          onChange={(e) => setRejectionReasonInput(e.target.value)}
                          placeholder="e.g. Blurry photo, expired license, or name mismatch"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRejectingDocId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={!rejectionReasonInput.trim()}
                            onClick={() =>
                              reviewDocumentMutation.mutate({
                                id: doc.id,
                                status: 'REJECTED',
                                rejectionReason: rejectionReasonInput,
                              })
                            }
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Authenticated Stream Image Previews (Front & Back) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">
                          Front Image
                        </span>
                        {doc.hasFrontImage ? (
                          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video flex items-center justify-center">
                            <img
                              src={documentApi.getStreamUrl(doc.id, 'front')}
                              alt="Front License"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as any).src =
                                  'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="p-8 rounded-xl bg-slate-900 text-center text-slate-500">
                            No front image
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">
                          Back Image
                        </span>
                        {doc.hasBackImage ? (
                          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video flex items-center justify-center">
                            <img
                              src={documentApi.getStreamUrl(doc.id, 'back')}
                              alt="Back License"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as any).src =
                                  'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="p-8 rounded-xl bg-slate-900 text-center text-slate-500">
                            No back image
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: AUDIT LOG VIEWER                                        */}
      {/* ============================================================== */}
      <Modal
        isOpen={Boolean(viewingAuditLog)}
        onClose={() => setViewingAuditLog(null)}
        title="Audit Log Security Record"
        maxWidth="lg"
      >
        {viewingAuditLog && (
          <div className="space-y-4 text-xs font-mono">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div>
                <span className="text-slate-400">Action: </span>
                <strong className="text-sky-400">{viewingAuditLog.action}</strong>
              </div>
              <div>
                <span className="text-slate-400">Admin Email: </span>
                <span className="text-white">{viewingAuditLog.adminEmail || 'System'}</span>
              </div>
              <div>
                <span className="text-slate-400">Entity: </span>
                <span className="text-white">
                  {viewingAuditLog.entityType} ({viewingAuditLog.entityId || 'Global'})
                </span>
              </div>
              <div>
                <span className="text-slate-400">IP Address: </span>
                <span className="text-white">{viewingAuditLog.ipAddress || '127.0.0.1'}</span>
              </div>
              <div>
                <span className="text-slate-400">Timestamp: </span>
                <span className="text-white">
                  {new Date(viewingAuditLog.createdAt).toISOString()}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Audit Details Payload:</span>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px] overflow-x-auto max-h-60">
                {JSON.stringify(viewingAuditLog.details || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};