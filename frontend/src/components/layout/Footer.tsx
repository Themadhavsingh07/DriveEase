'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Shield, Clock, Award, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#101B2D] text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white flex items-center">
                  Drive<span className="text-[#38BDF8]">Ease</span>
                </span>
                <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase -mt-1">
                  Your Journey, Your Way
                </span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              DriveEase is your premier automotive mobility portal. Offering transparent pricing,
              curated quality vehicles, and an effortless online reservation process across India.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-4 h-4 text-emerald-400" /> Fully Insured Fleet
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-4 h-4 text-sky-400" /> 24/7 Roadside Assistance
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
              Explore Fleet
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/cars?category=Hatchback" className="hover:text-white transition-colors">
                  City Hatchbacks
                </Link>
              </li>
              <li>
                <Link to="/cars?category=Sedan" className="hover:text-white transition-colors">
                  Executive Sedans
                </Link>
              </li>
              <li>
                <Link to="/cars?category=SUV" className="hover:text-white transition-colors">
                  Premium & 4x4 SUVs
                </Link>
              </li>
              <li>
                <Link to="/cars?category=Luxury" className="hover:text-white transition-colors">
                  Prestige Luxury
                </Link>
              </li>
              <li>
                <Link to="/cars?category=Electric" className="hover:text-white transition-colors">
                  Electric Vehicles
                </Link>
              </li>
              <li>
                <Link to="/cars?category=Sports" className="hover:text-white transition-colors">
                  Sports & Performance
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Policies */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
              Company & Help
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About DriveEase
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Rental FAQs
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  My Reservations
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Concierge */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
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
          <p>© {new Date().getFullYear()} DriveEase Mobility Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Rental</span>
            <span className="hover:text-slate-400 cursor-pointer">Insurance Disclosures</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
