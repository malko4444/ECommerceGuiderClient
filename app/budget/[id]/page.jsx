'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FaArrowLeft, FaArrowRight, FaMoneyBillWave, FaTrash, FaArchive,
  FaCheckCircle, FaExclamationTriangle, FaChartPie, FaChartLine,
  FaLightbulb, FaRoad, FaMapMarkerAlt, FaStore, FaUserGraduate,
  FaCoins, FaSearchDollar, FaCalculator, FaUsers
} from 'react-icons/fa';

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatPKR = (n) => `PKR ${Number(n || 0).toLocaleString('en-PK')}`;

// Color palette per category — keep it predictable so the donut and the
// list always match.
const CATEGORY_COLORS = {
  Stock:           { bg: '#0d9488', text: 'text-teal-700',    soft: 'bg-teal-50 border-teal-100' },
  Packaging:       { bg: '#0284c7', text: 'text-sky-700',     soft: 'bg-sky-50 border-sky-100' },
  'Platform fees': { bg: '#7c3aed', text: 'text-purple-700',  soft: 'bg-purple-50 border-purple-100' },
  Logistics:       { bg: '#d97706', text: 'text-amber-700',   soft: 'bg-amber-50 border-amber-100' },
  Marketing:       { bg: '#db2777', text: 'text-pink-700',    soft: 'bg-pink-50 border-pink-100' },
  Contingency:     { bg: '#475569', text: 'text-slate-700',   soft: 'bg-slate-100 border-slate-200' },
  Other:           { bg: '#64748b', text: 'text-slate-700',   soft: 'bg-slate-50 border-slate-200' },
};
const colorFor = (cat) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;

export default function BudgetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${API}/api/budgets/${id}`, {
          withCredentials: true, headers: authHeader(),
        });
        setDoc(res.data.budget);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) { router.push('/login'); return; }
        setError(err.response?.data?.error || 'Could not load this budget.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDoc();
  }, [id, API, router]);

  const archive = async () => {
    if (!window.confirm('Archive this budget?')) return;
    try {
      await axios.patch(`${API}/api/budgets/${id}`, { status: 'archived' }, {
        withCredentials: true, headers: authHeader(),
      });
      router.push('/budget/history');
    } catch { alert('Failed to archive.'); }
  };

  const remove = async () => {
    if (!window.confirm('Delete this budget? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/api/budgets/${id}`, {
        withCredentials: true, headers: authHeader(),
      });
      router.push('/budget/history');
    } catch { alert('Failed to delete.'); }
  };

  if (loading) return <DetailSkeleton />;
  if (error || !doc) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-red-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-bold text-lg">Budget not found</p>
          <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">{error || 'It may have been deleted.'}</p>
          <Link href="/budget/history" className="inline-flex items-center gap-2 mt-6 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition">
            <FaArrowLeft size={11} /> My Budgets
          </Link>
        </div>
      </section>
    );
  }

  const allocs = doc.allocations || [];
  const totalAllocated = allocs.reduce((s, a) => s + (a.amount || 0), 0);

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <Link href="/budget/history" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 text-sm font-medium mb-6 transition">
          <FaArrowLeft size={11} /> All my budgets
        </Link>

        {/* HERO */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div className="h-2 bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-500" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30 shrink-0">
                  <FaMoneyBillWave className="text-white text-xl" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600">Budget Plan</p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      {formatPKR(doc.totalBudget)}
                    </h1>
                    {doc.tier && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        <FaCoins size={9} /> {doc.tier}
                      </span>
                    )}
                  </div>
                  {doc.productType && (
                    <p className="text-slate-600 text-sm mt-1">
                      For <span className="font-semibold text-slate-900">{doc.productType}</span>
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Created {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={archive} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-sm font-semibold transition">
                  <FaArchive size={11} /> Archive
                </button>
                <button onClick={remove} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-sm font-semibold transition">
                  <FaTrash size={11} /> Delete
                </button>
              </div>
            </div>

            {/* Context chips (roadmap link + inputs) */}
            <div className="flex flex-wrap gap-2 mt-4">
              {doc.roadmap && doc.roadmap._id && (
                <Link
                  href={`/roadmap/${doc.roadmap._id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition"
                >
                  <FaRoad size={10} /> Linked to roadmap: {doc.roadmap.productType || 'Open'}
                  <FaArrowRight size={9} />
                </Link>
              )}
              {doc.inputs?.city && <Chip icon={<FaMapMarkerAlt />} label={doc.inputs.city} />}
              {doc.inputs?.platform && <Chip icon={<FaStore />} label={doc.inputs.platform} />}
              {doc.inputs?.experience && <Chip icon={<FaUserGraduate />} label={doc.inputs.experience.replace(/_/g, ' ')} />}
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — donut + revenue */}
          <div className="lg:col-span-1 space-y-6">

            {/* DONUT CHART */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <FaChartPie className="text-teal-600" /> Allocation
              </h2>
              <div className="flex justify-center">
                <DonutChart allocations={allocs} total={doc.totalBudget} />
              </div>
              <div className="mt-4 space-y-1.5">
                {allocs.map((a) => {
                  const c = colorFor(a.category);
                  return (
                    <div key={a._id} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: c.bg }} />
                        <span className="text-slate-700 truncate">{a.category}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">{a.percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ESTIMATED REVENUE */}
            {(doc.estimatedRevenue?.low > 0 || doc.estimatedRevenue?.high > 0) && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-2">
                  <FaChartLine /> Estimated 30-day revenue
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {formatPKR(doc.estimatedRevenue.low)}
                  </span>
                  <span className="text-sm text-slate-500">–</span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {formatPKR(doc.estimatedRevenue.high)}
                  </span>
                </div>
                <p className="text-xs text-emerald-800/80 mt-2 leading-relaxed">
                  Realistic range based on this budget tier and product. Actual results depend on execution.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT — allocation rows + tips */}
          <div className="lg:col-span-2 space-y-6">

            {/* ALLOCATION ROWS */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-5 flex items-center justify-between">
                <span className="flex items-center gap-2"><FaCoins className="text-teal-600" /> Where your money goes</span>
                <span className="text-[11px] text-slate-400">Total: {formatPKR(totalAllocated)}</span>
              </h2>

              <div className="space-y-4">
                {allocs.map((a) => (
                  <AllocationRow key={a._id} alloc={a} totalBudget={doc.totalBudget} />
                ))}
              </div>
            </div>

            {/* MONEY-SAVING TIPS */}
            {Array.isArray(doc.tips) && doc.tips.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <FaLightbulb className="text-amber-500" /> Pakistan-specific money tips
                </h2>
                <ul className="space-y-2">
                  {doc.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                      <FaCheckCircle size={11} className="text-emerald-500 shrink-0 mt-1" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CONNECTED ACTIONS */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                Use this budget elsewhere
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ActionCard
                  href={`/match?q=${encodeURIComponent(doc.productType || '')}`}
                  icon={<FaUsers />} title="Find vendors"
                  desc="Discover suppliers within your stock budget"
                />
                <ActionCard
                  href={`/profit?cost=${Math.round((allocs.find(a => a.category === 'Stock')?.amount || 0) / 10) || ''}`}
                  icon={<FaCalculator />} title="Calculate profit"
                  desc="See margins, ROI, break-even"
                />
                <ActionCard
                  href="/trending-products"
                  icon={<FaSearchDollar />} title="Spot trends"
                  desc="Validate your product demand"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

// SVG donut chart — no extra lib, accepts allocations + total.
// Renders one ring slice per allocation in CATEGORY_COLORS.
function DonutChart({ allocations, total }) {
  const size = 200;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumPct = 0;
  const slices = allocations.map((a) => {
    const pct = total > 0 ? (a.amount / total) : 0;
    const dash = pct * circumference;
    const offset = -cumPct * circumference;
    cumPct += pct;
    return { id: a._id, color: colorFor(a.category).bg, dash, offset };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#f1f5f9" strokeWidth={stroke}
        />
        {/* Slices — drawn from 12 o'clock */}
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {slices.map((s) => (
            <circle
              key={s.id}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
        <p className="text-2xl font-extrabold text-slate-900 leading-tight">
          {Number(total).toLocaleString('en-PK')}
        </p>
        <p className="text-[10px] font-bold text-slate-500">PKR</p>
      </div>
    </div>
  );
}

function AllocationRow({ alloc, totalBudget }) {
  const c = colorFor(alloc.category);
  const widthPct = totalBudget > 0 ? Math.round((alloc.amount / totalBudget) * 100) : 0;

  return (
    <div className={`rounded-xl border p-4 ${c.soft}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.bg }}>
            <span className="text-white font-extrabold text-sm">{alloc.percent}%</span>
          </div>
          <p className={`font-bold text-sm sm:text-base ${c.text}`}>{alloc.category}</p>
        </div>
        <p className="font-extrabold text-slate-900 text-base sm:text-lg">
          {formatPKR(alloc.amount)}
        </p>
      </div>
      {alloc.tip && (
        <p className="text-xs text-slate-600 mt-2 leading-relaxed flex items-start gap-1.5">
          <FaLightbulb size={10} className="text-amber-500 shrink-0 mt-0.5" />
          {alloc.tip}
        </p>
      )}
      {/* Visual fill bar showing this category's share of the total */}
      <div className="mt-3 h-1.5 bg-white rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${widthPct}%`, background: c.bg }} />
      </div>
    </div>
  );
}

function Chip({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
      <span className="text-teal-600">{icon}</span>
      {label}
    </span>
  );
}

function ActionCard({ href, icon, title, desc }) {
  return (
    <Link href={href} className="group block bg-slate-50/60 hover:bg-teal-50 border border-slate-100 hover:border-teal-200 rounded-xl p-4 transition">
      <div className="w-9 h-9 rounded-lg bg-white text-teal-600 flex items-center justify-center mb-2 shadow-sm">
        {icon}
      </div>
      <p className="font-bold text-slate-900 text-sm">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{desc}</p>
      <p className="text-[11px] font-bold text-teal-700 mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
        Open <FaArrowRight size={9} />
      </p>
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-2 bg-slate-100" />
          <div className="p-7 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100" />
              <div className="space-y-2 flex-1">
                <div className="h-7 w-48 bg-slate-100 rounded" />
                <div className="h-3 w-32 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-72 animate-pulse" />
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm h-72 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
