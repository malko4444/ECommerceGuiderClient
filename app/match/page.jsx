'use client';
import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaArrowLeft, FaArrowRight, FaMagic, FaSearch, FaShieldAlt,
  FaMapMarkerAlt, FaBriefcase, FaTags, FaCopy, FaCheck,
  FaWhatsapp, FaPaperPlane, FaExclamationTriangle
} from 'react-icons/fa';
import { FaWandMagicSparkles } from 'react-icons/fa6';

const CATEGORY_STYLES = {
  "Home Decor":    "bg-amber-50  text-amber-700  border-amber-200",
  "Electronics":   "bg-sky-50    text-sky-700    border-sky-200",
  "IT Services":   "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Clothing":      "bg-pink-50   text-pink-700   border-pink-200",
  "Food Supplier": "bg-orange-50 text-orange-700 border-orange-200",
  "Construction":  "bg-stone-100 text-stone-700  border-stone-200",
  "Marketing":     "bg-purple-50 text-purple-700 border-purple-200",
  "Other":         "bg-slate-50  text-slate-700  border-slate-200",
};

const buildWhatsAppLink = (raw, msg = '') => {
  if (!raw) return '';
  let num = String(raw).replace(/[^\d]/g, '');
  if (num.startsWith('0')) num = '92' + num.slice(1);
  return `https://wa.me/${num}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
};

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const SAMPLE_QUERIES = [
  "I need eco-friendly packaging suppliers in Lahore, budget around PKR 50,000/month",
  "Looking for wholesale clothing vendors in Karachi for women's fashion",
  "Need a food supplier for organic snacks, can deliver to Islamabad",
  "Find me marketing agencies for Instagram ads, Pakistan-based",
];

export default function MatchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const runMatch = async (searchQuery) => {
    const q = (searchQuery ?? query).trim();
    if (q.length < 8) {
      setError('Please describe what you need (at least 8 characters).');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setResult(null);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/match`,
        { query: q },
        { withCredentials: true, headers: authHeader() }
      );
      setResult(res.data);
      if (searchQuery) setQuery(searchQuery);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) { router.push('/login'); return; }
      setError(err.response?.data?.error || 'Match failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyDraft = async () => {
    if (!result?.draftMessage) return;
    try {
      await navigator.clipboard.writeText(result.draftMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-12 px-4">
      <div className="max-w-5xl mx-auto">

        <Link href="/vendors" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 text-sm font-medium mb-6 transition">
          <FaArrowLeft size={11} /> Back to all vendors
        </Link>

        {/* HEADER */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <FaWandMagicSparkles className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              AI Vendor Matchmaker
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Describe what you need in plain English. We will find the best vendors and write your outreach message.
            </p>
          </div>
        </div>

        {/* SEARCH CARD */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            What are you looking for?
          </label>
          <textarea
            rows={3}
            value={query}
            maxLength={1000}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. I need eco-friendly packaging suppliers in Lahore, budget around 50k PKR per month. Bulk orders, fast delivery."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition resize-none"
          />
          <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
            <p className="text-[11px] text-slate-400">{query.length}/1000</p>
            <button
              onClick={() => runMatch()}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md shadow-teal-600/20 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  Matching...
                </>
              ) : (
                <>
                  <FaMagic size={13} /> Find My Vendors
                </>
              )}
            </button>
          </div>

          {/* Sample queries */}
          {!result && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Try an example
              </p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUERIES.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuery(s); runMatch(s); }}
                    disabled={loading}
                    className="text-[12px] text-slate-600 hover:text-teal-700 bg-slate-50 hover:bg-teal-50 px-3 py-1.5 rounded-full border border-slate-200 hover:border-teal-200 transition disabled:opacity-60"
                  >
                    {s.length > 70 ? s.slice(0, 70) + '...' : s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium flex items-center gap-2">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div className="space-y-6">

            {/* AI-extracted criteria */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FaMagic className="text-teal-600" />
                <h2 className="text-sm font-bold text-teal-900 uppercase tracking-wider">
                  {result.aiPowered ? 'What I understood' : 'Search criteria (basic match)'}
                </h2>
              </div>
              {result.criteria?.intent && (
                <p className="text-slate-700 mb-3 italic">"{result.criteria.intent}"</p>
              )}
              <div className="flex flex-wrap gap-2">
                {result.criteria?.category && (
                  <Chip icon={<FaTags />} label="Category" value={result.criteria.category} />
                )}
                {result.criteria?.city && (
                  <Chip icon={<FaMapMarkerAlt />} label="City" value={result.criteria.city} />
                )}
                {result.criteria?.budget && (
                  <Chip icon={<FaBriefcase />} label="Budget" value={result.criteria.budget} />
                )}
                {(result.criteria?.services || []).map((s, i) => (
                  <Chip key={`s${i}`} value={s} accent="teal" />
                ))}
                {(result.criteria?.keywords || []).map((s, i) => (
                  <Chip key={`k${i}`} value={s} accent="slate" />
                ))}
              </div>
            </div>

            {/* Draft outreach */}
            {result.draftMessage && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FaPaperPlane className="text-teal-600" /> Ready-to-send Outreach
                  </h2>
                  <button
                    onClick={copyDraft}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-100 transition"
                  >
                    {copied ? <><FaCheck size={10} /> Copied!</> : <><FaCopy size={10} /> Copy</>}
                  </button>
                </div>
                <pre className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{result.draftMessage}</pre>
              </div>
            )}

            {/* Matches */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FaSearch className="text-teal-600" />
                Top Matches
                <span className="text-slate-400 font-normal text-sm">
                  ({result.matches.length} of {result.candidateCount} candidates)
                </span>
              </h2>
              {result.matches.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                  <p className="text-slate-700 font-semibold">No vendors match this request yet.</p>
                  <p className="text-slate-500 text-sm mt-1">Try broader keywords or check back as more vendors are added.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.matches.map((m) => (
                    <MatchCard key={m.vendor._id} match={m} draftMessage={result.draftMessage} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !result && <SkeletonResults />}
      </div>
    </section>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function Chip({ icon, label, value, accent }) {
  const palette = {
    teal:   "bg-teal-100   text-teal-700   border-teal-200",
    slate:  "bg-slate-100  text-slate-700  border-slate-200",
    default:"bg-white      text-slate-700  border-slate-200",
  };
  const cls = palette[accent] || palette.default;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cls}`}>
      {icon && <span className="text-teal-600">{icon}</span>}
      {label && <span className="text-[10px] uppercase tracking-wider text-slate-400">{label}:</span>}
      {value}
    </span>
  );
}

function MatchCard({ match, draftMessage }) {
  const v = match.vendor;
  const catStyle = CATEGORY_STYLES[v.category] || CATEGORY_STYLES.Other;
  const waLink = buildWhatsAppLink(v.whatsapp, draftMessage);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all overflow-hidden flex flex-col">
      <div className="h-1.5 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-700" />
      <div className="p-5 flex flex-col flex-1">

        {/* Identity + match score */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            {v.logo ? (
              <img src={v.logo} alt={v.vendorName}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                {v.vendorName?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-bold text-slate-900 truncate">{v.vendorName}</p>
                {v.verified && (
                  <span title="Verified Vendor" className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <FaShieldAlt size={9} /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${catStyle}`}>
                  {v.category}
                </span>
                {v.city && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <FaMapMarkerAlt size={9} /> {v.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Match score badge */}
          <div className="text-center shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-teal-500/30">
              {match.score}
            </div>
            <p className="text-[9px] uppercase tracking-wider text-slate-400 mt-1 font-semibold">match</p>
          </div>
        </div>

        {/* Reason */}
        {match.reason && (
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 mb-1 flex items-center gap-1.5">
              <FaMagic size={9} /> Why this vendor
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{match.reason}</p>
          </div>
        )}

        {/* Services chips */}
        {Array.isArray(v.services) && v.services.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {v.services.slice(0, 4).map((s, i) => (
              <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/vendors/${v._id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition"
          >
            View Profile <FaArrowRight size={10} />
          </Link>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-lg transition border border-emerald-100"
              title="Send draft on WhatsApp"
            >
              <FaWhatsapp size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonResults() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-100 rounded-2xl p-5 h-24 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-pulse">
            <div className="h-1.5 bg-slate-100" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-100 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded-full" />
                </div>
              </div>
              <div className="h-16 bg-slate-100 rounded-xl mb-3" />
              <div className="h-9 bg-slate-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
