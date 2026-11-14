import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Compass, ArrowRight } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4 text-center">
      <div className="bg-white rounded-3xl p-12 border border-[#E2E8F0] shadow-sm max-w-md w-full space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto border border-blue-200">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>
        <h1 className="text-4xl font-black text-[#101B2D]">404</h1>
        <h2 className="text-lg font-bold text-[#1E293B]">Page Not Found</h2>
        <p className="text-xs text-[#64748B] leading-relaxed">
          The destination page you are looking for does not exist or has been relocated.
        </p>
        <Link to="/" className="inline-block pt-2">
          <Button variant="primary" size="md">
            <span>Return to Homepage</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
