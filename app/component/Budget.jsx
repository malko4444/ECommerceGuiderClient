'use client';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaMoneyBillWave, FaSearchDollar, FaLightbulb,
  FaExclamationCircle, FaRedo, FaCoins, FaHistory,
  FaArrowRight, FaRoad, FaMapMarkerAlt, FaStore, FaUserGraduate
} from 'react-icons/fa';

const TIERS = [
  { min: 1,      max: 4999,    label: 'Micro',  tone: 'bg-slate-100 text-slate-700 border-slate-200',   note: 'Digital products or dropshipping' },
  { min: 5000,   max: 24999,   label: 'Small',  tone: 'bg-sky-50    text-sky-700    border-sky-200',    note: '1 product, minimal stock' },
  { min: 25000,  max: 99999,   label: 'Medium', tone: 'bg-purple-50 text-purple-700 border-purple-200', note: 'Proper inventory approach' },
  { min: 100000, max: Infinity,label: 'Large',  tone: 'bg-teal-50   text-teal-700   border-teal-200',   note: 'Multi-product with branding' },
];

const PRESETS = [
  { amount: 5000,   label: 'PKR 5K' },
  { amount: 15000,  label: 'PKR 15K' },
  { amount: 50000,  label: 'PKR 50K' },
  { amount: 100000, label: 'PKR 1 Lakh' },
  { amount: 250000, label: 'PKR 2.5 Lakh' },
];

const formatPKR = (n) => {
  const num = Number(n);
  if (!num || isNaN(num)) return '';
  return num.toLocaleString('en-PK');
};

const getTier = (amount) => {
  const num = Number(amount);
  if (!num || isNaN(num) || num <= 0) return null;
  return TIERS.find(t => num >= t.min && num <= t.max) || null;
};

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Budget() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();
  const search = useSearchParams();

  // Roadmap context — read from query params if user came from a roadmap task.
  const ctx = {
    productType: search.get('productType') || '',
    roadmapId: search.get('roadmapId') || '',
    city: search.get('city') || '',
    platform: search.get('platform') || '',
    experience: search.get('experience') || '',
    budgetFromUrl: search.get('budget') || '',
  };
  const hasRoadmapCtx = Boolean(ctx.roadmapId);

  const [budgetInput, setBudgetInput] = useState(ctx.budgetFromUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const liveTier = useMemo(() => getTier(budgetInput), [budgetInput]);

  // If we arrived with full context AND a budget, auto-run once.
  useEffect(() => {
    if (hasRoadmapCtx && ctx.budgetFromUrl && Number(ctx.budgetFromUrl) > 0) {
      generate(ctx.budgetFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async (override) => {
    const value = (override ?? budgetInput).toString().trim();
    if (!value) return;
    if (override !== undefined) setBudgetInput(String(override));

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${API}/api/budget`,
        {
          budget: Number(value),
          productType: ctx.productType,
          roadmapId: ctx.roadmapId || undefined,
          city: ctx.city,
          platform: ctx.platform,
          experience: ctx.experience,
        },
        { headers: { 'Content-Type': 'application/json', ...authHeader() } }
      );

      const id = res.data?.budget?._id;
      if (!id) throw new Error('No budget returned');
      router.push(`/budget/${id}`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to generate budget. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setBudgetInput(value);
  };

  return (
    <section className="max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30">
            <FaMoneyBillWave className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Budget Planner
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Get a smart, Pakistan-specific PKR allocation you can save and track.
            </p>
          </div>
        </div>
        <Link
          href="/budget/history"
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <FaHistory size={11} /> My Budgets
        </Link>
      </div>

      {/* ROADMAP CONTEXT BANNER */}
      {hasRoadmapCtx && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <FaRoad />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
              From your roadmap
            </p>
            <p className="text-sm text-slate-700 font-semibold">
              Planning budget for <span className="text-teal-700">{ctx.productType || 'your business'}</span>
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ctx.city && <CtxChip icon={<FaMapMarkerAlt />} label={ctx.city} />}
              {ctx.platform && <CtxChip icon={<FaStore />} label={ctx.platform} />}
              {ctx.experience && <CtxChip icon={<FaUserGraduate />} label={ctx.experience.replace(/_/g, ' ')} />}
            </div>
          </div>
          <Link
            href={`/roadmap/${ctx.roadmapId}`}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 shrink-0"
          >
            Back to roadmap <FaArrowRight size={9} />
          </Link>
        </div>
      )}

      {/* INPUT CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 mb-6">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Starting capital (PKR)
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm pointer-events-none">PKR</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={budgetInput}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              className="w-full pl-14 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40 outline-none transition font-semibold text-slate-900 text-base"
            />
            {budgetInput && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hidden sm:inline">
                {formatPKR(budgetInput)}
              </span>
            )}
          </div>
          <button
            onClick={() => generate()}
            disabled={loading || !budgetInput.trim()}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" /> Generating...</>
            ) : (
              <><FaSearchDollar size={13} /> Generate Plan</>
            )}
          </button>
        </div>

        {liveTier && (
          <div className={`mt-3 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${liveTier.tone}`}>
            <FaCoins size={10} />
            {liveTier.label} budget · {liveTier.note}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 mr-1">
            <FaLightbulb className="text-amber-500" /> Quick pick:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.amount}
              onClick={() => generate(preset.amount)}
              disabled={loading}
              className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full border border-teal-200 transition disabled:opacity-60 font-semibold"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
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
            Calculating your tailored budget breakdown...
          </p>
        </div>
      )}

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

      {/* EMPTY STATE */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto mb-3">
            <FaMoneyBillWave className="text-teal-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">Plan smart, start lean</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Enter an amount above. We will save your budget so you can come back and track spending later.
          </p>
          <Link href="/budget/history" className="inline-flex items-center gap-2 mt-4 text-teal-700 hover:text-teal-800 text-sm font-semibold transition">
            View saved budgets <FaArrowRight size={10} />
          </Link>
        </div>
      )}
    </section>
  );
}

function CtxChip({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-teal-700 border border-teal-200">
      <span className="text-teal-500 text-[10px]">{icon}</span>
      {label}
    </span>
  );
}
