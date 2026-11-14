'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 text-center bg-[#F5F7FA]">
      <div className="bg-white rounded-3xl p-12 border border-[#E2E8F0] shadow-sm max-w-md w-full space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto border border-blue-200">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>
        <h1 className="text-4xl font-black text-[#101B2D]">404</h1>
        <h2 className="text-lg font-bold text-[#1E293B]">Page Not Found</h2>
        <p className="text-xs text-[#64748B] leading-relaxed">
          The destination page you are looking for does not exist or has been relocated.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition"
        >
          <span>Return to Homepage</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
