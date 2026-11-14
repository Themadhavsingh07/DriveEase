'use client';

import React, { Suspense } from 'react';
import { RegisterPage } from '../../../views/RegisterPage';
import { Spinner } from '../../../components/common/Spinner';

export default function RegisterRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
          <Spinner size="lg" />
        </div>
      }
    >
      <RegisterPage />
    </Suspense>
  );
}
