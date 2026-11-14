import React from 'react';
import type { Metadata } from 'next';
import { Providers } from './providers';
import '../index.css';

export const metadata: Metadata = {
  title: 'DriveEase – Luxury & Premium Car Rental Portal | Your Journey, Your Way',
  description:
    'Experience effortless luxury car rentals with real-time booking, instant verification, dynamic pricing, and premier customer service.',
  keywords: [
    'Car Rental',
    'Luxury Cars',
    'DriveEase',
    'Premium Vehicle Hire',
    'Self Drive',
    'Sports Car Rental',
    'SUV Rental',
  ],
  authors: [{ name: 'DriveEase Fleet Operations' }],
  openGraph: {
    title: 'DriveEase – Luxury & Premium Car Rental Portal',
    description: 'Your Journey, Your Way. Rent world-class luxury vehicles with flexible dates and instant confirmation.',
    type: 'website',
    locale: 'en_US',
    siteName: 'DriveEase',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] antialiased selection:bg-amber-500/20 selection:text-amber-400">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
