import { Testimonial } from '../types';

export const mockTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Rajesh Varma',
    role: 'Corporate Strategy Director',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    review:
      'The booking process was remarkably smooth and transparent. The BMW 3 Series was delivered in pristine showroom condition right at the Mumbai airport. No paperwork surprises or hidden fees.',
    location: 'Mumbai, Maharashtra',
    carRented: 'BMW 3 Series Gran Limousine',
  },
  {
    id: 'test-2',
    name: 'Sneha Kapoor',
    role: 'Software Architect',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    review:
      'Took the Mahindra Thar for a 4-day mountain getaway to Lonavala and Mahabaleshwar. The car was spotless, mechanically flawless, and the refundable deposit was back in my bank account in 24 hours.',
    location: 'Pune, Maharashtra',
    carRented: 'Mahindra Thar LX 4x4',
  },
  {
    id: 'test-3',
    name: 'Amitabh Sengupta',
    role: 'Management Consultant',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    review:
      'DriveEase is by far the most polished rental platform I have used in India. The Hyundai Creta had high-tech ADAS features and a panoramic sunroof that my family thoroughly enjoyed.',
    location: 'Bangalore, Karnataka',
    carRented: 'Hyundai Creta SX (O)',
  },
];
