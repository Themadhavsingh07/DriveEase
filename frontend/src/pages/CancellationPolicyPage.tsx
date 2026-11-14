import React from 'react';
import { RefreshCw, CheckCircle2, Clock, AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CancellationPolicyPage: React.FC = () => {
  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
          <RefreshCw className="w-4 h-4" />
          <span>Transparent & Fair</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#101B2D] tracking-tight">
          Cancellation & Refund Policy
        </h1>
        <p className="text-sm sm:text-base text-[#64748B]">
          Clear, automated cancellation rules designed to give you peace of mind with instant refund tracking.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            24h+
          </div>
          <h3 className="text-base font-bold text-[#101B2D]">Free Cancellation</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Cancel 24 hours or more prior to your scheduled pickup time for a <strong>100% full refund</strong> with zero cancellation charges.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            20%
          </div>
          <h3 className="text-base font-bold text-[#101B2D]">Late Cancellation</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Cancellations made within 24 hours of pickup incur a <strong>20% fee</strong> on base rental. Your security deposit is always refunded 100%.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-black">
            5-7d
          </div>
          <h3 className="text-base font-bold text-[#101B2D]">Fast Bank Refunds</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Refunds are initiated instantly via Razorpay to your original payment method, settling in <strong>5 to 7 banking days</strong>.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 text-[#334155] leading-relaxed">
        {/* Policy Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-xs font-semibold uppercase text-[#64748B] bg-[#F8FAFC]">
                <th className="py-3.5 px-4">Cancellation Timing</th>
                <th className="py-3.5 px-4">Cancellation Fee</th>
                <th className="py-3.5 px-4">Rental Refund</th>
                <th className="py-3.5 px-4">Security Deposit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#101B2D]">≥ 24 Hours before pickup</td>
                <td className="py-3.5 px-4 text-emerald-600 font-bold">₹0 (Free)</td>
                <td className="py-3.5 px-4">100% Refund</td>
                <td className="py-3.5 px-4 text-emerald-600 font-bold">100% Full Refund</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#101B2D]">&lt; 24 Hours before pickup</td>
                <td className="py-3.5 px-4 text-amber-600 font-bold">20% of base rental</td>
                <td className="py-3.5 px-4">80% Refund + Taxes</td>
                <td className="py-3.5 px-4 text-emerald-600 font-bold">100% Full Refund</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#101B2D]">After pickup time (No Show)</td>
                <td className="py-3.5 px-4 text-red-600 font-bold">50% of base rental</td>
                <td className="py-3.5 px-4">50% Refund</td>
                <td className="py-3.5 px-4 text-emerald-600 font-bold">100% Full Refund</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#101B2D]">DriveEase / Fleet Maintenance cancellation</td>
                <td className="py-3.5 px-4 text-emerald-600 font-bold">₹0</td>
                <td className="py-3.5 px-4 text-emerald-600 font-bold">100% Full Refund + Upgrade</td>
                <td className="py-3.5 px-4 text-emerald-600 font-bold">100% Full Refund</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Security Deposit Segregation Clause */}
        <section className="space-y-3 p-5 bg-blue-50/50 border border-blue-100 rounded-xl">
          <h2 className="text-base font-bold text-[#101B2D] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2563EB]" /> Security Deposit Protection
          </h2>
          <p className="text-xs text-[#475569] leading-relaxed">
            The security deposit is kept strictly segregated from rental earnings. Under no circumstances is a cancellation fee deducted from your refundable security deposit. If a booking is cancelled, 100% of your deposit is immediately unlocked and queued for release.
          </p>
        </section>

        {/* How to Cancel */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#101B2D] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#2563EB]" /> How to Cancel a Reservation
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-[#475569]">
            <li>Log into your account and navigate to your <Link to="/dashboard" className="text-[#2563EB] font-medium hover:underline">Customer Dashboard</Link>.</li>
            <li>Locate the upcoming booking under <strong>My Bookings</strong> and click <strong>View Details</strong>.</li>
            <li>Select the <strong>Cancel Reservation</strong> button and provide a quick reason.</li>
            <li>The dynamic refund calculator will show the exact refund breakdown before you confirm.</li>
            <li>Once confirmed, your refund is instantly queued in Razorpay and a confirmation email is dispatched.</li>
          </ol>
        </section>
      </div>
    </div>
  );
};

export default CancellationPolicyPage;
