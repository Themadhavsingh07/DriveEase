'use client';

import React, { Suspense } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] text-[#1E293B]">
      <Suspense fallback={<div className="h-20 bg-white" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[50vh]" />}>{children}</Suspense>
      </main>
      <Footer />
    </div>
  );
}
