'use client';
import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
  FaLock, FaEnvelope, FaUserPlus, FaSignInAlt, FaStore,
  FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle,
  FaShieldAlt, FaBolt, FaChartLine, FaRocket, FaUserShield
} from 'react-icons/fa';

const HIGHLIGHTS = [
  { icon: <FaChartLine />, title: 'Full platform view',   desc: 'Monitor sellers, orders & activity in one place' },
  { icon: <FaBolt />,      title: 'Instant controls',     desc: 'Approve vendors, manage content, adjust configs' },
  { icon: <FaRocket />,    title: 'Built for scale',      desc: 'Secure, session-based admin access you can trust' },
];

export default function AdminSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const baseURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/signup`;

  const signupAdmin = async () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const data = JSON.stringify({ email, password });
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: baseURL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true, // receive the HTTP-only cookie
      data,
    };

    try {
      const response = await axios.request(config);
      const { message, admin } = response.data;

      setSuccess(message || 'Admin account created! Redirecting…');
      if (admin) localStorage.setItem('admin', JSON.stringify(admin));

      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Signup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT — BRANDING */}
      <aside className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-10 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl" />

        <div className="relative z-10 p-10 xl:p-14 flex flex-col justify-between text-white w-full">
          <Link href="/" className="inline-flex items-center gap-2.5 group w-fit">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-white/30 transition">
              <FaStore className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-lg leading-tight">ECommerce Guider</p>
              <p className="text-[11px] text-teal-100 -mt-0.5">Admin console</p>
            </div>
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-4 backdrop-blur">
              <FaShieldAlt className="text-amber-300 text-xs" />
              <span className="text-xs font-semibold text-amber-100">Authorized personnel only</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black leading-[1.1] tracking-tight">
              Register as admin. <br />
              <span className="italic text-amber-200">Take the wheel.</span>
            </h1>
            <p className="text-teal-50 mt-5 text-base leading-relaxed max-w-md">
              Create an admin account to manage sellers, oversee the platform,
              and keep ECommerce Guider running smoothly.
            </p>

            <div className="mt-10 space-y-4">
              {HIGHLIGHTS.map((h) => (
                <div key={h.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
                    {h.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{h.title}</p>
                    <p className="text-teal-100 text-xs mt-0.5">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10 w-fit">
            <FaShieldAlt className="text-amber-300" />
            <p className="text-xs">Admin actions are logged &amp; audited.</p>
          </div>
        </div>
      </aside>

      {/* RIGHT — FORM */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-slate-50 via-white to-teal-50/40">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-6 w-fit">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md shadow-teal-600/30">
              <FaStore className="text-white text-sm" />
            </div>
            <span className="font-extrabold text-slate-900">ECommerce Guider</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-100 p-6 sm:p-8">

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                  <FaShieldAlt size={9} /> Admin
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30 mb-4">
                <FaUserShield className="text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create admin account
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Register a new administrator for the platform.
              </p>
            </div>

            <div className="space-y-3.5">
              <FormField label="Admin email" icon={<FaEnvelope />}>
                <input
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyDown={(e) => e.key === 'Enter' && signupAdmin()}
                  className="form-input"
                  autoComplete="email"
                />
              </FormField>

              <FormField label="Password" icon={<FaLock />}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyDown={(e) => e.key === 'Enter' && signupAdmin()}
                  className="form-input pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </FormField>

              {error && <AlertBanner type="error" message={error} />}
              {success && <AlertBanner type="success" message={success} />}

              <button
                onClick={signupAdmin}
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3 rounded-xl shadow-md shadow-teal-600/20 transition flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <><FaUserPlus size={13} /> Create admin account</>
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                Admin accounts have elevated privileges. Only create with authorization.
              </p>
            </div>
          </div>

          <p className="text-center text-slate-600 text-sm mt-5">
            Already an admin?{' '}
            <Link
              href="/admin/login"
              className="text-teal-600 font-semibold hover:text-teal-700 hover:underline inline-flex items-center gap-1"
            >
              <FaSignInAlt size={11} /> Admin sign in
            </Link>
          </p>
        </div>
      </main>

      <style jsx global>{`
        .form-input {
          width: 100%;
          padding: 0.7rem 0.9rem 0.7rem 2.5rem;
          border: 1px solid rgb(226 232 240);
          border-radius: 0.625rem;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.15s;
          background: white;
          color: rgb(15 23 42);
        }
        .form-input:focus {
          border-color: rgb(20 184 166);
          box-shadow: 0 0 0 3px rgb(20 184 166 / 0.15);
        }
        .form-input::placeholder { color: rgb(148 163 184); }
      `}</style>
    </div>
  );
}

function FormField({ label, icon, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

function AlertBanner({ type, message }) {
  const styles = type === 'error'
    ? 'bg-red-50 border-red-200 text-red-700'
    : 'bg-emerald-50 border-emerald-200 text-emerald-700';
  const icon = type === 'error' ? <FaExclamationCircle /> : <FaCheckCircle />;
  return (
    <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium ${styles}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{message}</span>
    </div>
  );
}