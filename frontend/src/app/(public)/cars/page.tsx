'use client';

import React, { Suspense } from 'react';
import { FleetPage } from '../../../views/FleetPage';
import { Spinner } from '../../../components/common/Spinner';

export default function CarsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-slate-500 font-medium">Loading luxury fleet...</p>
          </div>
        </div>
      }
    >
      <FleetPage />
    </Suspense>
  );
}
