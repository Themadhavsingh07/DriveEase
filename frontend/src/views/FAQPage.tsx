import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Search, Car, CreditCard, Shield, FileCheck, PhoneCall } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'booking' | 'docs' | 'payment' | 'safety';
}

const FAQS: FAQItem[] = [
  {
    category: 'booking',
    question: 'How does real-time vehicle availability work on DriveEase?',
    answer:
      'DriveEase uses a millisecond-precision calendar engine. When you select pickup and dropoff dates/times, our backend checks real-time reservation schedules and temporary checkout holds. Once you proceed to checkout, an exclusive 10-minute hold is secured with PostgreSQL advisory locks so nobody else can reserve your selected car while you enter payment details.',
  },
  {
    category: 'booking',
    question: 'Can I extend my rental while the trip is already ongoing?',
    answer:
      'Yes, subject to vehicle availability. If no subsequent renter has reserved the car for the requested extension window, you can extend directly from your Customer Dashboard under "Manage Booking". The additional rental amount and insurance are calculated at your original daily rate.',
  },
  {
    category: 'docs',
    question: 'What documents do I need to present during vehicle pickup?',
    answer:
      'You must present your original valid Driver’s License (LMV) and an approved government identity proof (Aadhaar Card, Passport, or Voter ID). International travelers must present their passport, valid visa, and an International Driving Permit (IDP) alongside their domestic license.',
  },
  {
    category: 'docs',
    question: 'What is the minimum age to rent a car?',
    answer:
      'Renters must be at least 21 years old with a minimum of 1 year of driving experience. For High-Performance Sports and Supercar fleet categories, the minimum driver age is 25 years.',
  },
  {
    category: 'payment',
    question: 'When and how is the security deposit refunded?',
    answer:
      'Security deposits are kept strictly segregated from rental revenue. Once your rental concludes and the vehicle passes inspection, our system initiates a full deposit refund within 48 to 72 business hours directly to your original payment method via Razorpay.',
  },
  {
    category: 'payment',
    question: 'Are taxes and insurance included in the displayed prices?',
    answer:
      'The initial price shows the daily base rental rate. In the transparent breakdown at checkout, you see 18% GST, chosen protection package (Basic, Premium, or Comprehensive), additional services, and the refundable security deposit clearly itemized. Zero hidden charges.',
  },
  {
    category: 'safety',
    question: 'What should I do in case of an accident or breakdown?',
    answer:
      'Every DriveEase rental includes 24/7 Roadside Assistance. In the unlikely event of an incident, first ensure all passengers are safe, then contact our dedicated Concierge emergency desk at +91 (022) 8900-EASE. A support patrol or towing unit will be dispatched immediately.',
  },
  {
    category: 'safety',
    question: 'What is your fuel policy?',
    answer:
      'We follow a simple "Like-to-Like" fuel policy. You will receive your vehicle with a full or documented fuel level and must return it with the same level. Electric vehicles are delivered with at least 85% charge.',
  },
];

export const FAQPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Knowledge Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#101B2D] tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-[#64748B]">
          Everything you need to know about reserving, picking up, and driving with DriveEase.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search question (e.g. deposit, license, insurance, fuel)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] shadow-sm"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { id: 'all', label: 'All Questions' },
          { id: 'booking', label: 'Booking & Availability' },
          { id: 'docs', label: 'Documents & Eligibility' },
          { id: 'payment', label: 'Payments & Deposits' },
          { id: 'safety', label: 'Safety & Fuel' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-[#101B2D] text-white shadow-sm'
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E8F0] p-8 text-[#64748B]">
            <p>No questions matched your search query. Try different keywords or reach out to concierge.</p>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-[#101B2D] hover:bg-slate-50/50"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#2563EB]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-[#475569] leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still Have Questions Box */}
      <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="font-bold text-[#101B2D]">Still have questions?</h4>
          <p className="text-xs text-[#64748B] mt-1">Our dedicated concierge desk is available 24/7 to assist you.</p>
        </div>
        <a
          href="tel:+9102289003273"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call +91 (022) 8900-EASE</span>
        </a>
      </div>
    </div>
  );
};

export default FAQPage;
