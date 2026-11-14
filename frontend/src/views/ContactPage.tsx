import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle2,
  Send,
  Headphones,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSent(true);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest block">
          24/7 Concierge Support
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#101B2D] tracking-tight">
          We Are Here to Assist You
        </h1>
        <p className="text-base text-[#64748B]">
          Have a question about a reservation, airport handover, or corporate leasing?
          Our concierge support team is available around the clock.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Contact Info Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-[#101B2D]">Contact Channels</h3>

            <div className="space-y-6 text-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#101B2D]">24/7 Nationwide Hotline</h4>
                  <p className="text-[#64748B] mt-0.5">+91 (022) 8900-EASE</p>
                  <p className="text-[11px] text-[#2563EB] mt-0.5 font-medium">Toll-free customer assist</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#101B2D]">Concierge Email</h4>
                  <p className="text-[#64748B] mt-0.5">concierge@driveease.com</p>
                  <p className="text-[#64748B]">support@driveease.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#101B2D]">Central Headquarters</h4>
                  <p className="text-[#64748B] mt-0.5 leading-relaxed">
                    Tower 3, Level 8, G Block, Bandra Kurla Complex, Mumbai, Maharashtra 400051
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#101B2D]">Operating Hours</h4>
                  <p className="text-[#64748B] mt-0.5">Fleet Dispatch: 24 Hours / 7 Days</p>
                  <p className="text-[#64748B]">Office Concierge: 8:00 AM – 10:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-[#101B2D]">Send a Direct Message</h3>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Fill in your details and our mobility consultant will get in touch within 2 hours.
            </p>
          </div>

          {isSent ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-emerald-900">Message Received!</h4>
              <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
                Thank you for contacting DriveEase. Our team has received your message and will contact you via email at{' '}
                <strong>{email}</strong> shortly.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSent(false);
                  setMessage('');
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#101B2D] uppercase tracking-wider block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rohan Mehta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-[#101B2D] uppercase tracking-wider block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#101B2D] uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98000 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#101B2D] uppercase tracking-wider block mb-1">
                    Inquiry Topic
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Reservation Support">Existing Reservation Support</option>
                    <option value="Airport Pickup Question">Airport Curbside Pickup</option>
                    <option value="Corporate Fleet Leasing">Corporate Fleet Leasing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#101B2D] uppercase tracking-wider block mb-1">
                  How can we help? *
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your trip dates, preferred vehicle category, or special requests..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="font-bold">
                <Send className="w-4 h-4 mr-1.5" />
                <span>Submit Message</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
