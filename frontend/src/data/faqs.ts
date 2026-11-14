import { FAQItem } from '../types';

export const mockFAQs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I rent a car?',
    answer:
      'Renting a car with DriveEase is straightforward: search for your desired vehicle by selecting your pickup and return locations, dates, and times. Compare models and itemized pricing, choose your protection tier, and reserve online in minutes with instant confirmation.',
  },
  {
    id: 'faq-2',
    question: 'What documents are required?',
    answer:
      "At vehicle handover, you must present an original valid Driver's License held for at least one year and a Government-issued Photo ID (such as an Aadhaar Card, Passport, or Voter ID). International travelers must present their original passport and an International Driving Permit (IDP).",
  },
  {
    id: 'faq-3',
    question: 'Can I cancel my booking?',
    answer:
      'Yes, we provide flexible cancellation policies. Cancellations made at least 24 hours prior to scheduled pickup receive a 100% full refund with zero penalty fees. Cancellations requested within 24 hours of scheduled pickup are eligible for an 80% refund.',
  },
  {
    id: 'faq-4',
    question: 'Is a security deposit required?',
    answer:
      'Yes, a refundable security deposit is held during the rental tenure to safeguard the vehicle. This deposit is clearly itemized separately from rental charges on your price summary and invoice. It is automatically refunded in full to your payment method within 24–48 hours after safe vehicle return.',
  },
  {
    id: 'faq-5',
    question: 'Can I extend my rental period?',
    answer:
      'Yes! Rental periods can be extended directly through your User Dashboard, provided the vehicle does not have an upcoming overlapping reservation on the calendar. We recommend requesting extensions at least 6 hours prior to your scheduled return.',
  },
  {
    id: 'faq-6',
    question: 'What happens if I return the car late?',
    answer:
      'We offer a grace period of up to 45 minutes for unexpected traffic. Beyond the grace threshold, additional hourly charges apply based on the vehicle’s standard hourly rate. Returning more than 3 hours late without prior notification may incur a full additional day rental fee.',
  },
];
