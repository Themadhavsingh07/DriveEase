import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Car, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const redirectPath =
    (location.state as any)?.from?.pathname ||
    (new URLSearchParams(location.search).get('redirect')) ||
    '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg('');

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-[#E2E8F0] shadow-xl">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-[#101B2D] flex items-center justify-center text-white shadow-md group-hover:bg-[#2563EB] transition-colors">
              <Car className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
            </div>
            <span className="text-2xl font-black text-[#101B2D]">
              Drive<span className="text-[#2563EB]">Ease</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-[#101B2D] tracking-tight">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Access your reservations, invoices, and saved driver profile.
          </p>
        </div>

        {/* Demo Credentials Helper Box */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
          <span className="text-[11px] font-bold text-[#101B2D] flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" /> Verified Database Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('customer@driveease.com', 'password123')}
              className="py-1.5 px-3 rounded-xl bg-white hover:bg-blue-50 text-xs font-semibold text-[#2563EB] border border-blue-200 transition-colors shadow-xs cursor-pointer"
            >
              Fill Customer
            </button>
            <button
              type="button"
              onClick={() => fillDemo('madhavvats@gmail.com', 'admin123')}
              className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-[#101B2D] border border-slate-300 transition-colors shadow-xs cursor-pointer"
            >
              Fill Admin
            </button>
          </div>
        </div>

        {/* Error Message Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#101B2D] uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#101B2D] uppercase tracking-wider">
                Password
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset link has been dispatched to your email address.');
                }}
                className="text-[11px] text-[#2563EB] hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full font-bold shadow-md cursor-pointer"
          >
            <span>Sign In to DriveEase</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <p className="text-center text-xs text-[#64748B]">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#2563EB] hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
