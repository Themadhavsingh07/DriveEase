'use client';

import React, { Suspense } from 'react';
import { CustomerBookingDetailsPage } from '../../../../../views/CustomerBookingDetailsPage';
import { Spinner } from '../../../../../components/common/Spinner';

export default function CustomerBookingDetailRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-slate-500 font-medium">Loading reservation details...</p>
          </div>
        </div>
      }
    >
      <CustomerBookingDetailsPage />
    </Suspense>
  );
}
