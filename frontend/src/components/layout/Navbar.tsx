'use client';

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Menu, X, ArrowRight, Heart, User, ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '../common/Button';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Explore Cars', path: '/cars' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-3.5 border-b border-slate-200/80'
          : 'bg-white py-4 border-b border-slate-100'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#101B2D] flex items-center justify-center text-white shadow-md group-hover:bg-[#2563EB] transition-colors duration-300">
            <Car className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-[#101B2D] flex items-center">
              Drive<span className="text-[#2563EB]">Ease</span>
            </span>
            <span className="block text-[10px] font-semibold tracking-wider text-[#64748B] uppercase -mt-1">
              Your Journey, Your Way
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.label}
                to={link.path}
                className={cn(
                  'text-sm font-semibold transition-colors duration-200 relative py-1',
                  active
                    ? 'text-[#2563EB]'
                    : 'text-[#64748B] hover:text-[#101B2D]'
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2563EB] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {wishlistCount > 0 && (
            <Link
              to="/cars?saved=true"
              className="relative p-2 rounded-xl text-slate-600 hover:text-rose-500 hover:bg-slate-50 transition-colors"
              title={`View ${wishlistCount} saved vehicles`}
            >
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="border-amber-400 text-amber-800 hover:bg-amber-50">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                    <span>Admin</span>
                  </Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="secondary" size="sm" className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#101B2D] text-white text-[10px] font-bold flex items-center justify-center">
                    {(user.firstName || user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.firstName || user.name || 'Dashboard'}</span>
                </Button>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" className="font-semibold shadow-sm">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:text-black hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Toggle mobile navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                    active
                      ? 'bg-blue-50 text-[#2563EB]'
                      : 'text-[#64748B] hover:text-[#101B2D] hover:bg-slate-50'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            {wishlistCount > 0 && (
              <Link
                to="/cars?saved=true"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  Saved Favourites
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                  {wishlistCount}
                </span>
              </Link>
            )}
          </nav>

          <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {isAuthenticated && user ? (
              <>
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#101B2D] text-white font-bold flex items-center justify-center">
                    {(user.firstName || user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#101B2D] truncate">
                      {user.name || `${user.firstName} ${user.lastName}`.trim() || 'Valued Customer'}
                    </p>
                    <p className="text-xs text-[#64748B] truncate">{user.email}</p>
                  </div>
                </div>

                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="md" className="w-full border-amber-400 text-amber-800">
                      <ShieldAlert className="w-4 h-4 mr-2 text-amber-600" />
                      Admin Console
                    </Button>
                  </Link>
                )}

                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full">
                    My Account & Bookings
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
