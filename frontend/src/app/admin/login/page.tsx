'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import {
  Car,
  Lock,
  Mail,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, login, demoLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in as ADMIN, redirect immediately
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      router.replace('/admin/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both administrative email and master password.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role !== 'ADMIN') {
        setErrorMsg('Access Restricted: This account does not possess administrative privileges.');
        return;
      }
      router.replace('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAdmin = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      await demoLogin('admin');
      router.replace('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo admin authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-amber-500/20 selection:text-amber-400">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-amber-500/20 group-hover:scale-105 transition">
              <Car className="w-6 h-6 text-slate-950" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                Drive<span className="text-amber-400">Ease</span>
              </span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-1">
                Enterprise Operations
              </span>
            </div>
          </Link>
          <h1 className="text-xl font-black text-white tracking-tight">Admin Portal Gateway</h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Restricted access: Enterprise fleet management & financial governance.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-[#0F172A]/90 border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@driveease.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Master Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-500 hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{submitting ? 'Verifying Credentials...' : 'Sign In to Admin Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDemoAdmin}
              disabled={submitting || isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 text-amber-400 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>One-Click Demo Admin Sign-In</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-2">
              Autofills & logs in as <code className="text-slate-400">admin@driveease.com</code>
            </p>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-2 mt-6 text-slate-500 text-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500/70" />
          <span>Secured with TLS 1.3 & Role-Based Token Rotation</span>
        </div>
      </div>
    </div>
  );
}
