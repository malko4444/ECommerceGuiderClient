'use client';
import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
  FaUser, FaLock, FaSignInAlt, FaUserPlus, FaStore,
  FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle,
  FaShieldAlt, FaBolt, FaChartLine, FaRocket
} from 'react-icons/fa';

const HIGHLIGHTS = [
  { icon: <FaBolt />,      title: 'Pick up where you left off', desc: 'Your roadmaps, budgets & plans are saved' },
  { icon: <FaChartLine />, title: 'Track your progress',        desc: 'See how your numbers evolve over time' },
  { icon: <FaRocket />,    title: 'Launch tools ready',         desc: 'Platform checklists for Daraz, Shopify & more' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const baseURL = 'http://localhost:4000/auth/login';

  const loginUser = async () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(baseURL, { email, password });
      const { message, token, user } = response.data;

      setSuccess(message || 'Login successful! Redirecting…');

      // Store auth data
      localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      if (remember) localStorage.setItem('rememberEmail', email);
      else localStorage.removeItem('rememberEmail');

      setTimeout(() => {
        window.location.href = '/home';
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials.'
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

  // Prefill remembered email on first load
  React.useEffect(() => {
    const saved = localStorage.getItem('rememberEmail');
    if (saved) setEmail(saved);
  }, []);

  return (
    <div className="min-h-screen flex">

      {/* ═══════════════════════════════════════ */}
      {/* LEFT — BRANDING PANEL (desktop only) */}
      {/* ═══════════════════════════════════════ */}
      <aside className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-10 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl" />

        <div className="relative z-10 p-10 xl:p-14 flex flex-col justify-between text-white w-full">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group w-fit">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-white/30 transition">
              <FaStore className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-lg leading-tight">ECommerce Guider</p>
              <p className="text-[11px] text-teal-100 -mt-0.5">Pakistan&apos;s AI seller coach</p>
            </div>
          </Link>

          {/* Pitch */}
          <div>
            <h1 className="text-4xl xl:text-5xl font-black leading-[1.1] tracking-tight">
              Welcome back. <br />
              <span className="italic text-amber-200">Let&apos;s keep building.</span>
            </h1>
            <p className="text-teal-50 mt-5 text-base leading-relaxed max-w-md">
              Your plans, budgets, and checklists are waiting. Pick up where you left off
              and keep growing your online business in Pakistan.
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

          {/* Trust */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10 w-fit">
            <FaShieldAlt className="text-amber-300" />
            <p className="text-xs">Sessions are encrypted &amp; expire automatically.</p>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════ */}
      {/* RIGHT — FORM */}
      {/* ═══════════════════════════════════════ */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-slate-50 via-white to-teal-50/40">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-6 w-fit">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md shadow-teal-600/30">
              <FaStore className="text-white text-sm" />
            </div>
            <span className="font-extrabold text-slate-900">ECommerce Guider</span>
          </Link>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-100 p-6 sm:p-8">

            {/* Header */}
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30 mb-4">
                <FaSignInAlt className="text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            {/* Fields */}
            <div className="space-y-3.5">
              <FormField label="Email" icon={<FaUser />}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyDown={(e) => e.key === 'Enter' && loginUser()}
                  className="form-input"
                  autoComplete="email"
                />
              </FormField>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-teal-600 hover:text-teal-700 hover:underline font-semibold"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyDown={(e) => e.key === 'Enter' && loginUser()}
                    className="form-input pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-sm text-slate-600">Remember my email</span>
              </label>

              {error && <AlertBanner type="error" message={error} />}
              {success && <AlertBanner type="success" message={success} />}

              <button
                onClick={loginUser}
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3 rounded-xl shadow-md shadow-teal-600/20 transition flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <><FaSignInAlt size={13} /> Sign in</>
                )}
              </button>
            </div>
          </div>

          {/* Footer link */}
          <p className="text-center text-slate-600 text-sm mt-5">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-teal-600 font-semibold hover:text-teal-700 hover:underline inline-flex items-center gap-1"
            >
              <FaUserPlus size={11} /> Create one
            </Link>
          </p>
        </div>
      </main>

      {/* Shared input styles */}
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

// ═══════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════

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
  const icon = type === 'error'
    ? <FaExclamationCircle />
    : <FaCheckCircle />;
  return (
    <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium ${styles}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{message}</span>
    </div>
  );
}