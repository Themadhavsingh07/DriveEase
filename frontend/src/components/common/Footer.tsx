import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Shield, Clock, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Drive<span className="text-sky-400">Ease</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              DriveEase is India&rsquo;s premier luxury vehicle rental portal. Experience seamless
              date-wise booking, verified fleets, transparent pricing, and white-glove customer
              concierge across major metropolitan hubs.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" /> 100% Insured Fleet
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" /> 24/7 Roadside Assist
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Verified Host Quality
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Explore Fleet
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/cars?category=luxury-sedan" className="hover:text-sky-400 transition-colors">
                  Luxury Saloons
                </Link>
              </li>
              <li>
                <Link to="/cars?category=premium-suv" className="hover:text-sky-400 transition-colors">
                  Executive SUVs
                </Link>
              </li>
              <li>
                <Link to="/cars?category=sports-performance" className="hover:text-sky-400 transition-colors">
                  Sports & Performance
                </Link>
              </li>
              <li>
                <Link to="/cars?category=electric-hybrid" className="hover:text-sky-400 transition-colors">
                  Electric Vehicles
                </Link>
              </li>
              <li>
                <Link to="/cars" className="hover:text-sky-400 transition-colors font-medium text-sky-400">
                  View All Fleet →
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Policies */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Rental Policies
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/how-it-works" className="hover:text-sky-400 transition-colors">
                  How Booking Works
                </Link>
              </li>
              <li>
                <Link to="/guidelines" className="hover:text-sky-400 transition-colors">
                  Rental Guidelines & Safety
                </Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="hover:text-sky-400 transition-colors">
                  Cancellation & Refunds
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-sky-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-sky-400 transition-colors">
                  About DriveEase
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Concierge */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              24/7 Concierge
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Bandra Kurla Complex, Terminal 2 Hub, Mumbai 400051</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>+91 (022) 8900-EASE</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>concierge@driveease.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} DriveEase Technologies Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Rental
            </Link>
            <Link to="/cancellation-policy" className="hover:text-slate-300 transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
