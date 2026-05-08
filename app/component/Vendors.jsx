'use client';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
  FaStore, FaSyncAlt, FaSearch, FaGlobe, FaEnvelope,
  FaTags, FaPhone, FaMapMarkerAlt,
  FaWhatsapp, FaShieldAlt, FaBriefcase, FaArrowRight,
  FaStar, FaRegStar, FaStarHalfAlt, FaHeart, FaRegHeart, FaMagic
} from 'react-icons/fa';

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

const CATEGORIES = [
  "Home Decor", "Electronics", "IT Services", "Clothing",
  "Food Supplier", "Construction", "Marketing", "Other"
];

const buildWhatsAppLink = (raw) => {
  if (!raw) return '';
  let num = String(raw).replace(/[^\d]/g, '');
  if (num.startsWith('0')) num = '92' + num.slice(1);
  return `https://wa.me/${num}`;
};

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default'); // default | rating | name

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/all`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Could not load vendors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  // Optimistic toggle save: flip locally first, call API, revert on error.
  const toggleSave = async (vendorId) => {
    const prev = vendors;
    setVendors((vs) => vs.map((v) => v._id === vendorId ? { ...v, savedByMe: !v.savedByMe } : v));
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/${vendorId}/save`,
        {},
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Save toggle failed:', err);
      setVendors(prev); // rollback
    }
  };

  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = vendors.filter(v => {
      const matchesSearch = !q ||
        v.vendorName?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q) ||
        v.website?.toLowerCase().includes(q) ||
        v.city?.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        (Array.isArray(v.services) && v.services.some(s => s.toLowerCase().includes(q)));
      const matchesCat = !filterCategory || v.category === filterCategory;
      const matchesCity = !filterCity || v.city === filterCity;
      const matchesVerified = !verifiedOnly || v.verified;
      return matchesSearch && matchesCat && matchesCity && matchesVerified;
    });

    if (sortBy === 'rating') {
      list = [...list].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    } else if (sortBy === 'name') {
      list = [...list].sort((a, b) => (a.vendorName || '').localeCompare(b.vendorName || ''));
    }
    return list;
  }, [vendors, search, filterCategory, filterCity, verifiedOnly, sortBy]);

  const uniqueCategories = new Set(vendors.map(v => v.category)).size;
  const verifiedCount = vendors.filter(v => v.verified).length;
  const savedCount = vendors.filter(v => v.savedByMe).length;

  const cityOptions = useMemo(() => {
    const set = new Set(vendors.map(v => v.city).filter(Boolean));
    return Array.from(set).sort();
  }, [vendors]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* HERO */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30">
                <FaStore className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Vendor Directory
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  Browse trusted suppliers and partners curated for Pakistani e-commerce sellers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/my-vendors"
                className="bg-white border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 px-4 py-2.5 rounded-lg transition flex items-center gap-2 font-medium shadow-sm"
                title="My saved vendors"
              >
                <FaHeart className="text-rose-500" /> My Saved
                {savedCount > 0 && (
                  <span className="ml-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                    {savedCount}
                  </span>
                )}
              </Link>
              <button
                onClick={fetchVendors}
                disabled={loading}
                className="bg-white border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 px-4 py-2.5 rounded-lg transition flex items-center gap-2 font-medium shadow-sm disabled:opacity-60"
              >
                <FaSyncAlt className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* AI MATCHMAKER BANNER — the wow feature entry point */}
        <Link
          href="/match"
          className="block mb-8 group"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-600 p-5 sm:p-6 shadow-lg shadow-teal-500/30 hover:shadow-xl transition">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-12 bottom-2 w-20 h-20 rounded-full bg-emerald-300/20 blur-xl" />
            <div className="relative flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-white shrink-0">
                  <FaMagic size={20} />
                </div>
                <div className="text-white">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">New · AI-powered</p>
                  <p className="text-lg sm:text-xl font-extrabold leading-tight">Find vendors with one sentence</p>
                  <p className="text-sm text-white/85 mt-0.5">
                    Describe your need in plain English. We will pick the best matches and write your outreach message.
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-white text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-lg font-bold text-sm shadow-md transition group-hover:scale-105">
                Try Matchmaker <FaArrowRight size={11} />
              </div>
            </div>
          </div>
        </Link>

        {/* STATS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatPill icon={<FaStore />}      label="Total Vendors"  value={vendors.length}         tone="teal" />
          <StatPill icon={<FaShieldAlt />}  label="Verified"       value={verifiedCount}          tone="emerald" />
          <StatPill icon={<FaHeart />}      label="My Saved"       value={savedCount}             tone="rose" />
          <StatPill icon={<FaSearch />}     label="Showing"        value={filteredVendors.length} tone="amber" />
        </div>

        {/* SEARCH + FILTER */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search by name, city, services, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-slate-200 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white sm:w-44"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="border border-slate-200 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white sm:w-40"
            >
              <option value="">All cities</option>
              {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-200 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white sm:w-44"
            >
              <option value="default">Sort: Default</option>
              <option value="rating">Sort: Top Rated</option>
              <option value="name">Sort: Name (A–Z)</option>
            </select>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none w-fit">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="w-4 h-4 accent-teal-600"
            />
            <span className="text-sm text-slate-600 flex items-center gap-1.5">
              <FaShieldAlt className="text-emerald-600" size={11} />
              Show verified vendors only
            </span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : filteredVendors.length === 0 ? (
          <EmptyState
            title={vendors.length === 0 ? "No vendors available yet" : "No vendors match your search"}
            subtitle={vendors.length === 0
              ? "Check back soon — new suppliers are added regularly."
              : "Try a different search term or clear the filters."}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor._id} vendor={vendor} onToggleSave={() => toggleSave(vendor._id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatPill({ icon, label, value, tone }) {
  const tones = {
    teal:    "bg-teal-50    text-teal-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple:  "bg-purple-50  text-purple-600",
    amber:   "bg-amber-50   text-amber-600",
    rose:    "bg-rose-50    text-rose-600",
  };
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md transition">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-medium">{label}</p>
        <p className="text-xl font-bold text-slate-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}

// Compact 5-star renderer with optional half star.
function StarRow({ value = 0, size = 12 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) stars.push(<FaStar key={i} size={size} className="text-amber-400" />);
    else if (value >= i - 0.5) stars.push(<FaStarHalfAlt key={i} size={size} className="text-amber-400" />);
    else stars.push(<FaRegStar key={i} size={size} className="text-slate-300" />);
  }
  return <span className="inline-flex items-center gap-0.5">{stars}</span>;
}

function VendorCard({ vendor, onToggleSave }) {
  const catStyle = CATEGORY_STYLES[vendor.category] || CATEGORY_STYLES.Other;
  const websiteHref = vendor.website?.startsWith('http')
    ? vendor.website
    : `https://${vendor.website}`;

  const services = Array.isArray(vendor.services) ? vendor.services : [];
  const waLink = buildWhatsAppLink(vendor.whatsapp);
  const hasReviews = (vendor.reviewCount || 0) > 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all duration-200 overflow-hidden flex flex-col relative">
      {/* Decorative header strip */}
      <div className="h-2 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-700" />

      {/* Save heart — top-right floating */}
      <button
        onClick={onToggleSave}
        className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition shadow-sm border ${
          vendor.savedByMe
            ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
            : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
        }`}
        title={vendor.savedByMe ? 'Remove from saved' : 'Save vendor'}
      >
        {vendor.savedByMe ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
      </button>

      <div className="p-6 flex flex-col flex-1">
        {/* Identity row */}
        <div className="flex items-start gap-3 mb-3 pr-10">
          {vendor.logo ? (
            <img
              src={vendor.logo}
              alt={vendor.vendorName}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {vendor.vendorName?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">
                {vendor.vendorName}
              </h3>
              {vendor.verified && (
                <span title="Verified Vendor" className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <FaShieldAlt size={9} /> Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${catStyle}`}>
                {vendor.category}
              </span>
              {vendor.city && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <FaMapMarkerAlt size={9} /> {vendor.city}
                </span>
              )}
              {vendor.yearsInBusiness > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <FaBriefcase size={9} /> {vendor.yearsInBusiness}y
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <StarRow value={vendor.avgRating || 0} />
          {hasReviews ? (
            <span className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{vendor.avgRating?.toFixed(1)}</span>
              <span className="text-slate-400"> · {vendor.reviewCount} review{vendor.reviewCount === 1 ? '' : 's'}</span>
            </span>
          ) : (
            <span className="text-xs text-slate-400">No reviews yet</span>
          )}
        </div>

        {vendor.description && (
          <p className="text-sm text-slate-600 line-clamp-3 mb-3">
            {vendor.description}
          </p>
        )}

        {services.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {services.slice(0, 5).map((s, i) => (
              <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                {s}
              </span>
            ))}
            {services.length > 5 && (
              <span className="text-[10px] font-medium text-slate-400 self-center">
                +{services.length - 5}
              </span>
            )}
          </div>
        )}

        <div className="space-y-2 text-sm mb-5">
          <div className="flex items-center gap-2 text-slate-600 min-w-0">
            <FaGlobe className="text-slate-400 shrink-0" size={12} />
            <span className="truncate">{vendor.website}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 min-w-0">
            <FaEnvelope className="text-slate-400 shrink-0" size={12} />
            <span className="truncate">{vendor.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 min-w-0">
            <FaPhone className="text-slate-400 shrink-0" size={11} />
            <span className="truncate">{vendor.phone}</span>
          </div>
          {vendor.whatsapp && (
            <div className="flex items-center gap-2 text-slate-600 min-w-0">
              <FaWhatsapp className="text-emerald-500 shrink-0" size={12} />
              <span className="truncate">{vendor.whatsapp}</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex gap-2">
          <Link
            href={`/vendors/${vendor._id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition"
          >
            View Profile <FaArrowRight size={10} />
          </Link>
          <a
            href={websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-11 h-11 bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 rounded-lg transition border border-slate-200"
            title="Open website"
          >
            <FaGlobe size={13} />
          </a>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-11 h-11 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-lg transition border border-emerald-100"
              title="Message on WhatsApp"
            >
              <FaWhatsapp size={15} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="h-2 bg-slate-100" />
          <div className="p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-100 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded-full" />
              </div>
            </div>
            <div className="space-y-2 mb-5">
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-3/4 bg-slate-100 rounded" />
            </div>
            <div className="h-10 bg-slate-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-teal-50 flex items-center justify-center mx-auto mb-4">
        <FaStore className="text-slate-400 text-3xl" />
      </div>
      <p className="text-slate-800 font-bold text-lg">{title}</p>
      <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">{subtitle}</p>
    </div>
  );
}
