'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  FaStore, FaCheck, FaArrowRight, FaCheckCircle, FaTimes,
  FaCrown, FaRocket, FaSeedling, FaQuestionCircle, FaBolt,
  FaShieldAlt, FaUsers, FaHeadset
} from 'react-icons/fa';
import { FaWandMagicSparkles } from 'react-icons/fa6';

// ════════════════════════════════════════════════
// TIERS — aligned to backend cost drivers
// AI tool calls = OpenAI tokens; Tavily-backed tools (trending,
// competitor) cost more, so they have their own tier limits.
// ════════════════════════════════════════════════
const TIERS = [
  {
    id: 'free',
    name: 'Starter',
    tagline: 'Try the platform — no card needed',
    monthly: 0,
    yearly: 0,
    icon: <FaSeedling />,
    accent: 'slate',
    cta: 'Start free',
    ctaHref: '/signup',
    highlight: false,
    bullets: [
      { ok: true,  text: '5 AI tool runs per month' },
      { ok: true,  text: 'Browse the full vendor directory' },
      { ok: true,  text: '5 saved vendors with notes' },
      { ok: true,  text: '2 vendor inquiries per month' },
      { ok: true,  text: 'Read reviews' },
      { ok: false, text: 'AI Vendor Matchmaker' },
      { ok: false, text: 'Trending Products + Competitor Scan' },
      { ok: false, text: 'Email support' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For serious sellers shipping every week',
    monthly: 1499,
    yearly: 14990, // 10 months — 2 free
    icon: <FaRocket />,
    accent: 'teal',
    cta: 'Go Pro',
    ctaHref: '/signup?plan=pro',
    highlight: true,
    badge: 'Most Popular',
    bullets: [
      { ok: true,  text: '100 AI tool runs per month' },
      { ok: true,  text: 'Unlimited saved vendors + private notes' },
      { ok: true,  text: '30 vendor inquiries per month' },
      { ok: true,  text: '15 AI Matchmaker searches / mo' },
      { ok: true,  text: '30 Trending + Competitor scans / mo' },
      { ok: true,  text: 'Write reviews' },
      { ok: true,  text: 'Email support' },
      { ok: false, text: 'Team seats & Excel export' },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'For agencies, teams, and power users',
    monthly: 4999,
    yearly: 49990,
    icon: <FaCrown />,
    accent: 'amber',
    cta: 'Contact sales',
    ctaHref: '/signup?plan=business',
    highlight: false,
    bullets: [
      { ok: true, text: 'Unlimited AI tool runs' },
      { ok: true, text: 'Unlimited inquiries & matchmaker' },
      { ok: true, text: 'Unlimited Trending + Competitor scans' },
      { ok: true, text: '5 team seats included' },
      { ok: true, text: 'Export vendors to Excel / CSV' },
      { ok: true, text: 'Priority support (24h response)' },
      { ok: true, text: 'Featured listing for own vendor' },
      { ok: true, text: 'Early access to new features' },
    ],
  },
];

// ════════════════════════════════════════════════
// COMPARISON TABLE ROWS
// ════════════════════════════════════════════════
const COMPARE_ROWS = [
  { group: 'AI Tools', rows: [
    { label: 'Startup Roadmap, Budget, Profit Calculator, Platform Advisor, Launch Guide, Tutorials, Mentor Chat', free: '5 / month', pro: '100 / month', business: 'Unlimited' },
    { label: 'AI Vendor Matchmaker (find vendors with one sentence)', free: '—', pro: '15 / month', business: 'Unlimited' },
    { label: 'Trending Products + Competitor Scan (live web search)', free: '—', pro: '30 / month', business: 'Unlimited' },
  ]},
  { group: 'Vendor Directory', rows: [
    { label: 'Browse all vendors', free: '✓', pro: '✓', business: '✓' },
    { label: 'Saved vendors with private notes', free: '5 max', pro: 'Unlimited', business: 'Unlimited' },
    { label: 'Send inquiries to vendors', free: '2 / month', pro: '30 / month', business: 'Unlimited' },
    { label: 'Write reviews & rate vendors', free: '—', pro: '✓', business: '✓' },
    { label: 'Featured listing for own vendor', free: '—', pro: '—', business: '✓' },
  ]},
  { group: 'Workspace', rows: [
    { label: 'Team seats', free: '1', pro: '1', business: '5' },
    { label: 'Export data to Excel / CSV', free: '—', pro: '—', business: '✓' },
    { label: 'Inquiry history & analytics', free: '—', pro: 'Basic', business: 'Advanced' },
  ]},
  { group: 'Support', rows: [
    { label: 'Help center & docs', free: '✓', pro: '✓', business: '✓' },
    { label: 'Email support', free: '—', pro: '✓', business: 'Priority (24h)' },
    { label: 'Early access to new features', free: '—', pro: '—', business: '✓' },
  ]},
];

const FAQS = [
  {
    q: 'What payment methods will you support?',
    a: 'We are integrating local Pakistani gateways including JazzCash, EasyPaisa, and bank transfer, plus international cards via Stripe. The pricing here is the planned launch pricing; nothing is charged yet.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes — upgrade any time and the new limits apply immediately. Downgrades take effect at the end of your billing cycle.',
  },
  {
    q: 'What happens when I hit a usage limit?',
    a: 'You will see a friendly upgrade prompt instead of an error. Free-tier users can wait for the next month or upgrade to Pro to keep working.',
  },
  {
    q: 'Do unused AI runs roll over?',
    a: 'No — AI runs reset monthly. Pricing is set so most active sellers never hit the Pro cap.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Yes — full refund within the first 7 days, no questions asked. After that, refunds are pro-rated for unused months on annual plans.',
  },
  {
    q: 'I am a vendor — can I list my business?',
    a: 'Vendor self-listing is on the roadmap. For now, contact us to be added manually.',
  },
];

// ════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════
export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md shadow-teal-600/30">
              <FaStore className="text-white text-sm" />
            </div>
            <p className="font-extrabold text-slate-900 text-sm sm:text-base">ECommerce Guider</p>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-slate-700 hover:text-teal-700 font-semibold px-3 sm:px-4 py-2 text-sm transition">
              Login
            </Link>
            <Link href="/signup" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-md shadow-teal-600/20 transition">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50/40" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-800 px-3 py-1.5 rounded-full text-xs font-semibold mb-5">
            <FaBolt size={10} /> Simple, transparent pricing in PKR
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.05]">
            Plans that grow <span className="text-teal-700 italic">with your store.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-5 max-w-2xl mx-auto leading-relaxed">
            Start free. Upgrade only when your sales need more horsepower. No credit card to begin.
          </p>

          {/* Monthly/Yearly toggle */}
          <div className="inline-flex items-center gap-3 mt-9 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition ${
                !yearly ? 'bg-teal-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${
                yearly ? 'bg-teal-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                yearly ? 'bg-amber-300 text-amber-900' : 'bg-emerald-100 text-emerald-700'
              }`}>
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-10 pb-16 sm:pb-20 relative z-10">
        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {TIERS.map((tier) => (
            <PricingCard key={tier.id} tier={tier} yearly={yearly} />
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 max-w-2xl mx-auto">
          Pricing shown is the planned launch price. We are integrating JazzCash, EasyPaisa, bank transfer, and Stripe — so you can pay the way that suits you. Pakistan launch · Q3 2026.
        </p>
      </section>

      {/* COMPARISON TABLE */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-16 sm:py-20 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Compare every <span className="text-teal-700 italic">feature.</span>
            </h2>
            <p className="text-slate-500 mt-3">Side-by-side breakdown of what each plan unlocks.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="text-left px-5 py-4 font-bold text-slate-700 w-1/2">Feature</th>
                    <th className="px-5 py-4 font-bold text-slate-700">Starter</th>
                    <th className="px-5 py-4 font-bold text-teal-700 bg-teal-50/40">Pro</th>
                    <th className="px-5 py-4 font-bold text-amber-700">Business</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((g, gi) => (
                    <React.Fragment key={g.group}>
                      <tr className="bg-slate-50/60">
                        <td colSpan={4} className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {g.group}
                        </td>
                      </tr>
                      {g.rows.map((r, i) => (
                        <tr key={`${gi}-${i}`} className="border-t border-slate-100">
                          <td className="px-5 py-3 text-slate-700">{r.label}</td>
                          <td className="px-5 py-3 text-center"><CompareCell value={r.free} /></td>
                          <td className="px-5 py-3 text-center bg-teal-50/30"><CompareCell value={r.pro} highlight /></td>
                          <td className="px-5 py-3 text-center"><CompareCell value={r.business} /></td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid md:grid-cols-3 gap-5">
          <TrustBadge icon={<FaShieldAlt />}  title="7-day money-back" desc="Full refund in your first week — no questions asked." tone="emerald" />
          <TrustBadge icon={<FaUsers />}      title="No credit card"   desc="Start free. Add a card only when you need more." tone="teal" />
          <TrustBadge icon={<FaHeadset />}    title="Local support"    desc="Pakistan-based team. WhatsApp & email reply same day." tone="amber" />
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <FaQuestionCircle size={10} /> Frequently asked
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Questions, answered.
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <button
                key={i}
                onClick={() => setOpenFaq(open ? -1 : i)}
                className={`w-full text-left bg-white rounded-2xl border p-5 transition ${
                  open ? 'border-teal-300 shadow-md' : 'border-slate-100 hover:border-teal-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-bold text-slate-900 text-base sm:text-lg">{f.q}</p>
                  <span className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition shrink-0 ${
                    open ? 'bg-teal-600 text-white rotate-45' : 'bg-slate-100 text-slate-500'
                  }`}>+</span>
                </div>
                {open && (
                  <p className="text-slate-600 text-sm mt-3 leading-relaxed">{f.a}</p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-2xl shadow-teal-900/30">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5" />

          <div className="relative max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Start free today. Upgrade only when you grow.
            </h2>
            <p className="text-teal-50/90 mt-4 text-base sm:text-lg leading-relaxed">
              Join sellers using AI to plan, source, launch, and grow. No card required to start.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <Link href="/signup" className="w-full sm:w-auto bg-white text-teal-700 font-bold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition flex items-center justify-center gap-2">
                Create free account <FaArrowRight size={13} />
              </Link>
              <Link href="/login" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold px-7 py-3.5 rounded-xl transition text-center">
                Login instead
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <FaStore className="text-white text-xs" />
            </div>
            <p className="text-sm font-semibold text-slate-700">ECommerce Guider</p>
            <span className="text-slate-300">·</span>
            <p className="text-xs text-slate-500">Made for Pakistan</p>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ECommerce Guider. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════

function PricingCard({ tier, yearly }) {
  const monthly = tier.monthly;
  const yearlyPrice = tier.yearly;
  // What we show as the "per month" price under the big number
  const displayPerMonth = yearly && yearlyPrice
    ? Math.round(yearlyPrice / 12)
    : monthly;

  const accentMap = {
    teal:   { ring: 'ring-2 ring-teal-500',        bg: 'bg-teal-50',    text: 'text-teal-600',    btn: 'bg-teal-600 hover:bg-teal-700 text-white' },
    amber:  { ring: '',                            bg: 'bg-amber-50',   text: 'text-amber-600',   btn: 'bg-slate-900 hover:bg-slate-800 text-white' },
    slate:  { ring: '',                            bg: 'bg-slate-50',   text: 'text-slate-600',   btn: 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700' },
  };
  const accent = accentMap[tier.accent] || accentMap.slate;

  return (
    <div className={`relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition flex flex-col ${tier.highlight ? 'ring-2 ring-teal-500 shadow-lg shadow-teal-500/15' : ''}`}>
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md shadow-teal-500/40">
            {tier.badge}
          </span>
        </div>
      )}

      <div className="p-7 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${accent.bg} ${accent.text}`}>
            {tier.icon}
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-lg leading-tight">{tier.name}</p>
            <p className="text-xs text-slate-500">{tier.tagline}</p>
          </div>
        </div>

        <div className="mt-6 mb-1">
          {tier.monthly === 0 ? (
            <p className="text-5xl font-black text-slate-900 tracking-tight">Free</p>
          ) : (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[15px] font-bold text-slate-400">PKR</span>
              <span className="text-5xl font-black text-slate-900 tracking-tight">
                {displayPerMonth.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-slate-500">/ month</span>
            </div>
          )}
        </div>
        {tier.monthly > 0 && yearly && yearlyPrice > 0 && (
          <p className="text-xs text-emerald-600 font-semibold">
            Billed yearly · PKR {yearlyPrice.toLocaleString()} (save 2 months)
          </p>
        )}
        {tier.monthly > 0 && !yearly && (
          <p className="text-xs text-slate-400">
            Or PKR {Math.round(yearlyPrice / 12).toLocaleString()}/mo billed yearly
          </p>
        )}

        <Link
          href={tier.ctaHref}
          className={`mt-5 inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-bold text-sm transition shadow-md ${accent.btn} ${tier.highlight ? 'shadow-teal-600/30' : ''}`}
        >
          {tier.cta} <FaArrowRight size={11} />
        </Link>
      </div>

      <div className="border-t border-slate-100 p-7 pt-5 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          What you get
        </p>
        <ul className="space-y-2.5">
          {tier.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              {b.ok ? (
                <FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} />
              ) : (
                <FaTimes className="text-slate-300 shrink-0 mt-0.5" size={13} />
              )}
              <span className={b.ok ? 'text-slate-700' : 'text-slate-400 line-through'}>{b.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CompareCell({ value, highlight }) {
  if (value === '✓') {
    return <FaCheck className={`mx-auto ${highlight ? 'text-teal-600' : 'text-emerald-500'}`} size={14} />;
  }
  if (value === '—' || value === '-') {
    return <span className="text-slate-300 font-bold">—</span>;
  }
  return (
    <span className={`text-sm font-semibold ${highlight ? 'text-teal-700' : 'text-slate-700'}`}>
      {value}
    </span>
  );
}

function TrustBadge({ icon, title, desc, tone }) {
  const tones = {
    teal:    'bg-teal-50    text-teal-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50   text-amber-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${tones[tone] || tones.teal}`}>
        {icon}
      </div>
      <div>
        <p className="font-bold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
