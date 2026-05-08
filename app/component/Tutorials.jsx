'use client';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaChalkboardTeacher, FaSearch, FaArrowLeft, FaArrowRight,
  FaBookmark, FaRegBookmark, FaCheckCircle, FaExclamationTriangle,
  FaLightbulb, FaTimesCircle, FaBook, FaFire, FaPlus,
  FaTags, FaLink, FaGraduationCap, FaRoad, FaTrash
} from 'react-icons/fa';

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Color palette per category — must match the backend's TUTORIAL_CATEGORIES.
const CAT_TONE = {
  marketing:  'bg-rose-50    text-rose-700    border-rose-200',
  platform:   'bg-teal-50    text-teal-700    border-teal-200',
  operations: 'bg-purple-50  text-purple-700  border-purple-200',
  logistics:  'bg-amber-50   text-amber-700   border-amber-200',
  sales:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  branding:   'bg-sky-50     text-sky-700     border-sky-200',
  legal:      'bg-slate-100  text-slate-700   border-slate-200',
};

export default function Tutorials() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const router = useRouter();
  const search = useSearchParams();

  const ctxRoadmapId = search.get('roadmapId') || '';
  const initialSlug = search.get('slug') || '';
  const initialTopic = search.get('topic') || '';

  // Tabs: 'browse' (catalog), 'mine' (saved/history), 'detail' (open one)
  const [tab, setTab] = useState('browse');
  const [catalog, setCatalog] = useState({ categories: [], tutorials: [] });
  const [saved, setSaved] = useState([]);
  const [active, setActive] = useState(null); // currently-open tutorial doc
  const [searchQ, setSearchQ] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [freeTopic, setFreeTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Fetch catalog + saved on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [cat, mine] = await Promise.all([
          axios.get(`${API}/api/tutorials/catalog`, { headers: authHeader() }),
          axios.get(`${API}/api/tutorials`, { headers: authHeader() }),
        ]);
        setCatalog(cat.data || { categories: [], tutorials: [] });
        setSaved(mine.data?.tutorials || []);
      } catch (err) {
        if (err.response?.status === 401) { router.push('/login'); return; }
        console.error(err);
        setError('Could not load tutorials.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If URL pre-fills slug or topic, jump straight into detail mode
  useEffect(() => {
    if (initialSlug) generate({ slug: initialSlug });
    else if (initialTopic) generate({ topic: initialTopic });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async ({ slug, topic }) => {
    if (!slug && !topic) return;
    setGenerating(true);
    setError('');
    setTab('detail');
    setActive(null);
    try {
      const res = await axios.post(
        `${API}/api/tutorials`,
        { slug, topic, roadmapId: ctxRoadmapId || undefined },
        { headers: { 'Content-Type': 'application/json', ...authHeader() } }
      );
      const doc = res.data?.tutorial;
      if (!doc) throw new Error('Empty response');
      setActive(doc);
      // Refresh saved list so it appears in My Tutorials
      const mine = await axios.get(`${API}/api/tutorials`, { headers: authHeader() });
      setSaved(mine.data?.tutorials || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate tutorial.');
      setTab('browse');
    } finally {
      setGenerating(false);
    }
  };

  const toggleBookmark = async (id) => {
    try {
      const res = await axios.post(`${API}/api/tutorials/${id}/bookmark`, {}, { headers: authHeader() });
      const bookmarked = res.data?.bookmarked;
      setSaved((s) => s.map((t) => t._id === id ? { ...t, bookmarked } : t));
      if (active && active._id === id) setActive({ ...active, bookmarked });
    } catch { /* swallow */ }
  };

  const deleteTutorial = async (id) => {
    if (!window.confirm('Delete this saved tutorial?')) return;
    try {
      await axios.delete(`${API}/api/tutorials/${id}`, { headers: authHeader() });
      setSaved((s) => s.filter((t) => t._id !== id));
      if (active && active._id === id) { setActive(null); setTab('browse'); }
    } catch { alert('Failed to delete.'); }
  };

  // Filter catalog
  const filteredCatalog = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    let list = catalog.tutorials || [];
    if (activeCategory !== 'all') list = list.filter((t) => t.category === activeCategory);
    if (q) list = list.filter((t) =>
      t.topic.toLowerCase().includes(q) || (t.desc || '').toLowerCase().includes(q)
    );
    return list;
  }, [catalog.tutorials, searchQ, activeCategory]);

  return (
    <section className="max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <FaGraduationCap className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Learning Tutorials
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Curated topics for Pakistani sellers, plus free-form questions. Bookmark to learn at your pace.
            </p>
          </div>
        </div>
      </div>

      {ctxRoadmapId && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <FaRoad />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">From your roadmap</p>
            <p className="text-sm text-slate-700">Tutorials are tailored to your active roadmap context.</p>
          </div>
          <Link href={`/roadmap/${ctxRoadmapId}`} className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 shrink-0">
            Back to roadmap
          </Link>
        </div>
      )}

      {/* TAB BAR */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <TabButton active={tab === 'browse'} onClick={() => setTab('browse')} icon={<FaBook />} label="Browse catalog" />
        <TabButton active={tab === 'mine'} onClick={() => setTab('mine')} icon={<FaBookmark />} label={`My tutorials (${saved.length})`} />
        {(tab === 'detail' || active) && (
          <TabButton active={tab === 'detail'} onClick={() => setTab('detail')} icon={<FaFire />} label={active?.topic || 'Reading'} />
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 mb-4">
          <FaExclamationTriangle className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* BROWSE TAB */}
      {tab === 'browse' && (
        <div className="space-y-5">

          {/* Search + free-topic */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search the catalog..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or ask any topic — e.g. 'WhatsApp catalog setup'"
                value={freeTopic}
                onChange={(e) => setFreeTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && freeTopic.trim() && generate({ topic: freeTopic.trim() })}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition"
              />
              <button
                onClick={() => freeTopic.trim() && generate({ topic: freeTopic.trim() })}
                disabled={!freeTopic.trim() || generating}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <FaPlus size={11} /> Generate
              </button>
            </div>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            <CatChip
              active={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              label="All"
              count={catalog.tutorials?.length || 0}
            />
            {(catalog.categories || []).map((c) => (
              <CatChip
                key={c.id}
                active={activeCategory === c.id}
                onClick={() => setActiveCategory(c.id)}
                label={c.label}
                count={(catalog.tutorials || []).filter((t) => t.category === c.id).length}
                tone={c.color}
              />
            ))}
          </div>

          {/* Catalog grid */}
          {loading && !catalog.tutorials.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-36 animate-pulse" />
              ))}
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <p className="text-slate-700 font-semibold">No catalog topics match.</p>
              <p className="text-slate-500 text-sm mt-1">
                Try a different search, or hit Generate to ask any topic freely.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalog.map((t) => (
                <CatalogCard
                  key={t.slug}
                  t={t}
                  onOpen={() => generate({ slug: t.slug })}
                  alreadySaved={saved.some((s) => s.slug === t.slug)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MY TUTORIALS TAB */}
      {tab === 'mine' && (
        <div>
          {saved.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
                <FaBookmark className="text-rose-500 text-2xl" />
              </div>
              <p className="text-slate-800 font-semibold">No tutorials saved yet</p>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                Open any catalog topic — it auto-saves so you can come back to it later.
              </p>
              <button
                onClick={() => setTab('browse')}
                className="mt-5 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition"
              >
                Browse catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {saved.map((t) => (
                <SavedCard
                  key={t._id}
                  t={t}
                  onOpen={() => { setActive(t); setTab('detail'); }}
                  onBookmark={() => toggleBookmark(t._id)}
                  onDelete={() => deleteTutorial(t._id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL TAB */}
      {tab === 'detail' && (
        <div>
          {generating ? (
            <DetailSkeleton />
          ) : active ? (
            <TutorialDetail
              doc={active}
              onBookmark={() => toggleBookmark(active._id)}
              onDelete={() => deleteTutorial(active._id)}
              onBack={() => setTab('browse')}
              relatedSlugs={(catalog.tutorials || []).filter((t) => t.category === active.category && t.slug !== active.slug).slice(0, 3)}
              onOpenRelated={(slug) => generate({ slug })}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <p className="text-slate-700 font-semibold">No tutorial open.</p>
              <button onClick={() => setTab('browse')} className="mt-3 text-sm font-semibold text-teal-700">
                Browse catalog
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition ${
        active
          ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
          : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:text-teal-700'
      }`}
    >
      <span className="text-xs">{icon}</span>
      {label}
    </button>
  );
}

function CatChip({ active, onClick, label, count, tone }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
        active
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
      }`}
    >
      {label}
      {typeof count === 'number' && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-slate-100'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function CatalogCard({ t, onOpen, alreadySaved }) {
  const tone = CAT_TONE[t.category] || CAT_TONE.platform;
  return (
    <button
      onClick={onOpen}
      className="text-left group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-200 hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
    >
      <div className="h-1.5 bg-gradient-to-r from-teal-400 to-teal-600 group-hover:from-rose-400 group-hover:to-pink-500 transition-colors" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tone}`}>
            {t.category}
          </span>
          {alreadySaved && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
              <FaCheckCircle size={9} /> Saved
            </span>
          )}
        </div>
        <h3 className="font-bold text-slate-900 text-sm leading-snug">{t.topic}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed flex-1">{t.desc}</p>
        <span className="mt-3 text-[12px] font-bold text-teal-700 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
          {alreadySaved ? 'Re-open' : 'Read'} <FaArrowRight size={9} />
        </span>
      </div>
    </button>
  );
}

function SavedCard({ t, onOpen, onBookmark, onDelete }) {
  const tone = CAT_TONE[t.category] || CAT_TONE.platform;
  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all overflow-hidden flex flex-col">
      <div className="h-1.5 bg-gradient-to-r from-teal-400 via-teal-500 to-rose-500" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {t.category && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tone}`}>
                {t.category}
              </span>
            )}
            {t.isCatalog && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                Catalog
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={onBookmark}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition ${
                t.bookmarked ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'text-slate-400 hover:bg-slate-100 hover:text-rose-500'
              }`}
              title={t.bookmarked ? 'Unbookmark' : 'Bookmark'}
            >
              {t.bookmarked ? <FaBookmark size={11} /> : <FaRegBookmark size={11} />}
            </button>
            <button
              onClick={onDelete}
              className="w-7 h-7 rounded-md text-slate-400 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition"
              title="Delete"
            ><FaTrash size={10} /></button>
          </div>
        </div>
        <h3 className="font-bold text-slate-900 text-sm leading-snug">{t.topic}</h3>
        <p className="text-[11px] text-slate-400 mt-1">
          Saved {new Date(t.updatedAt || t.createdAt).toLocaleDateString()}
        </p>
        <button
          onClick={onOpen}
          className="mt-3 inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-md font-semibold text-xs shadow-md shadow-teal-600/20 transition"
        >
          Open <FaArrowRight size={9} />
        </button>
      </div>
    </div>
  );
}

function TutorialDetail({ doc, onBookmark, onDelete, onBack, relatedSlugs, onOpenRelated }) {
  const c = doc.content || {};
  const tone = CAT_TONE[doc.category] || CAT_TONE.platform;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500" />
        <div className="p-6 sm:p-8">
          <button onClick={onBack} className="text-xs text-slate-500 hover:text-teal-700 inline-flex items-center gap-1 mb-3">
            <FaArrowLeft size={9} /> Back to catalog
          </button>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {doc.category && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tone}`}>
                    {doc.category}
                  </span>
                )}
                {doc.isCatalog && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                    <FaTags size={8} /> Catalog
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {doc.topic}
              </h2>
              {c.whatIsIt && <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">{c.whatIsIt}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={onBookmark}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition border ${
                  doc.bookmarked
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-rose-700 hover:border-rose-200'
                }`}
              >
                {doc.bookmarked ? <FaBookmark size={11} /> : <FaRegBookmark size={11} />}
                {doc.bookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-sm font-semibold transition"
              >
                <FaTrash size={11} /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Why it matters */}
      {c.whyItMatters && (
        <Section icon={<FaFire className="text-rose-500" />} title="Why this matters for Pakistani sellers" tone="rose">
          <p className="text-slate-700 leading-relaxed">{c.whyItMatters}</p>
        </Section>
      )}

      {/* Steps */}
      {Array.isArray(c.steps) && c.steps.length > 0 && (
        <Section icon={<FaCheckCircle className="text-teal-600" />} title="Step-by-step" tone="teal">
          <ol className="space-y-2.5">
            {c.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-sm">
                  {i + 1}
                </span>
                <p className="text-slate-700 leading-relaxed pt-0.5">{s}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Tips */}
      {Array.isArray(c.tips) && c.tips.length > 0 && (
        <Section icon={<FaLightbulb className="text-amber-500" />} title="Pakistan-specific tips" tone="amber">
          <ul className="space-y-2">
            {c.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <FaLightbulb className="text-amber-500 mt-1 shrink-0" size={11} />
                <p className="text-slate-700 leading-relaxed">{tip}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Mistakes */}
      {Array.isArray(c.mistakes) && c.mistakes.length > 0 && (
        <Section icon={<FaTimesCircle className="text-rose-600" />} title="Common mistakes" tone="rose">
          <ul className="space-y-2">
            {c.mistakes.map((m, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <FaTimesCircle className="text-rose-500 mt-1 shrink-0" size={11} />
                <p className="text-slate-700 leading-relaxed">{m}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Resources */}
      {Array.isArray(c.resources) && c.resources.length > 0 && (
        <Section icon={<FaLink className="text-sky-600" />} title="Free resources to learn more" tone="sky">
          <ul className="space-y-2">
            {c.resources.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <FaLink className="text-sky-500 mt-1 shrink-0" size={10} />
                <p className="text-slate-700 leading-relaxed">{r}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Related */}
      {Array.isArray(relatedSlugs) && relatedSlugs.length > 0 && (
        <Section icon={<FaBook className="text-purple-600" />} title="Related tutorials" tone="purple">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {relatedSlugs.map((r) => (
              <button
                key={r.slug}
                onClick={() => onOpenRelated(r.slug)}
                className="text-left bg-white border border-slate-100 hover:border-teal-200 rounded-xl p-3 transition shadow-sm hover:shadow-md group"
              >
                <p className="font-bold text-slate-900 text-sm leading-snug">{r.topic}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.desc}</p>
                <span className="mt-2 text-[11px] font-bold text-teal-700 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read <FaArrowRight size={8} />
                </span>
              </button>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ icon, title, tone, children }) {
  const tones = {
    teal:    'border-teal-100',
    rose:    'border-rose-100',
    amber:   'border-amber-100',
    sky:     'border-sky-100',
    purple:  'border-purple-100',
  };
  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${tones[tone] || 'border-slate-100'} p-5 sm:p-6`}>
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-7 h-32 animate-pulse" />
      <div className="bg-white rounded-2xl border border-slate-100 p-6 h-40 animate-pulse" />
      <div className="bg-white rounded-2xl border border-slate-100 p-6 h-48 animate-pulse" />
    </div>
  );
}
