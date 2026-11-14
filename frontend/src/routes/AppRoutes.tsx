import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Car } from 'lucide-react';

// Route-Based Code-Splitting via React.lazy for optimal bundle size and fast initial load
const HomePage = lazy(() => import('../views/HomePage').then((m) => ({ default: m.HomePage })));
const FleetPage = lazy(() => import('../views/FleetPage').then((m) => ({ default: m.FleetPage })));
const CarDetailsPage = lazy(() => import('../views/CarDetailsPage').then((m) => ({ default: m.CarDetailsPage })));
const CheckoutPage = lazy(() => import('../views/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const BookingConfirmationPage = lazy(() => import('../views/BookingConfirmationPage').then((m) => ({ default: m.BookingConfirmationPage })));
const HowItWorksPage = lazy(() => import('../views/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })));
const AboutPage = lazy(() => import('../views/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('../views/ContactPage').then((m) => ({ default: m.ContactPage })));
const LoginPage = lazy(() => import('../views/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../views/RegisterPage').then((m) => ({ default: m.RegisterPage })));

// Customer Dashboard Pages
const DashboardPage = lazy(() => import('../views/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const CustomerBookingDetailsPage = lazy(() => import('../views/CustomerBookingDetailsPage').then((m) => ({ default: m.CustomerBookingDetailsPage })));
const CustomerProfilePage = lazy(() => import('../views/CustomerProfilePage').then((m) => ({ default: m.CustomerProfilePage })));

// Admin Management Pages
const AdminPage = lazy(() => import('../views/AdminPage').then((m) => ({ default: m.AdminPage })));

// Legal & Customer Trust Pages
const PrivacyPolicyPage = lazy(() => import('../views/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('../views/TermsPage').then((m) => ({ default: m.TermsPage })));
const CancellationPolicyPage = lazy(() => import('../views/CancellationPolicyPage').then((m) => ({ default: m.CancellationPolicyPage })));
const FAQPage = lazy(() => import('../views/FAQPage').then((m) => ({ default: m.FAQPage })));
const RentalGuidelinesPage = lazy(() => import('../views/RentalGuidelinesPage').then((m) => ({ default: m.RentalGuidelinesPage })));

// Fallback 404 Page
const NotFoundPage = lazy(() => import('../views/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center animate-pulse shadow-lg shadow-sky-500/20">
      <Car className="w-6 h-6 text-white animate-bounce" />
    </div>
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
      Loading DriveEase...
    </p>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cars" element={<FleetPage />} />
        <Route path="/cars/:id" element={<CarDetailsPage />} />
        <Route path="/booking/checkout" element={<CheckoutPage />} />
        <Route path="/booking/confirmation/:reference" element={<BookingConfirmationPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Legal & Trust Routes */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/guidelines" element={<RentalGuidelinesPage />} />
        
        {/* Customer Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/bookings/:id" element={<CustomerBookingDetailsPage />} />
        <Route path="/dashboard/profile" element={<CustomerProfilePage />} />
        
        {/* Admin Management System Routes */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/:tab" element={<AdminPage />} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
