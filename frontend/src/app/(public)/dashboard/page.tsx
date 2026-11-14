'use client';

import React, { Suspense } from 'react';
import { DashboardPage } from '../../../views/DashboardPage';
import { Spinner } from '../../../components/common/Spinner';

export default function CustomerDashboardRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-slate-500 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      }
    >
      <DashboardPage />
    </Suspense>
  );
}
