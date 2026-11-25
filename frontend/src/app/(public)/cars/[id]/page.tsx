import React, { Suspense } from 'react';
import { mockCars } from '../../../../data/cars';
import { CarDetailPageClient } from './CarDetailPageClient';
import { Spinner } from '../../../../components/common/Spinner';

export function generateStaticParams() {
  return mockCars.map((car) => ({
    id: car.id,
  }));
}

export default function CarDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-slate-500 font-medium">Loading vehicle details...</p>
          </div>
        </div>
      }
    >
      <CarDetailPageClient />
    </Suspense>
  );
}
