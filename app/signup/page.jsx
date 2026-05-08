'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  FaUser, FaLock, FaEnvelope, FaCalendarAlt, FaVenusMars,
  FaKey, FaUserPlus, FaSignInAlt, FaStore, FaEye, FaEyeSlash,
  FaArrowLeft, FaCheckCircle, FaExclamationCircle,
  FaShieldAlt, FaBolt, FaRocket, FaChartLine
} from 'react-icons/fa';
import OtpInput from '../component/OtpInput';

const HIGHLIGHTS = [
  { icon: <FaBolt />,       title: '10 AI tools',       desc: 'Roadmap, budget, profit, competitor scan — all in one' },
  { icon: <FaChartLine />,  title: 'Pakistan-native',   desc: 'PKR currency, Daraz + Shopify, EasyPaisa & JazzCash' },
  { icon: <FaRocket />,     title: 'Launch faster',     desc: 'Step-by-step checklists for every platform' },
];

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    gender: '', dob: '', otp: '',
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Step 1 — send OTP
  const sendOtp = async () => {
    const { name, email, password, gender, dob } = formData;
    if (!name || !email || !password || !gender || !dob) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:4000/auth/otpGenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        localStorage.setItem('signupData', JSON.stringify({ name, email, password, gender, dob }));
        setSuccess(`Verification code sent to ${email}`);
        setStep(2);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify + signup
  const verifyOtpAndSignup = async () => {
    if (!formData.otp || formData.otp.length < 4) {
      setError('Please enter the verification code.');
      return;
    }
    const savedData = JSON.parse(localStorage.getItem('signupData'));
    if (!savedData) {
      setError('Session expired. Please start over.');
      setStep(1);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:4000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...savedData, otp: formData.otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Account created! Redirecting…');
        localStorage.removeItem('signupData');
        setTimeout(() => { window.location.href = '/login'; }, 1200);
      } else {
        setError(data.error || 'Signup failed.');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
    setSuccess('');
    setFormData({ ...formData, otp: '' });
  };

  const resendOtp = async () => {
    setError('');
    await sendOtp();
  };

  return (
    <div className="min-h-screen flex">

      {/* ═══════════════════════════════════════ */}
      {/* LEFT — BRANDING PANEL (desktop only) */}
      {/* ═══════════════════════════════════════ */}
      <aside className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 relative overflow-hidden">
        {/* Decorative */}
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
              Start your online business <br />
              <span className="italic text-amber-200">the smart way.</span>
            </h1>
            <p className="text-teal-50 mt-5 text-base leading-relaxed max-w-md">
              Join Pakistani sellers using AI to plan roadmaps, allocate budgets,
              and launch on Daraz, Shopify, Instagram, and beyond.
            </p>

            {/* Highlights */}
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

          {/* Bottom — trust indicator */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10 w-fit">
            <FaShieldAlt className="text-amber-300" />
            <p className="text-xs">Your data is encrypted &amp; never shared.</p>
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

          {/* ─── Stepper ─── */}
          <div className="flex items-center gap-2 mb-5">
            <StepDot active filled={step >= 1} label="Details" />
            <div className={`flex-1 h-0.5 rounded-full ${step >= 2 ? 'bg-teal-500' : 'bg-slate-200'}`} />
            <StepDot active={step >= 2} filled={step >= 2} label="Verify" />
          </div>

          {/* ─── Form card ─── */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-100 p-6 sm:p-8">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {step === 1 ? 'Create your account' : 'Verify your email'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {step === 1
                    ? 'Start selling in Pakistan with AI on your side.'
                    : `We sent a 6-digit code to ${formData.email}`}
                </p>
              </div>
              {step === 2 && (
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition shrink-0"
                  title="Back"
                >
                  <FaArrowLeft size={13} />
                </button>
              )}
            </div>

            {/* ═══ STEP 1 — DETAILS ═══ */}
            {step === 1 && (
              <div className="space-y-3.5">
                <FormField label="Full name" icon={<FaUser />}>
                  <input
                    type="text" name="name" placeholder="e.g. Ahmed Khan"
                    value={formData.name} onChange={handleChange}
                    className="form-input"
                  />
                </FormField>

                <FormField label="Email" icon={<FaEnvelope />}>
                  <input
                    type="email" name="email" placeholder="you@example.com"
                    value={formData.email} onChange={handleChange}
                    className="form-input"
                  />
                </FormField>

                <FormField label="Password" icon={<FaLock />}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" placeholder="At least 6 characters"
                    value={formData.password} onChange={handleChange}
                    className="form-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Gender" icon={<FaVenusMars />}>
                    <select
                      name="gender" value={formData.gender} onChange={handleChange}
                      className="form-input appearance-none bg-white cursor-pointer"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </FormField>

                  <FormField label="Date of Birth" icon={<FaCalendarAlt />}>
                    <input
                      type="date" name="dob"
                      value={formData.dob} onChange={handleChange}
                      className="form-input"
                    />
                  </FormField>
                </div>

                {error && <AlertBanner type="error" message={error} />}
                {success && <AlertBanner type="success" message={success} />}

                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3 rounded-xl shadow-md shadow-teal-600/20 transition flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending code…
                    </>
                  ) : (
                    <><FaKey size={13} /> Send verification code</>
                  )}
                </button>

                <p className="text-[11px] text-slate-500 text-center">
                  By signing up, you agree to our Terms and Privacy Policy.
                </p>
              </div>
            )}

            {/* ═══ STEP 2 — OTP ═══ */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                    <FaShieldAlt />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-teal-800">Check your inbox</p>
                    <p className="text-xs text-teal-700 mt-0.5">
                      The code expires in 10 minutes. Check spam if you don&apos;t see it.
                    </p>
                  </div>
                </div>

                <OtpInput
                  otp={formData.otp || ''}
                  setOtp={(val) => setFormData({ ...formData, otp: val })}
                />

                {error && <AlertBanner type="error" message={error} />}
                {success && <AlertBanner type="success" message={success} />}

                <button
                  onClick={verifyOtpAndSignup}
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-md shadow-teal-600/20 transition flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <><FaUserPlus size={13} /> Create account</>
                  )}
                </button>

                <p className="text-xs text-center text-slate-500">
                  Didn&apos;t get the code?{' '}
                  <button
                    onClick={resendOtp}
                    disabled={loading}
                    className="text-teal-600 font-semibold hover:underline disabled:opacity-60"
                  >
                    Resend
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* ─── Footer ─── */}
          {step === 1 && (
            <p className="text-center text-slate-600 text-sm mt-5">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-teal-600 font-semibold hover:text-teal-700 hover:underline inline-flex items-center gap-1"
              >
                <FaSignInAlt size={11} /> Sign in
              </Link>
            </p>
          )}
        </div>
      </main>

      {/* Shared input styling */}
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

function StepDot({ active, filled, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`
        w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition
        ${filled
          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
          : active
            ? 'bg-teal-100 text-teal-700 border-2 border-teal-500'
            : 'bg-slate-100 text-slate-400'}
      `}>
        {filled ? <FaCheckCircle size={11} /> : (label === 'Details' ? '1' : '2')}
      </div>
      <span className={`text-xs font-semibold hidden sm:inline ${active ? 'text-slate-900' : 'text-slate-400'}`}>
        {label}
      </span>
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