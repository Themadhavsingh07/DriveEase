import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, Database, UserCheck, Mail } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Trust & Privacy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#101B2D] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm sm:text-base text-[#64748B]">
          Effective Date: January 1, 2026 • Last Updated: November 14, 2026
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 shadow-sm space-y-10 text-[#334155] leading-relaxed">
        {/* Intro */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#101B2D] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#2563EB]" /> 1. Commitment to Data Privacy
          </h2>
          <p className="text-sm">
            At DriveEase Technologies Private Limited (&ldquo;DriveEase&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), we take your privacy and the security of your personal data seriously. This Privacy Policy outlines how we collect, store, process, and protect your information when you access our car rental platform, mobile applications, and concierge services in compliance with the Digital Personal Data Protection Act (DPDP Act, 2023) and applicable laws.
          </p>
        </section>

        {/* What We Collect */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#101B2D] flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#2563EB]" /> 2. Information We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <strong>Identity & Contact Information:</strong> Name, email address, phone number, residential address, emergency contact details.
            </li>
            <li>
              <strong>Driver Credentials:</strong> Valid government-issued Driving License copies, Driving License Number, expiry date, and KYC identity verification documents (Aadhaar / Passport) for legal compliance.
            </li>
            <li>
              <strong>Booking & Trip Data:</strong> Vehicle selection, pickup and dropoff dates/times, pickup hub locations, extra services, and mileage logs.
            </li>
            <li>
              <strong>Financial & Transaction Data:</strong> Transaction references, Razorpay order IDs, GST numbers (if applicable), and invoice details. Note: We do not store raw credit/debit card numbers or CVVs on our servers.
            </li>
            <li>
              <strong>Vehicle Telematics:</strong> Certain high-performance and luxury vehicles in our fleet are equipped with GPS telemetry and speed limit sensors for passenger safety and emergency assistance.
            </li>
          </ul>
        </section>

        {/* How We Use Information */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#101B2D] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#2563EB]" /> 3. How We Use Your Data
          </h2>
          <p className="text-sm">We use your personal data exclusively for:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>Processing, validating, and confirming your vehicle reservations.</li>
            <li>Verifying driver identity and legal eligibility to operate commercial motor vehicles.</li>
            <li>Processing rental payments, automated security deposit authorizations, and refunds.</li>
            <li>Sending transactional confirmations, tax invoices, and roadside assistance alerts.</li>
            <li>Detecting, preventing, and mitigating fraudulent transactions and unauthorized vehicle misuse.</li>
          </ul>
        </section>

        {/* Data Protection & Cookies */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#101B2D] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2563EB]" /> 4. Cookies & Security Measures
          </h2>
          <p className="text-sm">
            We employ bank-grade encryption protocols (TLS 1.3), hashed tokens (SHA-256), and HTTP-only SameSite cookies to protect your active sessions against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF). Sensitive KYC documents are stored with granular access controls and accessed only by authorized compliance personnel.
          </p>
        </section>

        {/* Customer Rights */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#101B2D] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#2563EB]" /> 5. Your Rights & Data Portability
          </h2>
          <p className="text-sm">
            Under applicable data protection laws, you retain the right to view, correct, update, or request the deletion of your account and personal records, subject to regulatory vehicle rental retention rules (e.g., maintaining trip and insurance history for mandatory statutory periods).
          </p>
        </section>

        {/* Grievance & Contact */}
        <section className="space-y-3 p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          <h2 className="text-base font-bold text-[#101B2D] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#2563EB]" /> Grievance Officer & Contact
          </h2>
          <p className="text-xs text-[#64748B]">
            If you have questions, feedback, or data privacy requests, you may contact our designated Grievance Officer:
          </p>
          <div className="text-xs space-y-1 text-[#334155] font-medium">
            <p>DriveEase Technologies Pvt. Ltd. — Legal & Compliance Division</p>
            <p>Email: <a href="mailto:privacy@driveease.com" className="text-[#2563EB] hover:underline">privacy@driveease.com</a></p>
            <p>Address: Bandra Kurla Complex, Terminal 2 Mobility Hub, Mumbai, Maharashtra 400051</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
