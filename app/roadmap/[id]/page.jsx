'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FaArrowLeft, FaArrowRight, FaRoad, FaCheck, FaCheckCircle,
  FaCircle, FaTrash, FaArchive, FaTrophy, FaCalendarAlt,
  FaMoneyBillWave, FaMapMarkerAlt, FaUserGraduate, FaStore,
  FaExclamationTriangle, FaLightbulb
} from 'react-icons/fa';

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatPKR = (n) => `PKR ${Number(n || 0).toLocaleString()}`;

export default function RoadmapDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);
  const [linkedBudget, setLinkedBudget] = useState(null);
  const [celebrate, setCelebrate] = useState(false);

  const fetchDoc = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API}/api/roadmaps/${id}`, {
        withCredentials: true, headers: authHeader(),
      });
      setDoc(res.data.roadmap);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) { router.push('/login'); return; }
      setError(err.response?.data?.error || 'Could not load this roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchDoc(); }, [id]);

  // Once the roadmap is loaded, look for a budget that's linked to it.
  useEffect(() => {
    if (!id) return;
    const fetchLinkedBudget = async () => {
      try {
        const res = await axios.get(`${API}/api/budgets/by-roadmap/${id}`, {
          withCredentials: true, headers: authHeader(),
        });
        setLinkedBudget(res.data?.budget || null);
      } catch (err) {
        // Silent — budget link is non-critical UI.
      }
    };
    fetchLinkedBudget();
  }, [id]);


  // Toggle a task — optimistic update with rollback on failure.
  const toggleTask = async (phaseId, taskId, nextDone) => {
    const previous = doc;
    // Optimistic local flip
    setDoc((d) => {
      if (!d) return d;
      const phases = d.phases.map((p) => {
        if (String(p._id) !== String(phaseId)) return p;
        return {
          ...p,
          tasks: p.tasks.map((t) =>
            String(t._id) === String(taskId)
              ? { ...t, done: nextDone, completedAt: nextDone ? new Date().toISOString() : null }
              : t
          ),
        };
      });
      return { ...d, phases };
    });

    try {
      const res = await axios.patch(
        `${API}/api/roadmaps/${id}/task`,
        { phaseId, taskId, done: nextDone },
        { withCredentials: true, headers: authHeader() }
      );
      const updated = res.data.roadmap;
      setDoc(updated);
      // celebrate if everything is now complete
      if (updated.status === 'completed' && previous?.status !== 'completed') {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 4000);
      }
    } catch (err) {
      console.error(err);
      setDoc(previous); // rollback
    }
  };

  const archive = async () => {
    if (!window.confirm('Archive this roadmap? You can find it in My Roadmaps.')) return;
    try {
      await axios.patch(`${API}/api/roadmaps/${id}`, { status: 'archived' }, {
        withCredentials: true, headers: authHeader(),
      });
      router.push('/roadmap/history');
    } catch (err) {
      alert('Failed to archive.');
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this roadmap? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/api/roadmaps/${id}`, {
        withCredentials: true, headers: authHeader(),
      });
      router.push('/roadmap/history');
    } catch (err) {
      alert('Failed to delete.');
    }
  };


  // Inject roadmap context into any task linkTo that points at a tool that
  // benefits from it (e.g. /budget, /match, /profit). Keeps tasks behaving
  // like a personalized cockpit instead of generic shortcuts.
  const enrichLink = (linkTo) => {
    if (!linkTo || !doc) return linkTo || '';
    const params = new URLSearchParams();
    if (linkTo.startsWith('/budget')) {
      if (doc._id) params.set('roadmapId', doc._id);
      if (doc.productType) params.set('productType', doc.productType);
      if (doc.inputs?.budget) params.set('budget', String(doc.inputs.budget));
      if (doc.inputs?.city) params.set('city', doc.inputs.city);
      if (doc.inputs?.platform) params.set('platform', doc.inputs.platform);
      if (doc.inputs?.experience) params.set('experience', doc.inputs.experience);
    } else if (linkTo.startsWith('/match')) {
      if (doc.productType) params.set('q', doc.productType);
    } else if (linkTo.startsWith('/competitor')) {
      if (doc._id) params.set('roadmapId', doc._id);
      if (doc.productType) params.set('product', doc.productType);
    } else if (linkTo.startsWith('/trending-products')) {
      if (doc.productType) params.set('q', doc.productType);
    } else if (linkTo.startsWith('/profit')) {
      if (doc.productType) params.set('product', doc.productType);
      if (doc._id) params.set('roadmapId', doc._id);
    } else if (linkTo.startsWith('/platformAdvice')) {
      if (doc._id) params.set('roadmapId', doc._id);
      if (doc.productType) params.set('goal', `Sell ${doc.productType}`);
    } else if (linkTo.startsWith('/guide')) {
      if (doc._id) params.set('roadmapId', doc._id);
      if (doc.inputs?.platform) params.set('platform', doc.inputs.platform);
    }
    const qs = params.toString();
    return qs ? `${linkTo}${linkTo.includes('?') ? '&' : '?'}${qs}` : linkTo;
  };

  if (loading) return <DetailSkeleton />;
  if (error || !doc) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-red-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-bold text-lg">Roadmap not found</p>
          <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">{error || 'It may have been deleted.'}</p>
          <div className="flex gap-2 justify-center mt-6">
            <Link href="/roadmap/history" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition">
              <FaArrowLeft size={11} /> My Roadmaps
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const allTasks = doc.phases.flatMap((p) => p.tasks);
  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter((t) => t.done).length;
  const progressPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-12 px-4 relative">
      {/* CELEBRATION OVERLAY */}
      {celebrate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm pointer-events-none">
          <div className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-md mx-4 pointer-events-auto">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-2xl font-extrabold text-slate-900">Roadmap complete!</h2>
            <p className="text-slate-500 mt-2">Amazing work. You finished every phase.</p>
            <button
              onClick={() => setCelebrate(false)}
              className="mt-5 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-bold transition"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">

        <Link href="/roadmap/history" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 text-sm font-medium mb-6 transition">
          <FaArrowLeft size={11} /> All my roadmaps
        </Link>

        {/* HERO */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div className="h-2 bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-500" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30 shrink-0">
                  <FaRoad className="text-white text-xl" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600">Roadmap</p>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
                    {doc.productType}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap mt-1.5">
                    <StatusBadge status={doc.status} />
                    <span className="text-xs text-slate-400">
                      Created {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
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

            {doc.overview && (
              <p className="text-slate-600 mt-5 leading-relaxed">{doc.overview}</p>
            )}

            {/* Personalization summary chips */}
            {(doc.inputs?.budget || doc.inputs?.city || doc.inputs?.experience || doc.inputs?.platform || doc.inputs?.hoursPerWeek) > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {doc.inputs?.budget > 0 && <InputChip icon={<FaMoneyBillWave />} label={formatPKR(doc.inputs.budget)} />}
                {doc.inputs?.city && <InputChip icon={<FaMapMarkerAlt />} label={doc.inputs.city} />}
                {doc.inputs?.platform && <InputChip icon={<FaStore />} label={doc.inputs.platform} />}
                {doc.inputs?.experience && <InputChip icon={<FaUserGraduate />} label={doc.inputs.experience.replace(/_/g, ' ')} />}
                {doc.inputs?.hoursPerWeek > 0 && <InputChip icon={<FaCalendarAlt />} label={`${doc.inputs.hoursPerWeek} hrs/week`} />}
              </div>
            )}

            {/* LINKED BUDGET CARD */}
            {linkedBudget && (
              <Link
                href={`/budget/${linkedBudget._id}`}
                className="block mt-5 group bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border border-teal-100 rounded-xl p-4 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white text-teal-700 flex items-center justify-center">
                      <FaMoneyBillWave />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Linked budget</p>
                      <p className="font-extrabold text-slate-900 text-base">PKR {Number(linkedBudget.totalBudget || 0).toLocaleString('en-PK')}</p>
                      <p className="text-xs text-slate-500">{linkedBudget.tier} tier · {(linkedBudget.allocations || []).length} categories</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-700 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Open <FaArrowRight size={10} />
                  </span>
                </div>
              </Link>
            )}

            {/* Estimates */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
              <Stat icon={<FaTrophy />} label="Progress" value={`${doneTasks} / ${totalTasks}`} sub={`${progressPct}% done`} tone="teal" />
              {doc.estimatedDays > 0 && (
                <Stat icon={<FaCalendarAlt />} label="Estimated time" value={`${doc.estimatedDays} days`} sub="to launch" tone="amber" />
              )}
              {(doc.estimatedBudget?.min > 0 || doc.estimatedBudget?.max > 0) && (
                <Stat
                  icon={<FaMoneyBillWave />}
                  label="Estimated budget"
                  value={`${formatPKR(doc.estimatedBudget.min)} – ${formatPKR(doc.estimatedBudget.max)}`}
                  sub=""
                  tone="emerald"
                />
              )}
            </div>

            {/* Master progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-semibold uppercase tracking-wider">Overall progress</span>
                <span className="font-bold text-slate-700">{progressPct}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* PHASE TRACKER (numbered circles) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
            {doc.phases.map((p, i) => {
              const total = p.tasks.length;
              const done = p.tasks.filter((t) => t.done).length;
              const pct = total ? Math.round((done / total) * 100) : 0;
              const complete = total > 0 && done === total;
              const active = activePhaseIdx === i;
              return (
                <button
                  key={p._id}
                  onClick={() => setActivePhaseIdx(i)}
                  className="flex-1 min-w-[140px] flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm transition border-2 ${
                    complete ? 'bg-emerald-500 text-white border-emerald-500' :
                    active ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/40' :
                    'bg-white text-slate-500 border-slate-200 group-hover:border-teal-400'
                  }`}>
                    {complete ? <FaCheck size={13} /> : (i + 1)}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-bold ${active ? 'text-teal-700' : 'text-slate-700'}`}>{p.title}</p>
                    <p className="text-[10px] text-slate-400">{p.weeks}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{done}/{total} · {pct}%</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PHASE CONTENT */}
        {doc.phases[activePhaseIdx] && (
          <PhaseCard
            phase={doc.phases[activePhaseIdx]}
            phaseIdx={activePhaseIdx}
            totalPhases={doc.phases.length}
            onToggleTask={(taskId, next) => toggleTask(doc.phases[activePhaseIdx]._id, taskId, next)}
            onPrev={() => setActivePhaseIdx((i) => Math.max(0, i - 1))}
            onNext={() => setActivePhaseIdx((i) => Math.min(doc.phases.length - 1, i + 1))}
          />
        )}
      </div>
    </section>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function PhaseCard({ phase, phaseIdx, totalPhases, onToggleTask, onPrev, onNext, enrichLink }) {
  const total = phase.tasks.length;
  const done = phase.tasks.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const complete = total > 0 && done === total;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className={`p-5 sm:p-6 ${complete ? 'bg-emerald-50/40 border-b border-emerald-100' : 'border-b border-slate-100'}`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
              Phase {phaseIdx + 1} of {totalPhases} · {phase.weeks}
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight flex items-center gap-2">
              {phase.title}
              {complete && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <FaCheckCircle size={10} /> Complete
                </span>
              )}
            </h2>
            {phase.summary && (
              <p className="text-slate-600 text-sm mt-1.5 max-w-3xl">{phase.summary}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-slate-900">{pct}%</p>
            <p className="text-xs text-slate-500">{done} / {total} tasks</p>
          </div>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
          <div className={`h-full transition-all duration-500 ${complete ? 'bg-emerald-500' : 'bg-gradient-to-r from-teal-400 to-teal-600'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-2">
        {phase.tasks.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-4">No tasks in this phase.</p>
        ) : (
          phase.tasks.map((t) => (
            <TaskRow key={t._id} task={t} onToggle={(next) => onToggleTask(t._id, next)} enrichLink={enrichLink} />
          ))
        )}
      </div>

      {/* Phase nav */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-100 bg-slate-50/40">
        <button
          onClick={onPrev}
          disabled={phaseIdx === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FaArrowLeft size={11} /> Previous phase
        </button>
        <button
          onClick={onNext}
          disabled={phaseIdx >= totalPhases - 1}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md shadow-teal-600/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next phase <FaArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, enrichLink }) {
  return (
    <div className={`group flex items-start gap-3 p-3 rounded-xl border transition ${
      task.done ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100 hover:border-teal-200'
    }`}>
      <button
        onClick={() => onToggle(!task.done)}
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition border-2 ${
          task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-teal-500 bg-white'
        }`}
        title={task.done ? 'Mark not done' : 'Mark done'}
      >
        {task.done ? <FaCheck size={10} /> : null}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${task.done ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
          {task.title}
        </p>
        {task.helpText && !task.done && (
          <p className="text-xs text-slate-500 mt-1 leading-relaxed flex items-start gap-1.5">
            <FaLightbulb size={10} className="text-amber-500 shrink-0 mt-0.5" />
            {task.helpText}
          </p>
        )}
        {task.linkTo && !task.done && (
          <Link
            href={enrichLink ? enrichLink(task.linkTo) : task.linkTo}
            className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-2.5 py-1 rounded-md transition"
          >
            {task.linkLabel || 'Open tool'} <FaArrowRight size={9} />
          </Link>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active:    { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    label: 'Active' },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Completed' },
    archived:  { bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200',   label: 'Archived' },
    draft:     { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Draft' },
  };
  const s = map[status] || map.active;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

function InputChip({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
      <span className="text-teal-600">{icon}</span>
      {label}
    </span>
  );
}

function Stat({ icon, label, value, sub, tone }) {
  const tones = {
    teal:    'bg-teal-50    text-teal-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50   text-amber-600',
  };
  return (
    <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3.5 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-base ${tones[tone] || tones.teal}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-sm font-bold text-slate-900 truncate">{value}</p>
        {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
      </div>
    </div>
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
                <div className="h-5 w-48 bg-slate-100 rounded" />
                <div className="h-3 w-32 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[0,1,2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-64 animate-pulse" />
      </div>
    </section>
  );
}
