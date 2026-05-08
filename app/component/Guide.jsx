'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaSearch, FaExclamationCircle, FaRedo, FaShopify,
  FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp, FaStore,
  FaCheck, FaCheckCircle, FaArrowLeft, FaArrowRight, FaRoad,
  FaTrash, FaArchive, FaListUl, FaTrophy, FaLightbulb
} from 'react-icons/fa';

const PLATFORMS = [
  { key: 'daraz',     name: 'Daraz',              icon: <FaStore />,     bg: 'bg-orange-50',   color: 'text-orange-600',   border: 'border-orange-200' },
  { key: 'shopify',   name: 'Shopify',            icon: <FaShopify />,   bg: 'bg-emerald-50',  color: 'text-emerald-600',  border: 'border-emerald-200' },
  { key: 'instagram', name: 'Instagram Shop',     icon: <FaInstagram />, bg: 'bg-pink-50',     color: 'text-pink-600',     border: 'border-pink-200' },
  { key: 'facebook',  name: 'Facebook',           icon: <FaFacebookF />, bg: 'bg-blue-50',     color: 'text-blue-600',     border: 'border-blue-200' },
  { key: 'tiktok',    name: 'TikTok Shop',        icon: <FaTiktok />,    bg: 'bg-slate-50',    color: 'text-slate-900',    border: 'border-slate-200' },
  { key: 'whatsapp',  name: 'WhatsApp Business',  icon: <FaWhatsapp />,  bg: 'bg-green-50',    color: 'text-green-600',    border: 'border-green-200' },
];

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Guide() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const router = useRouter();
  const search = useSearchParams();

  const ctxPlatform = search.get('platform') || '';
  const ctxRoadmapId = search.get('roadmapId') || '';

  const [platform, setPlatform] = useState(ctxPlatform);
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (ctxPlatform) {
      generate(ctxPlatform);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async (override) => {
    const value = (override ?? platform).trim();
    if (!value) return;
    if (override !== undefined) setPlatform(value);
    setLoading(true); setError(''); setDoc(null);
    try {
      const res = await axios.post(
        `${API}/api/guide`,
        { platform: value, roadmapId: ctxRoadmapId || undefined },
        { headers: { 'Content-Type': 'application/json', ...authHeader() } }
      );
      setDoc(res.data?.guide || null);
      setActivePhaseIdx(0);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) { router.push('/login'); return; }
      setError(err.response?.data?.error || 'Failed to generate guide. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle a task with optimistic update + rollback
  const toggleTask = async (phaseId, taskId, nextDone) => {
    const previous = doc;
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
        `${API}/api/guides/${doc._id}/task`,
        { phaseId, taskId, done: nextDone },
        { headers: { 'Content-Type': 'application/json', ...authHeader() } }
      );
      const updated = res.data?.guide;
      if (updated) {
        setDoc(updated);
        if (updated.status === 'completed' && previous?.status !== 'completed') {
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 4000);
        }
      }
    } catch (err) {
      console.error(err);
      setDoc(previous);
    }
  };

  const remove = async () => {
    if (!doc?._id) return;
    if (!window.confirm('Delete this saved guide?')) return;
    try {
      await axios.delete(`${API}/api/guides/${doc._id}`, { headers: authHeader() });
      setDoc(null);
    } catch { alert('Failed to delete.'); }
  };

  const archive = async () => {
    if (!doc?._id) return;
    try {
      await axios.patch(`${API}/api/guides/${doc._id}`, { status: 'archived' }, {
        headers: { 'Content-Type': 'application/json', ...authHeader() },
      });
      setDoc((d) => d ? { ...d, status: 'archived' } : d);
    } catch { alert('Failed to archive.'); }
  };

  const totalTasks = doc?.phases?.reduce((s, p) => s + (p.tasks?.length || 0), 0) || 0;
  const doneTasks = doc?.phases?.reduce((s, p) => s + (p.tasks || []).filter((t) => t.done).length, 0) || 0;
  const progressPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <section className="max-w-5xl mx-auto relative">

      {celebrate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm pointer-events-none">
          <div className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-md mx-4 pointer-events-auto">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-2xl font-extrabold text-slate-900">Guide complete!</h2>
            <p className="text-slate-500 mt-2">You finished every step. Your store is ready to roll.</p>
            <button onClick={() => setCelebrate(false)} className="mt-5 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-bold transition">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30">
            <FaListUl className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Launch Guide
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Step-by-step checklist tailored to your platform. Tick tasks as you finish them — progress saves automatically.
            </p>
          </div>
        </div>
        <Link
          href="/guide/history"
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <FaListUl size={11} /> Saved guides
        </Link>
      </div>

      {/* ROADMAP CONTEXT */}
      {ctxRoadmapId && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <FaRoad />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">From your roadmap</p>
            <p className="text-sm text-slate-700">Generating launch checklist for your roadmap.</p>
          </div>
          <Link href={`/roadmap/${ctxRoadmapId}`} className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 shrink-0">
            Back to roadmap
          </Link>
        </div>
      )}

      {/* PLATFORM PICKER */}
      {!doc && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Pick a platform
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PLATFORMS.map((p) => (
              <button
                key={p.key}
                onClick={() => generate(p.name)}
                disabled={loading}
                className={`group relative overflow-hidden rounded-xl border-2 p-4 transition text-left ${p.bg} ${p.border} hover:border-teal-400 disabled:opacity-60`}
              >
                <div className={`text-2xl ${p.color} mb-2`}>{p.icon}</div>
                <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Tap to generate</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-teal-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/5 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 w-full bg-slate-100 rounded animate-pulse mb-2" />
          ))}
          <p className="text-teal-600 text-sm font-semibold mt-4 flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            Generating your platform-locked checklist...
          </p>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <FaExclamationCircle />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800">Couldn&apos;t generate guide</p>
            <p className="text-red-700 text-sm mt-0.5">{error}</p>
            <button onClick={() => generate()} className="mt-2 text-red-700 hover:text-red-900 text-sm font-semibold flex items-center gap-1.5">
              <FaRedo size={11} /> Try again
            </button>
          </div>
        </div>
      )}

      {/* RESULT */}
      {!loading && !error && doc && (
        <>
          {/* HERO */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-5">
            <div className="h-2 bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-500" />
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center text-xl shadow-md shadow-teal-600/30">
                    <FaListUl />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600">Launch checklist</p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{doc.platformName}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Created {new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={archive} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-sm font-semibold transition">
                    <FaArchive size={11} /> Archive
                  </button>
                  <button onClick={remove} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-sm font-semibold transition">
                    <FaTrash size={11} /> Delete
                  </button>
                </div>
              </div>
              {doc.overview && (
                <p className="text-slate-600 mt-4 text-sm leading-relaxed">{doc.overview}</p>
              )}
              {/* progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider">Overall progress</span>
                  <span className="font-bold text-slate-700">{doneTasks} / {totalTasks} · {progressPct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* PHASE TRACKER */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
            <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
              {doc.phases.map((p, i) => {
                const total = p.tasks.length;
                const done = p.tasks.filter((t) => t.done).length;
                const complete = total > 0 && done === total;
                const active = activePhaseIdx === i;
                return (
                  <button key={p._id} onClick={() => setActivePhaseIdx(i)} className="flex-1 min-w-[110px] flex flex-col items-center gap-2 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition border-2 ${
                      complete ? 'bg-emerald-500 text-white border-emerald-500' :
                      active ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/40' :
                      'bg-white text-slate-500 border-slate-200 group-hover:border-teal-400'
                    }`}>
                      {complete ? <FaCheck size={12} /> : (i + 1)}
                    </div>
                    <p className={`text-[11px] font-bold text-center ${active ? 'text-teal-700' : 'text-slate-700'}`}>{p.title}</p>
                    <p className="text-[10px] text-slate-400">{done}/{total}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PHASE BODY */}
          {doc.phases[activePhaseIdx] && (
            <PhaseCard
              phase={doc.phases[activePhaseIdx]}
              phaseIdx={activePhaseIdx}
              total={doc.phases.length}
              onToggle={(taskId, next) => toggleTask(doc.phases[activePhaseIdx]._id, taskId, next)}
              onPrev={() => setActivePhaseIdx((i) => Math.max(0, i - 1))}
              onNext={() => setActivePhaseIdx((i) => Math.min(doc.phases.length - 1, i + 1))}
            />
          )}
        </>
      )}
    </section>
  );
}

function PhaseCard({ phase, phaseIdx, total, onToggle, onPrev, onNext }) {
  const totalTasks = phase.tasks.length;
  const done = phase.tasks.filter((t) => t.done).length;
  const pct = totalTasks ? Math.round((done / totalTasks) * 100) : 0;
  const complete = totalTasks > 0 && done === totalTasks;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className={`p-5 sm:p-6 ${complete ? 'bg-emerald-50/40 border-b border-emerald-100' : 'border-b border-slate-100'}`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
              Phase {phaseIdx + 1} of {total}
            </p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 tracking-tight flex items-center gap-2">
              {phase.title}
              {complete && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <FaCheckCircle size={10} /> Complete
                </span>
              )}
            </h3>
            {phase.summary && <p className="text-slate-600 text-sm mt-1.5">{phase.summary}</p>}
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-slate-900">{pct}%</p>
            <p className="text-xs text-slate-500">{done} / {totalTasks} tasks</p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-2">
        {phase.tasks.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-4">No tasks in this phase.</p>
        ) : (
          phase.tasks.map((t) => <TaskRow key={t._id} task={t} onToggle={(next) => onToggle(t._id, next)} />)
        )}
      </div>

      <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-100 bg-slate-50/40">
        <button onClick={onPrev} disabled={phaseIdx === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed">
          <FaArrowLeft size={11} /> Previous phase
        </button>
        <button onClick={onNext} disabled={phaseIdx >= total - 1}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md shadow-teal-600/20 transition disabled:opacity-40 disabled:cursor-not-allowed">
          Next phase <FaArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition ${
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
      </div>
    </div>
  );
}
