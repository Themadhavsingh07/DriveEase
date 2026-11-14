import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Car, Lock, Mail, User, Phone, FileBadge, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) return;
    setErrorMsg('');

    try {
      await register({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        phone,
        drivingLicenseNumber: license,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-[#E2E8F0] shadow-xl">
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
            Create an Account
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Join DriveEase for transparent car bookings, rapid airport dispatch, and trip management.
          </p>
        </div>

        {/* Error Message Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#101B2D] uppercase tracking-wider block mb-1">
                First Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Rohan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#101B2D] uppercase tracking-wider block mb-1">
                Last Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Mehta"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#101B2D] uppercase tracking-wider block mb-1">
              Email Address *
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
            <label className="font-bold text-[#101B2D] uppercase tracking-wider block mb-1">
              Password * (Min 8 chars, 1 uppercase, 1 lowercase, 1 number)
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#101B2D] uppercase tracking-wider block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#101B2D] uppercase tracking-wider block mb-1">
                Driver's License (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="DL-MH01-2022-XXXX"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#2563EB] font-mono"
                />
                <FileBadge className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full font-bold shadow-md mt-2 cursor-pointer"
          >
            <span>Complete Registration</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <p className="text-center text-xs text-[#64748B]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#2563EB] hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
