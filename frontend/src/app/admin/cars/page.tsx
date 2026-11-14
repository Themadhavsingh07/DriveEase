'use client';

import React, { Suspense } from 'react';
import { AdminDashboard } from '../../../components/admin/AdminDashboard';
import { Spinner } from '../../../components/common/Spinner';

export default function AdminCarsRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-xs text-slate-400">Loading fleet inventory...</p>
          </div>
        </div>
      }
    >
      <AdminDashboard initialTab="vehicles" hideHeaderTabs={true} />
    </Suspense>
  );
}
