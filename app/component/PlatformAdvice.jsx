'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaSearch, FaLightbulb, FaExclamationCircle, FaRedo,
  FaShopify, FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp,
  FaStore, FaCompass, FaTrophy, FaArrowRight, FaCheckCircle,
  FaCoins, FaUserFriends, FaBolt, FaRoad, FaListUl, FaCheck
} from 'react-icons/fa';

const GOAL_SUGGESTIONS = [
  'Sell handmade jewelry',
  'Dropship phone accessories',
  'Launch a clothing brand',
  'Start a skincare line',
  'Sell home-cooked food',
];

// Map canonical platform keys → icon + colors. Frontend-only.
const PLATFORM_VISUAL = {
  daraz:     { icon: <FaStore />,     color: 'text-orange-600',   bg: 'bg-orange-50',   border: 'border-orange-200' },
  shopify:   { icon: <FaShopify />,   color: 'text-emerald-600',  bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  instagram: { icon: <FaInstagram />, color: 'text-pink-600',     bg: 'bg-pink-50',     border: 'border-pink-200' },
  facebook:  { icon: <FaFacebookF />, color: 'text-blue-600',     bg: 'bg-blue-50',     border: 'border-blue-200' },
  tiktok:    { icon: <FaTiktok />,    color: 'text-slate-900',    bg: 'bg-slate-50',    border: 'border-slate-200' },
  whatsapp:  { icon: <FaWhatsapp />,  color: 'text-green-600',    bg: 'bg-green-50',    border: 'border-green-200' },
  olx:       { icon: <FaStore />,     color: 'text-emerald-600',  bg: 'bg-emerald-50',  border: 'border-emerald-200' },
};
const visualFor = (key) => PLATFORM_VISUAL[key] || PLATFORM_VISUAL.daraz;

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function PlatformAdvice() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const router = useRouter();
  const search = useSearchParams();

  const ctxRoadmapId = search.get('roadmapId') || '';
  const ctxGoal = search.get('goal') || search.get('productType') || '';

  const [goal, setGoal] = useState(ctxGoal);
  const [pick, setPick] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applyState, setApplyState] = useState({}); // {platformKey: 'idle'|'saving'|'done'}

  useEffect(() => {
    if (ctxGoal && ctxGoal.trim().length >= 2) {
      fetchAdvice(ctxGoal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdvice = async (override) => {
    const value = (override ?? goal).trim();
    if (!value) return;
    if (override !== undefined) setGoal(value);
    setLoading(true);
    setError('');
    setPick(null);
    try {
      const res = await axios.post(
        `${API}/api/platform`,
        { goal: value, roadmapId: ctxRoadmapId || undefined },
        { headers: { 'Content-Type': 'application/json', ...authHeader() } }
      );
      setPick(res.data?.pick || null);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) { router.push('/login'); return; }
      setError(err.response?.data?.error || 'Failed to generate advice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyToRoadmap = async (platformKey) => {
    if (!pick?._id || !ctxRoadmapId) return;
    setApplyState((s) => ({ ...s, [platformKey]: 'saving' }));
    try {
      await axios.post(
        `${API}/api/platform-picks/${pick._id}/apply`,
        { platform: platformKey, roadmapId: ctxRoadmapId },
        { headers: { 'Content-Type': 'application/json', ...authHeader() } }
      );
      setApplyState((s) => ({ ...s, [platformKey]: 'done' }));
    } catch (err) {
      console.error(err);
      setApplyState((s) => ({ ...s, [platformKey]: 'idle' }));
      alert(err.response?.data?.error || 'Failed to apply.');
    }
  };

  return (
    <section className="max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30">
          <FaCompass className="text-white text-lg" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Platform Advisor
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Tell us what you want to sell — we recommend the best Pakistani selling platform with real fees and first steps.
          </p>
        </div>
      </div>

      {ctxRoadmapId && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <FaRoad />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">From your roadmap</p>
            <p className="text-sm text-slate-700">Picking the best platform for {ctxGoal || 'your business'}.</p>
          </div>
          <Link href={`/roadmap/${ctxRoadmapId}`} className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 shrink-0">
            Back to roadmap
          </Link>
        </div>
      )}

      {/* INPUT */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 mb-6">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="e.g. sell handmade jewelry, build a clothing brand..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAdvice()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40 outline-none transition"
            />
          </div>
          <button
            onClick={() => fetchAdvice()}
            disabled={loading || !goal.trim()}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" /> Analysing...</>
            ) : (
              <><FaSearch size={13} /> Get Advice</>
            )}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 mr-1">
            <FaLightbulb className="text-amber-500" /> Try:
          </span>
          {GOAL_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => fetchAdvice(s)}
              disabled={loading}
              className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full border border-teal-200 transition disabled:opacity-60 font-semibold"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {loading && <Skeleton />}

      {/* ERROR */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <FaExclamationCircle />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800">Something went wrong</p>
            <p className="text-red-700 text-sm mt-0.5">{error}</p>
            <button onClick={() => fetchAdvice()} className="mt-2 text-red-700 hover:text-red-900 text-sm font-semibold flex items-center gap-1.5">
              <FaRedo size={11} /> Try again
            </button>
          </div>
        </div>
      )}

      {/* RESULT */}
      {!loading && !error && pick && (
        <div className="space-y-5">
          {/* SUMMARY */}
          {pick.summary && (
            <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-2xl p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <FaCompass />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 mb-1">
                  AI summary
                </p>
                <p className="text-slate-700 text-sm leading-relaxed">{pick.summary}</p>
              </div>
            </div>
          )}

          {/* TOP RECOMMENDATION */}
          {pick.top && (
            <PlatformCard
              opt={pick.top}
              isTop
              onApply={ctxRoadmapId ? () => applyToRoadmap(pick.top.platform) : null}
              applyState={applyState[pick.top.platform]}
              roadmapId={ctxRoadmapId}
            />
          )}

          {/* ALTERNATIVES */}
          {Array.isArray(pick.alternatives) && pick.alternatives.length > 0 && (
            <>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mt-7 mb-3 flex items-center gap-2">
                <FaListUl /> Alternatives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pick.alternatives.map((alt) => (
                  <PlatformCard
                    key={alt.platform}
                    opt={alt}
                    onApply={ctxRoadmapId ? () => applyToRoadmap(alt.platform) : null}
                    applyState={applyState[alt.platform]}
                    roadmapId={ctxRoadmapId}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* INITIAL EMPTY */}
      {!loading && !error && !pick && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto mb-3">
            <FaCompass className="text-teal-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">Where should you sell?</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Describe your goal and we will recommend the best Pakistani platform with real fees and a first step.
          </p>
        </div>
      )}
    </section>
  );
}

// ============================================================
// PLATFORM CARD — used for both top + alternatives
// ============================================================
function PlatformCard({ opt, isTop, onApply, applyState, roadmapId }) {
  const v = visualFor(opt.platform);
  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isTop ? 'border-teal-300 shadow-teal-200/40' : 'border-slate-100'}`}>
      <div className={`h-1.5 bg-gradient-to-r ${isTop ? 'from-teal-400 via-teal-500 to-emerald-500' : 'from-slate-200 to-slate-300'}`} />
      <div className="p-5 sm:p-6">

        <div className="flex items-start gap-4 flex-wrap">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${v.bg} ${v.color} shrink-0 border ${v.border}`}>
            {v.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{opt.name}</h3>
              {isTop && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                  <FaTrophy size={9} /> Top pick
                </span>
              )}
            </div>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">{opt.reason}</p>
          </div>
          <div className="text-right shrink-0">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-base ${
              isTop ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700'
            }`}>
              {opt.score}
            </div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1 font-semibold">match</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
          {opt.fees && (
            <Stat icon={<FaCoins />} label="Fees" value={opt.fees} tone="emerald" />
          )}
          {opt.setupEase && (
            <Stat icon={<FaBolt />} label="Setup" value={opt.setupEase} tone="amber" />
          )}
          {opt.bestFor && (
            <Stat icon={<FaUserFriends />} label="Best for" value={opt.bestFor} tone="purple" />
          )}
        </div>

        {/* First step */}
        {opt.firstStep && (
          <div className="mt-5 bg-teal-50 border border-teal-100 rounded-xl p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 mb-1 flex items-center gap-1.5">
              <FaCheckCircle size={11} /> Your first step today
            </p>
            <p className="text-sm text-slate-800 leading-relaxed">{opt.firstStep}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/guide?platform=${opt.platform}${roadmapId ? `&roadmapId=${roadmapId}` : ''}`}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition"
          >
            Get launch guide <FaArrowRight size={10} />
          </Link>
          {onApply && (
            <button
              onClick={onApply}
              disabled={applyState === 'saving' || applyState === 'done'}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border transition ${
                applyState === 'done'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border-slate-200 hover:border-teal-200'
              } disabled:cursor-not-allowed`}
            >
              {applyState === 'saving' && (
                <><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> Saving...</>
              )}
              {applyState === 'done' && (<><FaCheck size={10} /> Applied to roadmap</>)}
              {(!applyState || applyState === 'idle') && (<>Use for my roadmap</>)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tone }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber:   'bg-amber-50   text-amber-700',
    purple:  'bg-purple-50  text-purple-700',
  };
  return (
    <div className={`rounded-xl p-3 border border-slate-100 ${tones[tone] || tones.emerald}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1 mb-1">{icon} {label}</p>
      <p className="text-xs font-semibold leading-snug">{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-32 animate-pulse" />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-48 animate-pulse" />
    </div>
  );
}
