'use client';

import React, { Suspense } from 'react';
import { CustomerProfilePage } from '../../../../views/CustomerProfilePage';
import { Spinner } from '../../../../components/common/Spinner';

export default function CustomerProfileRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-slate-500 font-medium">Loading profile...</p>
          </div>
        </div>
      }
    >
      <CustomerProfilePage />
    </Suspense>
  );
}
