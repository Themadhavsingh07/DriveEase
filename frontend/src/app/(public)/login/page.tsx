'use client';

import React, { Suspense } from 'react';
import { LoginPage } from '../../../views/LoginPage';
import { Spinner } from '../../../components/common/Spinner';

export default function LoginRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
