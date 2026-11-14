export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG' | 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
export type TransmissionType = 'Automatic' | 'Manual' | 'AUTOMATIC' | 'MANUAL';
export type CarCategoryType = 'Hatchback' | 'Sedan' | 'SUV' | 'Luxury' | 'Electric' | 'Sports' | string;

export interface CarImage {
  id: string;
  url: string;
  isPrimary: boolean;
  caption?: string;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  name?: string;
  year: number;
  category: CarCategoryType;
  categoryId?: string;
  categoryObj?: CarCategory;
  fuelType: FuelType;
  transmission: TransmissionType;
  seatingCapacity: number;
  mileage: string;
  doors?: number;
  luggageCapacity?: number;
  engineCapacity?: string;
  horsepower?: number;
  bodyType?: string;
  dailyPrice: number; // in INR (₹)
  pricePerDay?: number; // alias for dailyPrice
  securityDeposit: number; // in INR (₹)
  pickupLocation: string;
  dropoffLocation: string;
  features: string[];
  isAvailable: boolean;
  availabilityStatus?: 'Available' | 'Reserved' | 'Maintenance';
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  popularity?: number;
  images: CarImage[];
  description?: string;
  highlights?: string[];
  suitableFor?: string[];
  minimumRentalPeriod?: string;
  mileagePolicy?: string;
  fuelPolicy?: string;
  cancellationPolicy?: string;
  pickupInstructions?: string;
  status?: string;
  licensePlate?: string;
  createdAt?: string;
}

export interface CarCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  _count?: {
    cars: number;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  firstName: string;
  lastName: string;
  phone?: string | null;
  drivingLicenseNumber?: string | null;
  role: 'CUSTOMER' | 'ADMIN' | string;
  avatar?: string | null;
  isActive?: boolean;
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | string;
  emailVerified?: boolean;
  createdAt?: string;
  documents?: UserDocument[];
}

export interface UserDocument {
  id: string;
  userId?: string;
  documentType: string;
  documentNumber?: string | null;
  expiryDate?: string | null;
  hasFrontImage?: boolean;
  frontOriginalName?: string | null;
  hasBackImage?: boolean;
  backOriginalName?: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  frontUrl?: string | null;
  backUrl?: string | null;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  admin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export interface AdminOverviewStats {
  totalEarnedRentalRevenue: number;
  totalGrossRevenue: number;
  totalDepositsHeld: number;
  totalTaxesCollected: number;
  totalRefundsProcessed: number;
  pendingRefundsAmount: number;
  pendingRefundsCount: number;
  totalBookings: number;
  totalCustomers: number;
  totalCars: number;
  availableCars: number;
  activeRentals: number;
  upcomingBookings: number;
  pendingPayments: number;
  cancelledBookings: number;
  utilizationRate: number;
}

export interface AdminOverviewCharts {
  monthlyTrends: Array<{ month: string; revenue: number; bookings: number; deposits?: number }>;
  dailyTrends: Array<{ date: string; day: string; revenue: number; bookings: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
  categoryStats: Array<{ category: string; count: number; revenue: number }>;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  isActive: boolean;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | string;
  drivingLicenseNumber?: string | null;
  joinedAt: string;
  totalBookings: number;
  totalSpent: number;
  documentStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED' | string;
  documentId?: string | null;
}

export interface BookingServiceItem {
  id?: string;
  service: {
    name: string;
    pricePerDay?: number | string;
  };
  quantity?: number;
  pricePerUnit?: number | string;
  days?: number;
  totalPrice: number | string;
}

export interface BookingPayment {
  id?: string;
  paymentMethod?: string;
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status?: string;
  amount?: number | string;
  paidAt?: string | null;
  createdAt?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  carId: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  returnDateTime: string;
  rentalDays: number;
  dailyPrice: number | string;
  basePrice: number | string;
  baseAmount?: number | string;
  insuranceType: string;
  insurancePrice: number | string;
  insuranceAmount?: number | string;
  servicesPrice: number | string;
  additionalServiceAmount?: number | string;
  taxAmount: number | string;
  discountAmount: number | string;
  couponCode?: string | null;
  securityDeposit: number | string;
  totalAmount: number | string;
  bookingStatus: string;
  paymentStatus: string;
  driverName?: string;
  driverEmail?: string;
  driverPhone?: string;
  driverLicenseNumber?: string;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  refundAmount?: number | string | null;
  refundStatus?: string | null;
  refundId?: string | null;
  createdAt: string;
  car?: Car;
  user?: User;
  services?: BookingServiceItem[];
  payment?: BookingPayment | null;
}

export interface AdditionalService {
  id: string;
  name: string;
  slug: string;
  description?: string;
  pricePerDay: number | string;
  isOneTime: boolean;
  isAvailable: boolean;
}

export interface PricingBreakdown {
  dailyPrice: number;
  rentalDays: number;
  baseAmount: number;
  insuranceType: string;
  insuranceRatePerDay: number;
  insuranceAmount: number;
  servicesAmount: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  couponCode?: string;
  securityDeposit: number;
  finalPayableAmount: number;
}

export interface CarCategoryItem {
  id: string;
  name: CarCategoryType;
  slug: string;
  description: string;
  iconName: string;
  image: string;
  vehicleCount: number;
  startingPrice: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  review: string;
  location: string;
  carRented: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface BookingSearchParams {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
}

export interface PlatformBenefit {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface HowItWorksStep {
  stepNumber: string;
  title: string;
  description: string;
  iconName: string;
}
