import React from 'react';
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck, Car, HelpCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-semibold uppercase tracking-wider">
          <Scale className="w-4 h-4" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#101B2D] tracking-tight">
          Terms & Conditions of Rental
        </h1>
        <p className="text-sm sm:text-base text-[#64748B]">
          Please read these rental terms carefully before booking any vehicle on DriveEase.
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 shadow-sm space-y-10 text-[#334155] leading-relaxed">
        {/* Section 1: Eligibility */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#101B2D] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2563EB]" /> 1. Driver Eligibility & Verification
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>The renter must be at least <strong>21 years of age</strong> (25 years of age for Supercars and High-Performance Sports categories).</li>
            <li>Must hold an original, valid <strong>Driving License</strong> (LMV class) held for at least 1 year prior to the rental commencement date.</li>
            <li>International visitors must present a valid passport, visa, and an International Driving Permit (IDP) alongside their domestic driving license.</li>
            <li>DriveEase reserves the right to decline handover if physical documents do not match the digital KYC documents submitted online.</li>
          </ul>
        </section>

        {/* Section 2: Security Deposit & Payment */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#101B2D] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2563EB]" /> 2. Security Deposit & Billing
          </h2>
          <p className="text-sm">
            A refundable security deposit (segregated based on vehicle category, typically ₹5,000 to ₹25,000) is pre-authorized or collected at checkout. This deposit acts as a guarantee against traffic penalties, unpaid FASTag tolls, or incidental damages.
          </p>
          <p className="text-sm">
            Upon successful return and completion of the vehicle check-in inspection, the security deposit is <strong>100% refunded within 48 to 72 banking hours</strong> to the original payment source.
          </p>
        </section>

        {/* Section 3: Vehicle Handover & Return */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#101B2D] flex items-center gap-2">
            <Car className="w-5 h-5 text-[#2563EB]" /> 3. Vehicle Handover, Fuel & Return
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li><strong>Inspection Checklist:</strong> At pickup, renter and DriveEase concierge inspect the vehicle and record any pre-existing scratches or dents on the digital check-in log.</li>
            <li><strong>Fuel Policy:</strong> Vehicles are provided with a full tank and must be returned with an equivalent fuel level. If returned lower, refilling charges plus a 10% administrative surcharge will apply.</li>
            <li><strong>Grace Period & Late Returns:</strong> A complimentary 30-minute grace period is granted. Beyond 30 minutes, late fees will be charged at standard hourly rates plus 50% surge fee.</li>
          </ul>
        </section>

        {/* Section 4: Prohibited Use */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#101B2D] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> 4. Prohibited Uses & Penalties
          </h2>
          <p className="text-sm">Under no circumstances may a DriveEase vehicle be used for:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-[#475569]">
            <li>Racing, pacemaking, speed testing, or off-road motorsports.</li>
            <li>Operation by any individual under the influence of alcohol, drugs, or impairing substances.</li>
            <li>Commercial sub-leasing, unauthorized ride-hailing, or carrying hazardous cargo.</li>
            <li>Permitting an unregistered or unverified driver to operate the steering wheel.</li>
          </ul>
          <p className="text-xs text-red-600 font-medium">
            Violation of prohibited use terms immediately voids insurance coverage and makes the renter personally liable for all damages, criminal liabilities, and third-party losses.
          </p>
        </section>

        {/* Section 5: Insurance & Liability */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#101B2D] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2563EB]" /> 5. Comprehensive Insurance & Deductibles
          </h2>
          <p className="text-sm">
            All vehicles carry comprehensive commercial insurance coverage. Depending on the protection package selected (Basic, Premium, or Comprehensive), the renter&rsquo;s maximum financial liability for accidental damage is capped at the designated package deductible.
          </p>
        </section>

        {/* Section 6: Jurisdiction */}
        <section className="space-y-2 text-xs text-[#64748B] pt-4 border-t border-[#E2E8F0]">
          <p>
            These terms are governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with rentals through DriveEase shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
