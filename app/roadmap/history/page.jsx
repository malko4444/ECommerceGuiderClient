'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaArrowLeft, FaArrowRight, FaRoad, FaPlus, FaTrash,
  FaSyncAlt, FaCalendarAlt, FaTrophy, FaArchive, FaCheckCircle
} from 'react-icons/fa';

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'archived', label: 'Archived' },
];

export default function RoadmapHistoryPage() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API}/api/roadmaps`, {
        withCredentials: true, headers: authHeader(),
      });
      setRoadmaps(res.data.roadmaps || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) { router.push('/login'); return; }
      setError(err.response?.data?.error || 'Could not load your roadmaps.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this roadmap permanently?')) return;
    try {
      await axios.delete(`${API}/api/roadmaps/${id}`, {
        withCredentials: true, headers: authHeader(),
      });
      setRoadmaps((rs) => rs.filter((r) => r._id !== id));
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  const filtered = filter === 'all' ? roadmaps : roadmaps.filter((r) => r.status === filter);
  const activeCount = roadmaps.filter((r) => r.status === 'active').length;
  const completedCount = roadmaps.filter((r) => r.status === 'completed').length;

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <Link href="/roadmap" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 text-sm font-medium mb-6 transition">
          <FaArrowLeft size={11} /> Back to generator
        </Link>

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30">
              <FaRoad className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                My Roadmaps
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Every roadmap you have generated, with progress tracked across phases.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchAll}
              disabled={loading}
              className="bg-white border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 px-4 py-2.5 rounded-lg transition flex items-center gap-2 font-medium shadow-sm disabled:opacity-60"
            >
              <FaSyncAlt className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg transition font-semibold text-sm shadow-md shadow-teal-600/30"
            >
              <FaPlus size={11} /> New Roadmap
            </Link>
          </div>
        </div>

        {/* STAT STRIP */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Stat icon={<FaRoad />}        label="Total"     value={roadmaps.length}  tone="teal" />
          <Stat icon={<FaTrophy />}      label="Completed" value={completedCount}   tone="emerald" />
          <Stat icon={<FaCalendarAlt />} label="Active"    value={activeCount}      tone="amber" />
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                filter === f.id
                  ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <SkeletonList />
        ) : filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((r) => (
              <RoadmapCard key={r._id} r={r} onDelete={() => handleDelete(r._id)} />
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

function RoadmapCard({ r, onDelete }) {
  const allTasks = r.phases?.flatMap?.((p) => p.tasks || []) || [];
  const total = allTasks.length;
  const done = allTasks.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all overflow-hidden">
      <div className={`h-1.5 ${
        r.status === 'completed' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
        : r.status === 'archived' ? 'bg-slate-300'
        : 'bg-gradient-to-r from-teal-400 via-teal-500 to-teal-700'
      }`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
              <FaRoad />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-lg truncate">{r.productType}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <StatusBadge status={r.status} />
                <span className="text-[11px] text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition shrink-0"
            title="Delete"
          >
            <FaTrash size={11} />
          </button>
        </div>

        {/* progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-semibold uppercase tracking-wider">Progress</span>
            <span className="font-bold text-slate-700">{done} / {total} · {pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                r.status === 'completed' ? 'bg-emerald-500' : 'bg-gradient-to-r from-teal-400 to-teal-600'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Phase chips */}
        <div className="flex flex-wrap gap-1 mb-4">
          {(r.phases || []).map((p, i) => {
            const ptotal = p.tasks?.length || 0;
            const pdone = p.tasks?.filter((t) => t.done).length || 0;
            const complete = ptotal > 0 && pdone === ptotal;
            return (
              <span
                key={p._id || i}
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  complete
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {complete && <FaCheckCircle size={8} />}
                {p.title}
              </span>
            );
          })}
        </div>

        <Link
          href={`/roadmap/${r._id}`}
          className="inline-flex items-center justify-center gap-2 w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition"
        >
          {r.status === 'completed' ? 'View completed' : 'Continue'} <FaArrowRight size={10} />
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active:    { cls: 'bg-teal-50 text-teal-700 border-teal-200',         label: 'Active' },
    completed: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' },
    archived:  { cls: 'bg-slate-100 text-slate-600 border-slate-200',     label: 'Archived' },
    draft:     { cls: 'bg-amber-50 text-amber-700 border-amber-200',     label: 'Draft' },
  };
  const s = map[status] || map.active;
  return <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>;
}

function Stat({ icon, label, value, tone }) {
  const tones = {
    teal:    'bg-teal-50    text-teal-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50   text-amber-600',
  };
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>{icon}</div>
      <div>
        <p className="text-slate-500 text-xs font-medium">{label}</p>
        <p className="text-xl font-bold text-slate-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ filter }) {
  return (
    <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto mb-4">
        <FaRoad className="text-teal-500 text-3xl" />
      </div>
      <p className="text-slate-800 font-bold text-lg">
        {filter === 'all' ? 'No roadmaps yet' : `No ${filter} roadmaps`}
      </p>
      <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
        {filter === 'all'
          ? 'Generate your first one — it only takes a few seconds.'
          : 'Try a different filter or create a new roadmap.'}
      </p>
      <Link
        href="/roadmap"
        className="inline-flex items-center gap-2 mt-6 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition"
      >
        <FaPlus size={11} /> Create roadmap
      </Link>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="h-1.5 bg-slate-100" />
          <div className="p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-100 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full mb-4" />
            <div className="h-9 bg-slate-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
