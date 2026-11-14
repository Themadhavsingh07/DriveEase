import { PlatformBenefit, HowItWorksStep } from '../types';

export const mockBenefits: PlatformBenefit[] = [
  {
    id: 'benefit-1',
    title: 'Wide Vehicle Selection',
    description: 'From fuel-efficient compact hatchbacks to commanding 4x4 SUVs and luxury executive sedans, find the perfect machine for every journey.',
    iconName: 'Car',
  },
  {
    id: 'benefit-2',
    title: 'Transparent Pricing',
    description: 'Clear itemized quotes with zero hidden charges. Daily rates, insurance cover, taxes, and refundable security deposits are visible upfront.',
    iconName: 'BadgePercent',
  },
  {
    id: 'benefit-3',
    title: 'Secure Reservations',
    description: 'Instant reservation confirmations backed by our atomic calendar scheduling engine, guaranteeing no double-bookings or surprise cancellations.',
    iconName: 'ShieldCheck',
  },
  {
    id: 'benefit-4',
    title: 'Flexible Rental Periods',
    description: 'Rent on your terms—from single-day city errands to multi-week cross-country tours with easy extensions and fair cancellation policies.',
    iconName: 'CalendarRange',
  },
  {
    id: 'benefit-5',
    title: '24/7 Customer Support',
    description: 'Dedicated concierge team and round-the-clock nationwide roadside assistance ready to support you at any hour of your journey.',
    iconName: 'Headphones',
  },
  {
    id: 'benefit-6',
    title: 'Easy Booking Experience',
    description: 'Intuitive modern interface allowing you to compare models, choose protection tiers, and confirm your booking in under two minutes.',
    iconName: 'Sparkles',
  },
];

export const mockHowItWorksSteps: HowItWorksStep[] = [
  {
    stepNumber: '01',
    title: 'Find Your Car',
    description: 'Search by brand, category, transmission, or fuel preference to find the vehicle that matches your journey style.',
    iconName: 'Search',
  },
  {
    stepNumber: '02',
    title: 'Select Your Dates',
    description: 'Pick your preferred pickup and return dates, times, and delivery hubs with real-time calendar availability.',
    iconName: 'CalendarDays',
  },
  {
    stepNumber: '03',
    title: 'Confirm Your Booking',
    description: 'Review transparent itemized costs, choose your preferred damage protection tier, and reserve with instant confirmation.',
    iconName: 'ShieldCheck',
  },
  {
    stepNumber: '04',
    title: 'Enjoy Your Journey',
    description: 'Collect your thoroughly sanitized keys at your chosen hub or airport terminal and hit the open road with complete peace of mind.',
    iconName: 'Navigation',
  },
];

export const mockLocations = [
  'Bandra Kurla Complex, Mumbai',
  'Chhatrapati Shivaji Maharaj Airport (T2), Mumbai',
  'Worli Sea Face, Mumbai',
  'Powai Technology Hub, Mumbai',
  'Indira Gandhi International Airport (T3), Delhi',
  'Connaught Place, Central Delhi',
  'Cyber City, Gurugram',
  'Kempegowda International Airport, Bengaluru',
  'Indiranagar 100ft Road, Bengaluru',
  'Koramangala 5th Block, Bengaluru',
  'Rajiv Gandhi International Airport, Hyderabad',
  'Hitec City, Hyderabad',
  'Dabolim International Airport, Goa',
  'Mopa Airport, North Goa',
];
