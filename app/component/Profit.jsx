'use client';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FaMoneyBillWave, FaCalculator, FaExclamationCircle,
  FaRedo, FaChartPie, FaArrowUp, FaArrowDown, FaEquals,
  FaUndo, FaHistory, FaRoad, FaCheckCircle, FaTimesCircle,
  FaInfoCircle, FaLightbulb, FaTrophy, FaSave, FaBolt
} from 'react-icons/fa';

const formatPKR = (n) => {
  const num = Number(n);
  if (!num || isNaN(num)) return '0';
  return num.toLocaleString('en-PK');
};

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Local deterministic recalc — must match backend computeMetrics exactly.
function localMetrics({ cost, adBudget, sellingPrice, units }) {
  const c = Number(cost) || 0;
  const a = Number(adBudget) || 0;
  const s = Number(sellingPrice) || 0;
  const u = Number(units) > 0 ? Number(units) : 0;
  if (!c || !s) return null;

  const grossProfit = +(s - c).toFixed(2);
  const margin = s > 0 ? +(((s - c) / s) * 100).toFixed(1) : 0;
  const adPerUnit = u > 0 ? a / u : 0;
  const netProfit = +(grossProfit - adPerUnit).toFixed(2);
  const denom = c + adPerUnit;
  const roi = denom > 0 ? +(((s - c - adPerUnit) / denom) * 100).toFixed(1) : 0;
  const breakEven = grossProfit > 0 ? Math.ceil(a / grossProfit) : 0;
  return { grossProfit, netProfit, margin, roi, breakEven };
}

function localVerdict(margin, roi) {
  if (margin >= 30 && roi >= 50) return 'profitable';
  if (margin <= 0 || roi < 0) return 'loss';
  if (margin < 15 || roi < 15) return 'marginal';
  return 'profitable';
}

export default function Profit() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const search = useSearchParams();

  // Roadmap / budget context from URL.
  const ctxRoadmapId = search.get('roadmapId') || '';
  const ctxBudgetId = search.get('budgetId') || '';
  const ctxProduct = search.get('product') || search.get('productType') || '';
  const ctxCost = search.get('cost') || '';

  const [cost, setCost] = useState(ctxCost);
  const [adBudget, setAdBudget] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [units, setUnits] = useState('');
  const [productType, setProductType] = useState(ctxProduct);

  const [savedDoc, setSavedDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoFilled, setAutoFilled] = useState(false);

  // If we have a budgetId, fetch the budget once so we can suggest cost from
  // its Stock allocation. The backend will also do this server-side, but
  // pre-filling the form helps the user feel the connection.
  useEffect(() => {
    if (!ctxBudgetId) return;
    (async () => {
      try {
        const res = await axios.get(`${API}/api/budgets/${ctxBudgetId}`, {
          withCredentials: true, headers: authHeader(),
        });
        const b = res.data?.budget;
        if (!b) return;
        if (!productType && b.productType) setProductType(b.productType);
        if (!cost) {
          // Suggest a unit cost: Stock allocation ÷ ~100 units default.
          const stockAlloc = (b.allocations || []).find((a) => a.category === 'Stock');
          if (stockAlloc?.amount) {
            const suggestedUnits = 100;
            const suggestedUnitCost = Math.round(stockAlloc.amount / suggestedUnits);
            setCost(String(suggestedUnitCost));
            setUnits(String(suggestedUnits));
            setAutoFilled(true);
          }
        }
      } catch (err) {
        // Silent — pre-fill is non-critical
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxBudgetId]);

  // ═══ Live preview — runs on every keystroke ═══
  const preview = useMemo(
    () => localMetrics({ cost, adBudget, sellingPrice, units }),
    [cost, adBudget, sellingPrice, units]
  );

  const allFilled = cost && adBudget !== '' && sellingPrice;
  const priceWarning = preview && preview.grossProfit <= 0;

  const previewVerdict = preview ? localVerdict(preview.margin, preview.roi) : null;

  const fetchProfit = async () => {
    if (!allFilled) {
      setError('Please fill in cost, ad budget, and selling price.');
      return;
    }
    if (priceWarning) {
      setError('Selling price must be higher than cost.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${API}/api/profit`,
        {
          cost, adBudget, sellingPrice,
          units: units || 0,
          productType,
          roadmapId: ctxRoadmapId || undefined,
          budgetId: ctxBudgetId || undefined,
        },
        { headers: { 'Content-Type': 'application/json', ...authHeader() } }
      );
      setSavedDoc(res.data?.profit || null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to calculate profit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCost(''); setAdBudget(''); setSellingPrice(''); setUnits('');
    setSavedDoc(null); setError('');
  };

  const handleNumeric = (setter) => (e) => {
    setter(e.target.value.replace(/[^\d.]/g, ''));
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
              Profit &amp; ROI Calculator
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Live numbers as you type. Save scenarios. Compare what-ifs.
            </p>
          </div>
        </div>
        <Link
          href="/profit/history"
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <FaHistory size={11} /> Saved scenarios
        </Link>
      </div>

      {/* ROADMAP / BUDGET CONTEXT BANNER */}
      {(ctxRoadmapId || ctxBudgetId) && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <FaRoad />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
              {ctxBudgetId ? 'Linked to your budget' : 'From your roadmap'}
            </p>
            <p className="text-sm text-slate-700">
              {productType
                ? <>Calculating profit for <span className="font-semibold text-teal-700">{productType}</span></>
                : 'Linked context will be saved with this scenario.'}
            </p>
            {autoFilled && (
              <p className="text-[11px] text-emerald-700 mt-0.5 flex items-center gap-1">
                <FaBolt size={9} /> Cost auto-suggested from your budget&apos;s Stock allocation. Adjust as needed.
              </p>
            )}
          </div>
          <Link
            href={ctxBudgetId ? `/budget/${ctxBudgetId}` : `/roadmap/${ctxRoadmapId}`}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 shrink-0"
          >
            Back
          </Link>
        </div>
      )}

      {/* INPUT CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MoneyInput label="Product Cost *" value={cost} onChange={handleNumeric(setCost)} placeholder="0" />
          <MoneyInput label="Ad Budget *" value={adBudget} onChange={handleNumeric(setAdBudget)} placeholder="0" />
          <MoneyInput label="Selling Price *" value={sellingPrice} onChange={handleNumeric(setSellingPrice)} placeholder="0" warning={priceWarning} />
          <NumberInput label="Planned Units" value={units} onChange={handleNumeric(setUnits)} placeholder="e.g. 100" />
        </div>

        {/* What-if sliders for instant local recalc */}
        {preview && !priceWarning && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <FaBolt size={10} className="text-amber-500" /> What-if: drag to test scenarios
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Slider
                label="Selling price"
                value={Number(sellingPrice) || 0}
                min={Number(cost) || 1}
                max={Math.max(Number(sellingPrice) * 3, Number(cost) * 4 || 1000)}
                onChange={(v) => setSellingPrice(String(v))}
                format={formatPKR}
              />
              <Slider
                label="Ad budget"
                value={Number(adBudget) || 0}
                min={0}
                max={Math.max(Number(adBudget) * 3, 50000)}
                onChange={(v) => setAdBudget(String(v))}
                format={formatPKR}
              />
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={fetchProfit}
            disabled={loading || !allFilled || priceWarning}
            className="flex-1 sm:flex-initial bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" /> Calculating...</>
            ) : (
              <><FaSave size={13} /> Calculate &amp; Save</>
            )}
          </button>
          {(cost || adBudget || sellingPrice || savedDoc) && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 px-5 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <FaUndo size={12} /> Reset
            </button>
          )}
        </div>

        {priceWarning && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800 flex items-start gap-2">
            <FaExclamationCircle className="shrink-0 mt-0.5" />
            <span>
              Selling price (PKR {formatPKR(sellingPrice)}) is not higher than cost (PKR {formatPKR(cost)}).
              You will lose money on every unit.
            </span>
          </div>
        )}
      </div>

      {/* LIVE PREVIEW */}
      {preview && !priceWarning && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <PreviewStat
            label="Gross profit"
            value={`PKR ${formatPKR(preview.grossProfit)}`}
            icon={<FaArrowUp />} tone="emerald" sublabel="per unit"
          />
          <PreviewStat
            label="Margin"
            value={`${preview.margin.toFixed(1)}%`}
            icon={<FaChartPie />}
            tone={preview.margin >= 25 ? 'emerald' : preview.margin >= 10 ? 'amber' : 'red'}
            sublabel={
              preview.margin >= 25 ? 'Healthy'
              : preview.margin >= 10 ? 'Marginal'
              : 'Thin'
            }
          />
          <PreviewStat
            label="ROI"
            value={`${preview.roi.toFixed(1)}%`}
            icon={<FaTrophy />}
            tone={preview.roi >= 50 ? 'emerald' : preview.roi >= 15 ? 'amber' : 'red'}
            sublabel="return"
          />
          <PreviewStat
            label="Break-even"
            value={preview.breakEven > 0 ? `${preview.breakEven} units` : '—'}
            icon={<FaEquals />} tone="sky"
            sublabel="recover ads"
          />
          <PreviewStat
            label="Verdict"
            value={previewVerdict ? previewVerdict.charAt(0).toUpperCase() + previewVerdict.slice(1) : '—'}
            icon={previewVerdict === 'profitable' ? <FaCheckCircle /> : previewVerdict === 'loss' ? <FaTimesCircle /> : <FaInfoCircle />}
            tone={previewVerdict === 'profitable' ? 'emerald' : previewVerdict === 'loss' ? 'red' : 'amber'}
            sublabel="live"
          />
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <FaExclamationCircle />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800">Couldn&apos;t calculate</p>
            <p className="text-red-700 text-sm mt-0.5">{error}</p>
            {allFilled && !priceWarning && (
              <button
                onClick={fetchProfit}
                className="mt-2 text-red-700 hover:text-red-900 text-sm font-semibold flex items-center gap-1.5"
              >
                <FaRedo size={11} /> Try again
              </button>
            )}
          </div>
        </div>
      )}

      {/* SAVED RESULT — verdict + advice */}
      {!loading && !error && savedDoc && (
        <SavedResult doc={savedDoc} />
      )}

      {/* EMPTY STATE */}
      {!loading && !error && !savedDoc && !preview && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto mb-3">
            <FaCalculator className="text-teal-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">Do the math before you sell</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Fill in the fields to see live metrics, then save the scenario for comparison later.
          </p>
        </div>
      )}
    </section>
  );
}

// ============================================================
// SAVED RESULT CARD
// ============================================================
function SavedResult({ doc }) {
  const verdictMeta = {
    profitable: { tone: 'emerald', label: 'Profitable', icon: <FaCheckCircle /> },
    marginal:   { tone: 'amber',   label: 'Marginal',   icon: <FaInfoCircle /> },
    loss:       { tone: 'red',     label: 'Loss-making', icon: <FaTimesCircle /> },
    unknown:    { tone: 'slate',   label: 'Unknown',    icon: <FaInfoCircle /> },
  }[doc.verdict] || { tone: 'slate', label: doc.verdict, icon: <FaInfoCircle /> };

  const toneCls = {
    emerald: { hdr: 'bg-emerald-50 border-emerald-200', pill: 'bg-emerald-600 text-white' },
    amber:   { hdr: 'bg-amber-50 border-amber-200',     pill: 'bg-amber-500 text-white' },
    red:     { hdr: 'bg-red-50 border-red-200',         pill: 'bg-red-600 text-white' },
    slate:   { hdr: 'bg-slate-50 border-slate-200',     pill: 'bg-slate-600 text-white' },
  }[verdictMeta.tone];

  return (
    <div className="space-y-5">
      {/* VERDICT BANNER */}
      <div className={`rounded-2xl border p-5 sm:p-6 flex items-start gap-4 ${toneCls.hdr}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${toneCls.pill} shrink-0 shadow-md`}>
          {verdictMeta.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${toneCls.pill}`}>
              {verdictMeta.label}
            </span>
            <span className="text-[11px] text-slate-500">Saved · {new Date(doc.createdAt).toLocaleString()}</span>
          </div>
          {doc.verdictReason && (
            <p className="text-sm text-slate-700 leading-relaxed">{doc.verdictReason}</p>
          )}
        </div>
      </div>

      {/* METRIC CARDS (canonical from backend) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MetricCard label="Gross profit" value={`PKR ${formatPKR(doc.grossProfit)}`} sub="per unit" tone="emerald" />
        <MetricCard label="Net profit"  value={`PKR ${formatPKR(doc.netProfit)}`}  sub={doc.units > 0 ? `after ad/unit (${doc.units} units)` : 'no units set'} tone="teal" />
        <MetricCard label="Margin"      value={`${doc.margin}%`}  sub="of selling price" tone={doc.margin >= 25 ? 'emerald' : doc.margin >= 10 ? 'amber' : 'red'} />
        <MetricCard label="ROI"         value={`${doc.roi}%`}      sub="return on cost+ads" tone={doc.roi >= 50 ? 'emerald' : doc.roi >= 15 ? 'amber' : 'red'} />
        <MetricCard label="Break-even"  value={doc.breakEven > 0 ? `${doc.breakEven} units` : '—'} sub="to recover ads" tone="sky" />
      </div>

      {/* RECOMMENDATIONS */}
      {Array.isArray(doc.recommendations) && doc.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <FaLightbulb className="text-amber-500" /> AI recommendations
          </h3>
          <ul className="space-y-2">
            {doc.recommendations.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                <FaCheckCircle size={11} className="text-emerald-500 shrink-0 mt-1" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function MoneyInput({ label, value, onChange, placeholder, warning }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm pointer-events-none">PKR</span>
        <input
          type="text" inputMode="numeric" value={value} onChange={onChange} placeholder={placeholder}
          className={`w-full pl-14 pr-3 py-3 rounded-xl border transition font-semibold text-slate-900 focus:ring-2 outline-none ${
            warning
              ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500/40 bg-amber-50/50'
              : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/40'
          }`}
        />
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type="text" inputMode="numeric" value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40 transition font-semibold text-slate-900 outline-none"
      />
    </div>
  );
}

function Slider({ label, value, min, max, onChange, format }) {
  const safeMax = Math.max(max, min + 1);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        <span className="text-xs font-bold text-slate-700">PKR {format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={safeMax}
        step={Math.max(1, Math.floor((safeMax - min) / 100))}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-600"
      />
    </div>
  );
}

function PreviewStat({ label, value, icon, tone, sublabel }) {
  const tones = {
    teal:    { bg: 'bg-teal-50',    text: 'text-teal-700',    icon: 'text-teal-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600' },
    sky:     { bg: 'bg-sky-50',     text: 'text-sky-700',     icon: 'text-sky-600' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   icon: 'text-amber-600' },
    red:     { bg: 'bg-red-50',     text: 'text-red-700',     icon: 'text-red-600' },
  };
  const t = tones[tone] || tones.teal;
  return (
    <div className="rounded-xl p-3 sm:p-4 border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.bg} ${t.icon} text-xs`}>{icon}</div>
        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">{label}</p>
      </div>
      <p className={`text-base sm:text-lg font-extrabold ${t.text} truncate`}>{value}</p>
      {sublabel && <p className="text-[10px] text-slate-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}

function MetricCard({ label, value, sub, tone }) {
  const tones = {
    teal:    'border-teal-100 bg-teal-50',
    emerald: 'border-emerald-100 bg-emerald-50',
    sky:     'border-sky-100 bg-sky-50',
    amber:   'border-amber-100 bg-amber-50',
    red:     'border-red-100 bg-red-50',
  };
  const valueTones = {
    teal:    'text-teal-700',
    emerald: 'text-emerald-700',
    sky:     'text-sky-700',
    amber:   'text-amber-700',
    red:     'text-red-700',
  };
  return (
    <div className={`rounded-xl p-3 sm:p-4 border ${tones[tone] || tones.teal}`}>
      <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">{label}</p>
      <p className={`text-base sm:text-xl font-extrabold ${valueTones[tone] || valueTones.teal} truncate mt-1`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}
