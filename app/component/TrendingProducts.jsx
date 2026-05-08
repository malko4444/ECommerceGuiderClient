'use client';
import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
  FaFire, FaSearch, FaLightbulb, FaExclamationCircle,
  FaRedo, FaExternalLinkAlt, FaGlobe, FaHistory, FaMagic,
  FaTags, FaCoins
} from 'react-icons/fa';

const SUGGESTIONS = [
  'Skincare', 'Electronics', 'Phone accessories',
  'Baby products', 'Fitness gear', 'Home decor',
];

function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return ''; }
}

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function TrendingProducts() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const [keyword, setKeyword] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [summary, setSummary] = useState('');
  const [items, setItems] = useState([]); // structured AI-curated trends
  const [results, setResults] = useState([]); // raw Tavily results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [cached, setCached] = useState(false);

  const fetchTrending = async (override) => {
    const value = (override ?? keyword).trim();
    if (!value) return;
    if (override) setKeyword(override);
    setCurrentQuery(value);

    setLoading(true);
    setError('');
    setSummary('');
    setItems([]);
    setResults([]);
    setCached(false);
    setHasSearched(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to be logged in to search trends.');
        setLoading(false);
        return;
      }
      const response = await axios.post(
        `${API}/api/trending-products`,
        { keyword: value },
        { headers: { 'Content-Type': 'application/json', ...authHeader() } }
      );
      setSummary(response.data.summary || '');
      setItems(Array.isArray(response.data.items) ? response.data.items : []);
      setResults(Array.isArray(response.data.results) ? response.data.results : []);
      setCached(!!response.data._cached);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch trending products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <FaFire className="text-white text-lg animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Trending Products
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Discover what is hot right now in Pakistan, curated by AI.
            </p>
          </div>
        </div>
        <Link
          href="/trends/history"
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <FaHistory size={11} /> Saved trends
        </Link>
      </div>

      {/* SEARCH CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 mb-6">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search trends like gadgets, skincare, fashion..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTrending()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40 outline-none transition"
            />
          </div>
          <button
            onClick={() => fetchTrending()}
            disabled={loading || !keyword.trim()}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-orange-500/30 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" /> Searching...</>
            ) : (
              <><FaSearch size={13} /> Search</>
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
              onClick={() => fetchTrending(s)}
              disabled={loading}
              className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full border border-orange-200 transition disabled:opacity-60 font-semibold"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING SKELETON */}
      {loading && (
        <div>
          <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="h-1.5 bg-slate-100" />
                <div className="p-5 animate-pulse">
                  <div className="h-5 w-3/4 bg-slate-200 rounded mb-2" />
                  <div className="h-3 w-full bg-slate-100 rounded mb-1.5" />
                  <div className="h-3 w-5/6 bg-slate-100 rounded mb-4" />
                  <div className="h-10 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
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
              onClick={() => fetchTrending(currentQuery)}
              className="mt-2 text-red-700 hover:text-red-900 text-sm font-semibold flex items-center gap-1.5"
            >
              <FaRedo size={11} /> Try again
            </button>
          </div>
        </div>
      )}

      {/* AI SUMMARY */}
      {!loading && !error && summary && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5 mb-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <FaMagic />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700 mb-1 flex items-center gap-2">
              AI summary for &ldquo;{currentQuery}&rdquo;
              {cached && <span className="text-[10px] font-medium text-slate-500 normal-case tracking-normal">(cached)</span>}
            </p>
            <p className="text-slate-800 text-sm leading-relaxed">{summary}</p>
          </div>
        </div>
      )}

      {/* STRUCTURED ITEMS (preferred when present) */}
      {!loading && !error && items.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Top picks
              <span className="text-slate-400 font-normal text-sm ml-2">({items.length})</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {items.map((it, i) => <TrendItemCard key={i} item={it} rank={i + 1} />)}
          </div>
        </>
      )}

      {/* RAW SOURCES (collapsible-feel) */}
      {!loading && !error && results.length > 0 && (
        <>
          <h3 className="text-lg font-bold text-slate-900 mb-4">All sources <span className="text-slate-400 font-normal text-sm">({results.length})</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((r, i) => <RawCard key={i} item={r} rank={i + 1} />)}
          </div>
        </>
      )}

      {/* NO RESULTS */}
      {!loading && !error && hasSearched && items.length === 0 && results.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center mx-auto mb-3">
            <FaFire className="text-orange-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">No trends found</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Try a broader search like &ldquo;electronics&rdquo; or &ldquo;fashion&rdquo;.
          </p>
        </div>
      )}

      {/* INITIAL EMPTY */}
      {!loading && !error && !hasSearched && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center mx-auto mb-3">
            <FaFire className="text-orange-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">What is hot today?</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Enter a category above or tap a suggestion. Every search auto-saves so you can review it later.
          </p>
        </div>
      )}
    </section>
  );
}

// ============================================================
// CARDS
// ============================================================

function TrendItemCard({ item, rank }) {
  const domain = item.source || getDomain(item.sourceUrl);
  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 transition-all overflow-hidden flex flex-col">
      <div className="h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-full shadow-sm">
            <FaFire size={10} /> #{rank}
          </span>
          {domain && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate max-w-[60%]">
              <FaGlobe size={9} className="text-slate-400" />
              <span className="truncate">{domain}</span>
            </span>
          )}
        </div>
        <h3 className="font-bold text-slate-900 text-base leading-snug mb-2 line-clamp-2">
          {item.name}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {item.category && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              <FaTags size={8} /> {item.category}
            </span>
          )}
          {item.priceRange && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FaCoins size={8} /> {item.priceRange}
            </span>
          )}
        </div>
        {item.whyTrending && (
          <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">
            {item.whyTrending}
          </p>
        )}
        {item.sourceUrl && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition"
          >
            View Source <FaExternalLinkAlt size={10} />
          </a>
        )}
      </div>
    </div>
  );
}

function RawCard({ item, rank }) {
  const domain = getDomain(item.url);
  const content = item.content || 'No description available.';
  const truncated = content.length > 140 ? content.slice(0, 140).trim() + '...' : content;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all overflow-hidden flex flex-col">
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">#{rank}</span>
          {domain && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate max-w-[60%]">
              <FaGlobe size={9} className="text-slate-400" />
              <span className="truncate">{domain}</span>
            </span>
          )}
        </div>
        <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 line-clamp-2">{item.title || 'Untitled'}</h3>
        <p className="text-slate-600 text-xs leading-relaxed mb-3 flex-1">{truncated}</p>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md font-semibold text-[12px] transition"
        >
          Open <FaExternalLinkAlt size={9} />
        </a>
      </div>
    </div>
  );
}
