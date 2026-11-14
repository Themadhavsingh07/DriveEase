import React from 'react';
import { mockFAQs } from '../../data/faqs';
import { Accordion } from '../common/Accordion';

export const FAQSection: React.FC = () => {
  const accordionItems = mockFAQs.map((faq) => ({
    id: faq.id,
    title: faq.question,
    content: <p>{faq.answer}</p>,
  }));

  return (
    <section id="faq" className="py-24 bg-[#F5F7FA] border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest block mb-1">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101B2D]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Everything you need to know about our vehicle reservations, policies, and handover procedures.
          </p>
        </div>

        <Accordion items={accordionItems} defaultOpenId="faq-1" />
      </div>
    </section>
  );
};
