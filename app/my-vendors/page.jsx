'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaHeart, FaStore, FaArrowLeft, FaArrowRight, FaTrash,
  FaCheckCircle, FaExclamationTriangle, FaShieldAlt,
  FaMapMarkerAlt, FaPenAlt, FaStickyNote, FaSyncAlt
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

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function MyVendorsPage() {
  const router = useRouter();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 3000);
  };

  const fetchSaved = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/saved`,
        { withCredentials: true, headers: authHeader() }
      );
      setSaved(res.data.saved || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) { router.push('/login'); return; }
      setError(err.response?.data?.error || 'Could not load saved vendors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSaved(); }, []);

  const handleUnsave = async (vendorId) => {
    if (!window.confirm('Remove this vendor from your saved list?')) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/saved/${vendorId}`,
        { withCredentials: true, headers: authHeader() }
      );
      setSaved((rows) => rows.filter((r) => String(r.vendor._id) !== String(vendorId)));
      showFeedback('success', 'Removed from saved.');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Failed to remove. Please try again.');
    }
  };

  const handleSaveNote = async (vendorId, newNote) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/saved/${vendorId}/note`,
        { note: newNote },
        { withCredentials: true, headers: authHeader() }
      );
      setSaved((rows) =>
        rows.map((r) =>
          String(r.vendor._id) === String(vendorId) ? { ...r, note: newNote } : r
        )
      );
      showFeedback('success', 'Note saved.');
    } catch (err) {
      console.error(err);
      showFeedback('error', err.response?.data?.error || 'Failed to save note.');
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/40 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <Link href="/vendors" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 text-sm font-medium mb-6 transition">
          <FaArrowLeft size={11} /> Back to all vendors
        </Link>

        <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <FaHeart className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                My Saved Vendors
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Your personal shortlist with private notes — only you can see what you write here.
              </p>
            </div>
          </div>

          <button
            onClick={fetchSaved}
            disabled={loading}
            className="bg-white border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 px-4 py-2.5 rounded-lg transition flex items-center gap-2 font-medium shadow-sm disabled:opacity-60"
          >
            <FaSyncAlt className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* GLOBAL FEEDBACK */}
        {feedback.text && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 border ${
            feedback.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-green-50 text-green-700 border-green-200'
          }`}>
            {feedback.type === 'error' ? <FaExclamationTriangle /> : <FaCheckCircle />}
            {feedback.text}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <SkeletonList />
        ) : saved.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {saved.map((row) => (
              <SavedVendorCard
                key={row._id}
                row={row}
                onUnsave={() => handleUnsave(row.vendor._id)}
                onSaveNote={(note) => handleSaveNote(row.vendor._id, note)}
              />
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

function SavedVendorCard({ row, onUnsave, onSaveNote }) {
  const vendor = row.vendor;
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(row.note || '');
  const [saving, setSaving] = useState(false);

  const catStyle = CATEGORY_STYLES[vendor.category] || CATEGORY_STYLES.Other;

  const handleSave = async () => {
    setSaving(true);
    await onSaveNote(note);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-rose-200 transition-all overflow-hidden flex flex-col">
      <div className="h-1.5 bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600" />

      <div className="p-5 flex flex-col flex-1">
        {/* Identity */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            {vendor.logo ? (
              <img src={vendor.logo} alt={vendor.vendorName}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                {vendor.vendorName?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-bold text-slate-900 truncate">{vendor.vendorName}</p>
                {vendor.verified && (
                  <span title="Verified Vendor" className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <FaShieldAlt size={9} /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${catStyle}`}>
                  {vendor.category}
                </span>
                {vendor.city && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <FaMapMarkerAlt size={9} /> {vendor.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onUnsave}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition shrink-0"
            title="Remove from saved"
          >
            <FaTrash size={11} />
          </button>
        </div>

        {/* PRIVATE NOTE BLOCK — the sticky-feature */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3 flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <FaStickyNote size={10} /> Private note
            </p>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1"
              >
                <FaPenAlt size={9} /> {row.note ? 'Edit' : 'Add note'}
              </button>
            )}
          </div>

          {editing ? (
            <>
              <textarea
                rows={3}
                value={note}
                maxLength={1000}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Called on 5 May. Quoted PKR 50k for bulk order. Follow up next week."
                className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
              <div className="flex items-center justify-between mt-2 gap-2">
                <p className="text-[10px] text-amber-700/70">{note.length}/1000</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setNote(row.note || ''); setEditing(false); }}
                    className="text-[12px] font-semibold px-3 py-1 rounded-md bg-white border border-amber-200 hover:bg-amber-100 text-amber-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-[12px] font-semibold px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white transition disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-amber-900 whitespace-pre-wrap min-h-[36px]">
              {row.note?.trim() || (
                <span className="text-amber-700/50 italic">No note yet. Click "Add note" to track your thoughts.</span>
              )}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/vendors/${vendor._id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition"
          >
            View Profile <FaArrowRight size={10} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center mx-auto mb-4">
        <FaHeart className="text-rose-400 text-3xl" />
      </div>
      <p className="text-slate-800 font-bold text-lg">No saved vendors yet</p>
      <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
        Browse the directory and tap the heart icon on any vendor to save it. You can add private notes to keep track of who you have spoken to.
      </p>
      <Link
        href="/vendors"
        className="inline-flex items-center gap-2 mt-6 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition"
      >
        <FaStore size={12} /> Browse Vendors
      </Link>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="h-1.5 bg-slate-100" />
          <div className="p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-100 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded-full" />
              </div>
            </div>
            <div className="h-20 bg-slate-100 rounded-lg mb-4" />
            <div className="h-9 bg-slate-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
