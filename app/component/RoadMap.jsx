'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaRoad, FaSearch, FaLightbulb, FaExclamationCircle,
  FaRedo, FaHistory, FaArrowRight, FaMapMarkerAlt,
  FaMoneyBillWave, FaUserGraduate, FaStore
} from 'react-icons/fa';

const EXAMPLES = [
  "Women's clothing", "Mobile accessories", "Skincare products",
  "Handmade jewelry", "Home decor",
];

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Other"];
const PLATFORMS = ["Daraz", "Shopify", "Instagram", "Facebook", "TikTok", "WhatsApp Business", "Multiple"];
const EXPERIENCE = [
  { id: "first_time",  label: "First time selling online" },
  { id: "sold_before", label: "Sold online before" },
  { id: "brand_owner", label: "I have an existing brand" },
];

export default function RoadMap() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  const [inputType, setInputType] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [budget, setBudget] = useState('');
  const [city, setCity] = useState('');
  const [experience, setExperience] = useState('');
  const [platform, setPlatform] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async (override) => {
    const value = (override ?? inputType).trim();
    if (!value) {
      setError('Please enter a product or business type.');
      return;
    }
    if (override) setInputType(override);

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API}/api/roadmap`,
        {
          type: value,
          inputs: {
            budget: budget ? Number(budget) : 0,
            city: city || '',
            experience: experience || '',
            platform: platform || '',
            hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : 0,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      const id = res.data?.roadmap?._id;
      if (!id) throw new Error('No roadmap returned');
      router.push(`/roadmap/${id}`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to generate roadmap. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto">
      {/* HEADER + CTA TO HISTORY */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30">
            <FaRoad className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Startup Roadmap Generator
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Get a phase-by-phase, interactive launch plan you can save and check off.
            </p>
          </div>
        </div>
        <Link
          href="/roadmap/history"
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <FaHistory size={11} /> My Roadmaps
        </Link>
      </div>

      {/* MAIN INPUT CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 mb-4">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          What do you want to sell?
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="e.g. women clothing, home decor, skincare..."
              value={inputType}
              onChange={(e) => setInputType(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40 outline-none transition"
            />
          </div>
          <button
            onClick={() => generate()}
            disabled={loading || !inputType.trim()}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" /> Generating...</>
            ) : (
              <><FaSearch size={12} /> Generate</>
            )}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 mr-1">
            <FaLightbulb className="text-amber-500" /> Try:
          </span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => generate(ex)}
              disabled={loading}
              className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full border border-teal-200 transition disabled:opacity-60"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* WIZARD TOGGLE */}
        <button
          onClick={() => setShowWizard((v) => !v)}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 transition"
        >
          {showWizard ? '— Hide personalization' : '+ Personalize this roadmap (recommended)'}
        </button>

        {showWizard && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={<FaMoneyBillWave />} label="Starting budget (PKR)">
              <input
                type="number" min="0" placeholder="e.g. 50000"
                value={budget} onChange={(e) => setBudget(e.target.value)}
                className="rm-input"
              />
            </Field>
            <Field icon={<FaMapMarkerAlt />} label="City">
              <select value={city} onChange={(e) => setCity(e.target.value)} className="rm-input bg-white">
                <option value="">Select your city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field icon={<FaUserGraduate />} label="Experience level">
              <select value={experience} onChange={(e) => setExperience(e.target.value)} className="rm-input bg-white">
                <option value="">Select experience</option>
                {EXPERIENCE.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </Field>
            <Field icon={<FaStore />} label="Preferred platform">
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="rm-input bg-white">
                <option value="">Select platform</option>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Hours per week you can spend">
              <input
                type="number" min="0" max="80" placeholder="e.g. 20"
                value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)}
                className="rm-input"
              />
            </Field>
            <p className="text-[12px] text-slate-500 self-end pb-2">
              The more you tell us, the more tailored your roadmap.
            </p>
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <FaExclamationCircle />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800">Something went wrong</p>
            <p className="text-red-700 text-sm mt-0.5">{error}</p>
            <button
              onClick={() => generate()}
              className="mt-2 text-red-700 hover:text-red-900 text-sm font-semibold flex items-center gap-1.5"
            >
              <FaRedo size={11} /> Try again
            </button>
          </div>
        </div>
      )}

      {/* LOADING SKELETON */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/5 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 mb-4 animate-pulse">
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-4/5 bg-slate-100 rounded" />
            </div>
          ))}
          <p className="text-teal-600 text-sm font-semibold mt-4 flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            Crafting your roadmap... we will redirect you in a few seconds.
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center mt-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto mb-3">
            <FaRoad className="text-teal-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">Ready when you are</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Enter a product or business type above. We will save your roadmap so you can come back any time.
          </p>
          <Link href="/roadmap/history" className="inline-flex items-center gap-2 mt-4 text-teal-700 hover:text-teal-800 text-sm font-semibold transition">
            View saved roadmaps <FaArrowRight size={10} />
          </Link>
        </div>
      )}

      <style jsx>{`
        .rm-input {
          width: 100%;
          border: 1px solid rgb(226 232 240);
          padding: 0.625rem 0.75rem;
          border-radius: 0.5rem;
          outline: none;
          transition: all 0.15s;
          font-size: 0.875rem;
          background: white;
        }
        .rm-input:focus {
          border-color: rgb(20 184 166);
          box-shadow: 0 0 0 2px rgb(20 184 166 / 0.25);
        }
      `}</style>
    </section>
  );
}

function Field({ icon, label, children }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        {icon && <span className="text-teal-600 text-xs">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}
