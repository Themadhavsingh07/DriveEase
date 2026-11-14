import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import { Badge } from './Badge';
import {
  Car,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, demoLogin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Explore Fleet', path: '/cars' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'Why Choose Us', path: '/#why-us' },
    { label: 'FAQ', path: '/#faq' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform duration-300">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-white flex items-center">
              Drive<span className="text-sky-400">Ease</span>
            </span>
            <span className="block text-[10px] font-medium tracking-widest text-slate-400 uppercase -mt-1">
              Luxury Mobility
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-sky-400 ${
                  isActive ? 'text-sky-400 font-semibold' : 'text-slate-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth / Action Area */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors focus:outline-none"
              >
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.firstName + ' ' + user.lastName
                    )}&background=0284c7&color=fff`
                  }
                  alt={user.firstName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-sky-400/40"
                />
                <div className="text-left text-xs">
                  <span className="block font-semibold text-slate-200">
                    {user.firstName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-sm font-semibold text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      <div className="mt-2">
                        {isAdmin ? (
                          <Badge variant="electric" size="sm">
                            <ShieldCheck className="w-3 h-3" /> Admin Verified
                          </Badge>
                        ) : (
                          <Badge variant="blue" size="sm">
                            Member
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-sky-400" />
                        My Bookings & Profile
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-300 hover:text-amber-200 hover:bg-slate-800 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800/80 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Quick Demo Login Pill for reviewer convenience */}
              <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs">
                <span className="px-2 text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-400" /> Demo:
                </span>
                <button
                  onClick={() => demoLogin('customer')}
                  className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Quick login as Demo Customer"
                >
                  Customer
                </button>
                <button
                  onClick={() => demoLogin('admin')}
                  className="px-2 py-1 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                  title="Quick login as Demo Admin"
                >
                  Admin
                </button>
              </div>

              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/cars">
                <Button variant="primary" size="sm">
                  Explore Fleet
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-800 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-sky-400 hover:bg-slate-800"
                >
                  My Dashboard & Bookings
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-amber-400 hover:bg-slate-800"
                  >
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-slate-800"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      demoLogin('customer');
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2 rounded-lg bg-slate-800 text-xs text-sky-400 text-center"
                  >
                    Demo Customer
                  </button>
                  <button
                    onClick={() => {
                      demoLogin('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2 rounded-lg bg-slate-800 text-xs text-amber-400 text-center"
                  >
                    Demo Admin
                  </button>
                </div>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 rounded-xl bg-slate-800 text-white font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 rounded-xl bg-blue-600 text-white font-medium"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
