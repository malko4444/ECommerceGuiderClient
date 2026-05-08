'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from '@bradgarropy/next-link';
import HeroSection from '../component/HeroSection';
import {
  FaRoad, FaMoneyBillWave, FaSearchDollar, FaChartLine,
  FaStore, FaLayerGroup, FaListUl, FaChalkboardTeacher,
  FaArrowRight, FaHandSparkles, FaMagic, FaTrophy, FaRobot
} from 'react-icons/fa';

const TOOLS = [
  { title: 'AI Vendor Matchmaker', desc: 'Describe your need, get top matches', path: '/match', icon: <FaMagic />, tone: 'teal', featured: true },
  { title: 'AI Mentor Chat', desc: 'Chat with a mentor who knows your roadmap', path: '/mentor', icon: <FaRobot />, tone: 'emerald' },
  { title: 'Startup Roadmap',   desc: 'Phase-by-phase launch plan',        path: '/roadmap',           icon: <FaRoad />,            tone: 'teal' },
  { title: 'Budget Planner',    desc: 'Allocate your PKR smartly',         path: '/budget',            icon: <FaMoneyBillWave />,   tone: 'emerald' },
  { title: 'Trending Products', desc: 'See what\'s selling now',           path: '/trending-products', icon: <FaSearchDollar />,    tone: 'amber' },
  { title: 'Competitor Scan',   desc: 'Analyze rivals in your niche',      path: '/competitor',        icon: <FaChartLine />,       tone: 'purple' },
  { title: 'Profit Calculator', desc: 'ROI, margins, break-even',          path: '/profit',            icon: <FaChartLine />,       tone: 'sky' },
  { title: 'Vendor Directory',  desc: 'Trusted suppliers for sellers',     path: '/vendors',           icon: <FaStore />,           tone: 'pink' },
  { title: 'Platform Advisor',  desc: 'Find the right selling channel',    path: '/platformAdvice',    icon: <FaLayerGroup />,      tone: 'indigo' },
  { title: 'Launch Guide',      desc: 'Step-by-step platform setup',       path: '/guide',             icon: <FaListUl />,          tone: 'orange' },
  { title: 'Tutorials',         desc: 'Learn ads, SEO, packaging & more',  path: '/tutorials',         icon: <FaChalkboardTeacher />, tone: 'rose' },
];

const TONE_STYLES = {
  teal:    { iconBg: 'bg-teal-50',    iconText: 'text-teal-600',    hoverBorder: 'hover:border-teal-300' },
  emerald: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', hoverBorder: 'hover:border-emerald-300' },
  amber:   { iconBg: 'bg-amber-50',   iconText: 'text-amber-600',   hoverBorder: 'hover:border-amber-300' },
  purple:  { iconBg: 'bg-purple-50',  iconText: 'text-purple-600',  hoverBorder: 'hover:border-purple-300' },
  sky:     { iconBg: 'bg-sky-50',     iconText: 'text-sky-600',     hoverBorder: 'hover:border-sky-300' },
  pink:    { iconBg: 'bg-pink-50',    iconText: 'text-pink-600',    hoverBorder: 'hover:border-pink-300' },
  indigo:  { iconBg: 'bg-indigo-50',  iconText: 'text-indigo-600',  hoverBorder: 'hover:border-indigo-300' },
  orange:  { iconBg: 'bg-orange-50',  iconText: 'text-orange-600',  hoverBorder: 'hover:border-orange-300' },
  rose:    { iconBg: 'bg-rose-50',    iconText: 'text-rose-600',    hoverBorder: 'hover:border-rose-300' },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Page() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [checking, setChecking] = useState(true);
  const [activeRoadmap, setActiveRoadmap] = useState(null);

  // Auth + user check runs on client only — localStorage doesn't exist on server
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      if (userData) {
        const parsed = JSON.parse(userData);
        setUserName(parsed?.name || '');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setChecking(false);
    }
  }, [router]);

  // Load the user's active roadmap (if any) so we can surface it on the dashboard.
  useEffect(() => {
    const fetchActive = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/roadmaps/active`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setActiveRoadmap(res.data?.roadmap || null);
      } catch (err) {
        // Silent — dashboard works without this.
      }
    };
    fetchActive();
  }, []);

  if (checking) {
    return (
      <section className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 animate-pulse">
          <div className="h-8 w-1/3 bg-slate-200 rounded mb-3" />
          <div className="h-4 w-1/2 bg-slate-100 rounded" />
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto space-y-8">

      {/* ═══ GREETING BANNER ═══ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-teal-600 to-teal-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-teal-600/30">
        {/* decorative shapes */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <FaHandSparkles /> {greeting()}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            {userName ? `Welcome back, ${userName}!` : 'Welcome to ECommerce Guider!'}
          </h1>
          <p className="text-teal-50/90 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
            Your AI-powered coach for launching and growing an online business in Pakistan.
            Pick a tool below to get started.
          </p>
        </div>
      </div>

      {/* ═══ ACTIVE ROADMAP CARD ═══ */}
      {activeRoadmap && (() => {
        const allTasks = (activeRoadmap.phases || []).flatMap((p) => p.tasks || []);
        const total = allTasks.length;
        const done = allTasks.filter((t) => t.done).length;
        const pct = total ? Math.round((done / total) * 100) : 0;
        return (
          <Link to={`/roadmap/${activeRoadmap._id}`}>
            <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all p-5 sm:p-6 cursor-pointer">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-500" />
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-600/30 shrink-0">
                    <FaTrophy />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600">Continue your roadmap</p>
                    <p className="font-extrabold text-slate-900 text-lg truncate">{activeRoadmap.productType}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{done} / {total} tasks done · {pct}% complete</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block w-32">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-teal-600 group-hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md shadow-teal-600/20 transition">
                    Continue <FaArrowRight size={11} />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })()}

      {/* ═══ HERO SECTION (existing component) ═══ */}
      <HeroSection />

      {/* ═══ QUICK ACTIONS GRID ═══ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Your Toolkit
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Everything you need to build, launch, and grow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool) => {
            const styles = TONE_STYLES[tool.tone];
            return (
              <Link key={tool.path} to={tool.path}>
                <div className={`
                  group bg-white rounded-2xl border border-slate-100 p-5
                  shadow-sm hover:shadow-lg hover:-translate-y-0.5
                  transition-all duration-200 cursor-pointer h-full
                  ${styles.hoverBorder}
                `}>
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg ${styles.iconBg} ${styles.iconText}`}>
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {tool.title}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-snug">
                        {tool.desc}
                      </p>
                    </div>
                    <FaArrowRight className="text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition shrink-0 mt-2" size={12} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ═══ TIP STRIP ═══ */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 text-xl">
          💡
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm">Pro tip for Pakistani sellers</p>
          <p className="text-slate-700 text-sm mt-0.5 leading-relaxed">
            Start with Cash-on-Delivery (COD) on Daraz or Instagram to avoid payment gateway fees
            while you build trust. Once you have 50+ orders, add EasyPaisa/JazzCash as alternatives.
          </p>
        </div>
      </div>
    </section>
  );
}