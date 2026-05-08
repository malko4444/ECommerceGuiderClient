'use client';
import React from 'react';
import Link from '@bradgarropy/next-link';
import {
  FaRoad, FaMoneyBillWave, FaSearchDollar, FaChartLine,
  FaStore, FaLayerGroup, FaListUl, FaChalkboardTeacher,
  FaCheckCircle, FaArrowRight, FaStar, FaBolt,
  FaShopify, FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp,
  FaLightbulb, FaRocket, FaCalculator, FaFire,
  FaSeedling, FaCrown
} from 'react-icons/fa';

// ════════════════════════════════════════
// DATA
// ════════════════════════════════════════
const TOOLS = [
  { title: 'Startup Roadmap',   desc: 'Phase-by-phase launch plan tailored to your product',    icon: <FaRoad />,            tone: 'teal' },
  { title: 'Budget Planner',    desc: 'Smart PKR allocation across stock, ads, and logistics',  icon: <FaMoneyBillWave />,   tone: 'emerald' },
  { title: 'Trending Products', desc: "See what's selling right now in your category",          icon: <FaFire />,            tone: 'orange' },
  { title: 'Competitor Scan',   desc: 'Real stores, their pricing, and positioning',            icon: <FaChartLine />,       tone: 'purple' },
  { title: 'Profit Calculator', desc: 'Margins, ROI, break-even — instant math before you sell',icon: <FaCalculator />,      tone: 'sky' },
  { title: 'Vendor Directory',  desc: 'Trusted suppliers and wholesalers across Pakistan',      icon: <FaStore />,           tone: 'pink' },
  { title: 'Platform Advisor',  desc: 'Find the best channel for your goal',                    icon: <FaLightbulb />,       tone: 'amber' },
  { title: 'Launch Guide',      desc: 'Step-by-step setup for Daraz, Shopify, Instagram & more',icon: <FaRocket />,          tone: 'indigo' },
  { title: 'Learning Center',   desc: 'Tutorials on ads, SEO, packaging, customer service',     icon: <FaChalkboardTeacher />, tone: 'rose' },
];

const TONE_STYLES = {
  teal:    'bg-teal-50    text-teal-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  orange:  'bg-orange-50  text-orange-600',
  purple:  'bg-purple-50  text-purple-600',
  sky:     'bg-sky-50     text-sky-600',
  pink:    'bg-pink-50    text-pink-600',
  amber:   'bg-amber-50   text-amber-600',
  indigo:  'bg-indigo-50  text-indigo-600',
  rose:    'bg-rose-50    text-rose-600',
};

const PLATFORMS = [
  { name: 'Daraz',     icon: <FaStore />,     color: 'text-orange-600' },
  { name: 'Shopify',   icon: <FaShopify />,   color: 'text-emerald-600' },
  { name: 'Instagram', icon: <FaInstagram />, color: 'text-pink-600' },
  { name: 'Facebook',  icon: <FaFacebookF />, color: 'text-blue-600' },
  { name: 'TikTok',    icon: <FaTiktok />,    color: 'text-slate-900' },
  { name: 'WhatsApp',  icon: <FaWhatsapp />,  color: 'text-green-600' },
];

// ════════════════════════════════════════
// PAGE
// ════════════════════════════════════════
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ═══ STICKY NAV ═══ */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md shadow-teal-600/30">
              <FaStore className="text-white text-sm" />
            </div>
            <div className="leading-tight">
              <p className="font-extrabold text-slate-900 text-sm sm:text-base">ECommerce Guider</p>
              <p className="text-[10px] text-slate-500 -mt-0.5 hidden sm:block">Pakistan&apos;s AI seller coach</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/pricing">
              <button className="hidden sm:inline-flex text-slate-700 hover:text-teal-700 font-semibold px-3 sm:px-4 py-2 text-sm transition">
                Pricing
              </button>
            </Link>
            <Link to="/login">
              <button className="text-slate-700 hover:text-teal-700 font-semibold px-3 sm:px-4 py-2 text-sm transition">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-md shadow-teal-600/20 transition">
                Sign up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50/40" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-12 items-center">

            {/* Left — Copy */}
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-800 px-3 py-1.5 rounded-full text-xs font-semibold mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
                </span>
                Built for Pakistani sellers · PKR-native
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.05]">
                Launch your online business in Pakistan —
                <span className="block text-teal-700 italic mt-2">with AI by your side.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 mt-5 leading-relaxed max-w-xl">
                Roadmaps, budgets in PKR, competitor scans, profit calculators — built for Daraz, Shopify,
                Instagram, and every channel Pakistani sellers use. Plan smart, launch fast, grow with data.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link to="/signup">
                  <button className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-xl shadow-teal-600/30 transition flex items-center justify-center gap-2 text-base">
                    Start free <FaArrowRight size={13} />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-6 py-3.5 rounded-xl shadow-sm transition text-base">
                    I have an account
                  </button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-7 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <FaCheckCircle className="text-teal-600" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <FaCheckCircle className="text-teal-600" />
                  <span>10 AI tools</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <FaCheckCircle className="text-teal-600" />
                  <span>COD, EasyPaisa, JazzCash</span>
                </div>
              </div>
            </div>

            {/* Right — Floating preview cards */}
            <div className="lg:col-span-2 relative h-[340px] sm:h-[420px] hidden sm:block">
              {/* Card 1 — Roadmap */}
              <div className="absolute top-0 right-0 w-60 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100 p-4 rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <FaRoad size={14} />
                  </div>
                  <p className="font-bold text-slate-900 text-sm">Roadmap</p>
                </div>
                <p className="text-xs text-slate-500 mb-3">Clothing business · Pakistan</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <FaCheckCircle className="text-teal-500" size={10} /> Phase 1 · Setup
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <FaCheckCircle className="text-teal-500" size={10} /> Phase 2 · Sourcing
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-2.5 h-2.5 border border-slate-300 rounded-full" /> Phase 3 · Launch
                  </div>
                </div>
              </div>

              {/* Card 2 — Budget */}
              <div className="absolute top-24 left-0 w-56 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100 p-4 -rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FaMoneyBillWave size={14} />
                  </div>
                  <p className="font-bold text-slate-900 text-sm">Budget</p>
                </div>
                <p className="text-2xl font-black text-slate-900">PKR 25,000</p>
                <p className="text-xs text-slate-500 mt-0.5 mb-2">Medium budget tier</p>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-emerald-400 to-teal-500" />
                </div>
              </div>

              {/* Card 3 — Profit */}
              <div className="absolute bottom-0 right-6 w-52 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100 p-4 rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <FaCalculator size={14} />
                  </div>
                  <p className="font-bold text-slate-900 text-sm">Margin</p>
                </div>
                <p className="text-2xl font-black text-emerald-600">42%</p>
                <p className="text-xs text-slate-500 mt-0.5">Healthy · ROI 2.1x</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ QUICK STATS STRIP ═══ */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-black text-teal-700">10</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">AI Tools</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-teal-700">6+</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Platforms</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-teal-700">PKR</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Native</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-teal-700">24/7</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Mentor Chat</p>
          </div>
        </div>
      </section>

      {/* ═══ TOOLS / FEATURES ═══ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <FaBolt size={10} /> Your complete toolkit
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Everything you need. <br className="hidden sm:block" />
            <span className="text-teal-700">In one place.</span>
          </h2>
          <p className="text-slate-500 mt-4 max-w-xl mx-auto">
            From your first product idea to your 100th sale — every stage has a dedicated AI tool to guide you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool) => (
            <div
              key={tool.title}
              className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all duration-200"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-4 ${TONE_STYLES[tool.tone]}`}>
                {tool.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {tool.title}
              </h3>
              <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                {tool.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Start selling in <span className="text-teal-700 italic">3 steps.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Tell us your idea', desc: 'Describe what you want to sell — clothing, electronics, anything.' },
              { step: '02', title: 'Get your plan',      desc: 'Personalized roadmap, budget, and platform advice in seconds.' },
              { step: '03', title: 'Launch & grow',      desc: 'Follow step-by-step checklists and track your profit as you scale.' },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-full">
                  <p className="text-5xl font-black bg-gradient-to-br from-teal-500 to-teal-700 bg-clip-text text-transparent">
                    {s.step}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 mt-3">{s.title}</h3>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">{s.desc}</p>
                </div>
                {i < 2 && (
                  <FaArrowRight className="hidden md:block absolute top-1/2 -right-5 -translate-y-1/2 text-teal-300 text-2xl z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLATFORMS SUPPORTED ═══ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Works with every channel Pakistani sellers use
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {PLATFORMS.map((p) => (
            <div key={p.name} className="flex items-center gap-2 opacity-70 hover:opacity-100 transition">
              <span className={`text-2xl sm:text-3xl ${p.color}`}>{p.icon}</span>
              <span className="font-bold text-slate-700 text-sm sm:text-base">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PRICING SECTION ═══ */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-16 sm:py-24 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <FaBolt size={10} /> Simple, transparent pricing
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Plans that grow <span className="text-teal-700 italic">with you.</span>
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              Start free. Upgrade only when your sales need more horsepower. No card required to begin.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">

            {/* STARTER */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition flex flex-col">
              <div className="p-7 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center text-lg">
                    <FaSeedling />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-lg leading-tight">Starter</p>
                    <p className="text-xs text-slate-500">Try the platform — no card needed</p>
                  </div>
                </div>
                <p className="text-5xl font-black text-slate-900 tracking-tight mt-5">Free</p>
                <p className="text-xs text-slate-400 mt-1">Forever</p>
                <Link to="/signup">
                  <button className="mt-5 w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-5 py-3 rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-2">
                    Start free <FaArrowRight size={11} />
                  </button>
                </Link>
              </div>
              <div className="border-t border-slate-100 p-7 pt-5 flex-1">
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700">5 AI tool runs / month</span></li>
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700">Browse vendor directory</span></li>
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700">5 saved vendors with notes</span></li>
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700">2 vendor inquiries / month</span></li>
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700">Read all reviews</span></li>
                </ul>
              </div>
            </div>

            {/* PRO — featured */}
            <div className="relative bg-white rounded-3xl border border-slate-100 ring-2 ring-teal-500 shadow-lg shadow-teal-500/15 flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md shadow-teal-500/40">
                  Most Popular
                </span>
              </div>
              <div className="p-7 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-lg">
                    <FaRocket />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-lg leading-tight">Pro</p>
                    <p className="text-xs text-slate-500">For sellers shipping every week</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap mt-5">
                  <span className="text-[15px] font-bold text-slate-400">PKR</span>
                  <span className="text-5xl font-black text-slate-900 tracking-tight">1,499</span>
                  <span className="text-sm font-semibold text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Or PKR 1,249/mo billed yearly</p>
                <Link to="/signup">
                  <button className="mt-5 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-3 rounded-xl text-sm shadow-md shadow-teal-600/30 transition flex items-center justify-center gap-2">
                    Go Pro <FaArrowRight size={11} />
                  </button>
                </Link>
              </div>
              <div className="border-t border-slate-100 p-7 pt-5 flex-1">
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700"><b>100 AI tool runs</b> / month</span></li>
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700"><b>15 AI Matchmaker</b> searches / mo</span></li>
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700">Unlimited saved vendors + notes</span></li>
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700">30 inquiries / month</span></li>
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700">Write reviews + email support</span></li>
                </ul>
              </div>
            </div>

            {/* BUSINESS */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition flex flex-col">
              <div className="p-7 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                    <FaCrown />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-lg leading-tight">Business</p>
                    <p className="text-xs text-slate-500">For agencies and power users</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap mt-5">
                  <span className="text-[15px] font-bold text-slate-400">PKR</span>
                  <span className="text-5xl font-black text-slate-900 tracking-tight">4,999</span>
                  <span className="text-sm font-semibold text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Or PKR 4,166/mo billed yearly</p>
                <Link to="/signup">
                  <button className="mt-5 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2">
                    Contact sales <FaArrowRight size={11} />
                  </button>
                </Link>
              </div>
              <div className="border-t border-slate-100 p-7 pt-5 flex-1">
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700"><b>Unlimited</b> AI tool runs</span></li>
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700"><b>Unlimited</b> matchmaker + inquiries</span></li>
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700">5 team seats included</span></li>
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700">Excel / CSV export</span></li>
                  <li className="flex items-start gap-2.5"><FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} /><span className="text-slate-700">Priority support (24h)</span></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/pricing">
              <button className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 font-bold text-sm transition">
                See full feature comparison <FaArrowRight size={11} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-2xl shadow-teal-900/30">
          {/* decorative */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute top-8 right-8 hidden sm:flex gap-1">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="text-amber-300" size={14} />
            ))}
          </div>

          <div className="relative max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Ready to turn your idea into income?
            </h2>
            <p className="text-teal-50/90 mt-4 text-base sm:text-lg leading-relaxed">
              Join Pakistani sellers using AI to plan, launch, and grow faster. Free to start — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <Link to="/signup">
                <button className="w-full sm:w-auto bg-white text-teal-700 font-bold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition flex items-center justify-center gap-2">
                  Create free account <FaArrowRight size={13} />
                </button>
              </Link>
              <Link to="/login">
                <button className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold px-7 py-3.5 rounded-xl transition">
                  Login instead
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <FaStore className="text-white text-xs" />
            </div>
            <p className="text-sm font-semibold text-slate-700">ECommerce Guider</p>
            <span className="text-slate-300">·</span>
            <p className="text-xs text-slate-500">Made for Pakistan 🇵🇰</p>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ECommerce Guider. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}