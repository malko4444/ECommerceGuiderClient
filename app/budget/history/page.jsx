'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaArrowLeft, FaArrowRight, FaMoneyBillWave, FaPlus, FaTrash,
  FaSyncAlt, FaCoins, FaRoad, FaCheckCircle, FaArchive
} from 'react-icons/fa';

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatPKR = (n) => Number(n || 0).toLocaleString('en-PK');

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'archived', label: 'Archived' },
];

const TIER_TONES = {
  Micro:  'bg-slate-100 text-slate-700 border-slate-200',
  Small:  'bg-sky-50    text-sky-700    border-sky-200',
  Medium: 'bg-purple-50 text-purple-700 border-purple-200',
  Large:  'bg-teal-50   text-teal-700   border-teal-200',
};

export default function BudgetHistoryPage() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API}/api/budgets`, {
        withCredentials: true, headers: authHeader(),
      });
      setBudgets(res.data.budgets || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) { router.push('/login'); return; }
      setError(err.response?.data?.error || 'Could not load your budgets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/api/budgets/${id}`, {
        withCredentials: true, headers: authHeader(),
      });
      setBudgets((bs) => bs.filter((b) => b._id !== id));
    } catch { alert('Failed to delete.'); }
  };

  const filtered = filter === 'all' ? budgets : budgets.filter((b) => b.status === filter);
  const totalAcrossAll = budgets.reduce((s, b) => s + (b.totalBudget || 0), 0);
  const activeCount = budgets.filter((b) => b.status === 'active').length;

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <Link href="/budget" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 text-sm font-medium mb-6 transition">
          <FaArrowLeft size={11} /> Back to budget planner
        </Link>

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30">
              <FaMoneyBillWave className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                My Budgets
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Saved budget plans, linked to your roadmaps where applicable.
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
              href="/budget"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg transition font-semibold text-sm shadow-md shadow-teal-600/30"
            >
              <FaPlus size={11} /> New Budget
            </Link>
          </div>
        </div>

        {/* STAT STRIP */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Stat icon={<FaMoneyBillWave />} label="Total budgets" value={budgets.length} tone="teal" />
          <Stat icon={<FaCheckCircle />}   label="Active"        value={activeCount}     tone="emerald" />
          <Stat icon={<FaCoins />}         label="Combined"      value={`PKR ${formatPKR(totalAcrossAll)}`} tone="amber" />
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
            {filtered.map((b) => (
              <BudgetCard key={b._id} b={b} onDelete={() => handleDelete(b._id)} />
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

function BudgetCard({ b, onDelete }) {
  const tierTone = TIER_TONES[b.tier] || TIER_TONES.Micro;
  const topAlloc = (b.allocations || []).slice().sort((a, c) => c.amount - a.amount)[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all overflow-hidden">
      <div className={`h-1.5 ${
        b.status === 'completed' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
        : b.status === 'archived' ? 'bg-slate-300'
        : 'bg-gradient-to-r from-teal-400 via-teal-500 to-teal-700'
      }`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
              <FaMoneyBillWave />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-slate-900 text-xl truncate">PKR {formatPKR(b.totalBudget)}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {b.tier && (
                  <span className={`inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${tierTone}`}>
                    {b.tier}
                  </span>
                )}
                <StatusBadge status={b.status} />
                <span className="text-[11px] text-slate-400">
                  {new Date(b.createdAt).toLocaleDateString()}
                </span>
              </div>
              {b.productType && (
                <p className="text-xs text-slate-600 mt-1 truncate">For <span className="font-semibold text-slate-800">{b.productType}</span></p>
              )}
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

        {/* Linked roadmap pill */}
        {b.roadmap && b.roadmap._id && (
          <Link
            href={`/roadmap/${b.roadmap._id}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-100 transition mb-3"
          >
            <FaRoad size={9} /> {b.roadmap.productType || 'Linked roadmap'}
          </Link>
        )}

        {/* Top allocation peek */}
        {topAlloc && (
          <p className="text-xs text-slate-500 mb-3">
            Largest slice:{' '}
            <span className="font-semibold text-slate-700">{topAlloc.category}</span>
            {' '}({topAlloc.percent}% · PKR {formatPKR(topAlloc.amount)})
          </p>
        )}

        {/* Mini allocation strip */}
        <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 mb-4">
          {(b.allocations || []).map((a, i) => {
            const colors = ['#0d9488','#0284c7','#7c3aed','#d97706','#db2777','#475569','#64748b'];
            return (
              <div
                key={a._id || i}
                title={`${a.category}: ${a.percent}%`}
                style={{ width: `${a.percent}%`, background: colors[i % colors.length] }}
              />
            );
          })}
        </div>

        <Link
          href={`/budget/${b._id}`}
          className="inline-flex items-center justify-center gap-2 w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition"
        >
          Open <FaArrowRight size={10} />
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
      <div className="min-w-0">
        <p className="text-slate-500 text-xs font-medium">{label}</p>
        <p className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ filter }) {
  return (
    <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto mb-4">
        <FaMoneyBillWave className="text-teal-500 text-3xl" />
      </div>
      <p className="text-slate-800 font-bold text-lg">
        {filter === 'all' ? 'No budgets yet' : `No ${filter} budgets`}
      </p>
      <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
        {filter === 'all'
          ? 'Generate your first budget — it only takes a few seconds.'
          : 'Try a different filter or create a new budget.'}
      </p>
      <Link href="/budget" className="inline-flex items-center gap-2 mt-6 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition">
        <FaPlus size={11} /> Create budget
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
                <div className="h-5 w-32 bg-slate-100 rounded" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
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
