'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FaChartLine, FaSearch, FaExternalLinkAlt, FaLightbulb,
  FaExclamationCircle, FaRedo, FaGlobe, FaInfoCircle,
  FaHistory, FaRoad, FaCheckCircle, FaTimesCircle, FaUserFriends,
  FaCoins
} from 'react-icons/fa';

const SUGGESTIONS = [
  'Wireless earbuds', "Women's kurtis", 'Phone cases',
  'Skincare serum', 'Smart watches',
];

function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return ''; }
}

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Competitor() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const search = useSearchParams();

  // Roadmap context — if user came from a roadmap task we auto-fill.
  const ctxProduct = search.get('q') || search.get('product') || search.get('productType') || '';
  const ctxRoadmapId = search.get('roadmapId') || '';

  const [productInput, setProductInput] = useState(ctxProduct);
  const [currentQuery, setCurrentQuery] = useState('');
  const [analysisText, setAnalysisText] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // If we arrived with a product preset, auto-run once.
    if (ctxProduct && ctxProduct.trim().length >= 2) {
      fetchAnalysis(ctxProduct);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalysis = async (override) => {
    const value = (override ?? productInput).trim();
    if (!value) return;
    if (override !== undefined) setProductInput(override);
    setCurrentQuery(value);

    setLoading(true);
    setError('');
    setAnalysisText('');
    setCompetitors([]);
    setHasSearched(true);

    try {
      const response = await axios.post(
        `${API}/api/competitor`,
        { product: value, roadmapId: ctxRoadmapId || undefined },
        { headers: { 'Content-Type': 'application/json', ...authHeader() } }
      );
      const { analysis, competitors: comps } = response.data;
      setAnalysisText(analysis || '');
      setCompetitors(Array.isArray(comps) ? comps : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load competitor analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isWarningAnalysis = analysisText.startsWith('⚠️') || analysisText.toLowerCase().includes('not applicable');

  return (
    <section className="max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30">
            <FaChartLine className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Competitor Analysis
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Real stores, pricing, strengths and weaknesses — saved for later reference.
            </p>
          </div>
        </div>
        <Link
          href="/competitor/history"
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <FaHistory size={11} /> Saved reports
        </Link>
      </div>

      {/* ROADMAP CONTEXT BANNER */}
      {ctxRoadmapId && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <FaRoad />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">From your roadmap</p>
            <p className="text-sm text-slate-700">
              Analysing competitors for <span className="font-semibold text-teal-700">{ctxProduct}</span>
            </p>
          </div>
          <Link
            href={`/roadmap/${ctxRoadmapId}`}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 shrink-0"
          >
            Back to roadmap
          </Link>
        </div>
      )}

      {/* INPUT CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 mb-6">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="e.g. wireless earbuds, sneakers, kurtis..."
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAnalysis()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40 outline-none transition"
            />
          </div>
          <button
            onClick={() => fetchAnalysis()}
            disabled={loading || !productInput.trim()}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" /> Analysing...</>
            ) : (
              <><FaSearch size={13} /> Analyze</>
            )}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 mr-1">
            <FaLightbulb className="text-amber-500" /> Try:
          </span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => fetchAnalysis(s)}
              disabled={loading}
              className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full border border-teal-200 transition disabled:opacity-60 font-semibold"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-pulse">
            <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
            <div className="h-3 w-full bg-slate-100 rounded mb-2" />
            <div className="h-3 w-4/5 bg-slate-100 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="h-1.5 bg-slate-100" />
                <div className="p-5 animate-pulse">
                  <div className="h-5 w-3/4 bg-slate-200 rounded mb-2" />
                  <div className="h-3 w-full bg-slate-100 rounded mb-2" />
                  <div className="h-10 bg-slate-100 rounded-lg mt-4" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-teal-600 text-sm font-semibold flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            Scanning the market for competitors...
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
              onClick={() => fetchAnalysis(currentQuery)}
              className="mt-2 text-red-700 hover:text-red-900 text-sm font-semibold flex items-center gap-1.5"
            >
              <FaRedo size={11} /> Try again
            </button>
          </div>
        </div>
      )}

      {/* ANALYSIS SUMMARY */}
      {!loading && !error && analysisText && (
        <div className={`rounded-2xl p-5 sm:p-6 border mb-6 flex items-start gap-4 ${
          isWarningAnalysis
            ? 'bg-amber-50 border-amber-200'
            : 'bg-gradient-to-br from-teal-50 to-white border-teal-200'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isWarningAnalysis ? 'bg-amber-100 text-amber-600' : 'bg-teal-100 text-teal-600'
          }`}>
            {isWarningAnalysis ? <FaExclamationCircle /> : <FaInfoCircle />}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm mb-1">
              {isWarningAnalysis ? 'Heads up' : `Market overview for "${currentQuery}"`}
            </p>
            <p className="text-slate-700 text-sm leading-relaxed">{analysisText}</p>
          </div>
        </div>
      )}

      {/* COMPETITORS GRID */}
      {!loading && !error && competitors.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Competitors found
              <span className="text-slate-400 font-normal text-sm ml-2">({competitors.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {competitors.map((c, i) => <CompetitorCard key={i} comp={c} />)}
          </div>
        </>
      )}

      {/* INITIAL EMPTY STATE */}
      {!loading && !error && !hasSearched && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto mb-3">
            <FaChartLine className="text-teal-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">Who is selling what?</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Enter a product to see real competitors with prices, strengths, and target audiences.
          </p>
        </div>
      )}
    </section>
  );
}

// ============================================================
// COMPETITOR CARD with structured fields
// ============================================================
function CompetitorCard({ comp }) {
  const domain = getDomain(comp.website);
  const websiteHref = comp.website?.startsWith('http')
    ? comp.website
    : comp.website ? `https://${comp.website}` : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all overflow-hidden flex flex-col">
      <div className="h-1.5 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-700" />

      <div className="p-5 flex flex-col flex-1">
        {/* Identity */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            {comp.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
              {comp.name || 'Unnamed competitor'}
            </h3>
            {domain && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                <FaGlobe size={9} className="text-slate-400 shrink-0" />
                <span className="truncate">{domain}</span>
              </p>
            )}
          </div>
        </div>

        {/* Quick chips */}
        {(comp.priceRange || comp.audience) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {comp.priceRange && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <FaCoins size={8} /> {comp.priceRange}
              </span>
            )}
            {comp.audience && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                <FaUserFriends size={8} /> {comp.audience}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-slate-600 text-sm leading-relaxed mb-3">
          {comp.description || 'No details available.'}
        </p>

        {/* Strengths / Weaknesses */}
        {(Array.isArray(comp.strengths) && comp.strengths.length > 0) && (
          <div className="mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
              <FaCheckCircle size={9} /> Strengths
            </p>
            <ul className="space-y-0.5">
              {comp.strengths.slice(0, 3).map((s, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                  <span className="text-emerald-500 mt-0.5">·</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(Array.isArray(comp.weaknesses) && comp.weaknesses.length > 0) && (
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 mb-1 flex items-center gap-1">
              <FaTimesCircle size={9} /> Weaknesses
            </p>
            <ul className="space-y-0.5">
              {comp.weaknesses.slice(0, 2).map((w, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                  <span className="text-rose-500 mt-0.5">·</span>{w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        {websiteHref ? (
          <a
            href={websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition"
          >
            Visit Store <FaExternalLinkAlt size={10} />
          </a>
        ) : (
          <div className="mt-auto text-xs text-slate-400 text-center py-2 border border-dashed border-slate-200 rounded-lg">
            No website provided
          </div>
        )}
      </div>
    </div>
  );
}
