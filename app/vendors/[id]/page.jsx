'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FaArrowLeft, FaStore, FaGlobe, FaEnvelope, FaPhone,
  FaWhatsapp, FaMapMarkerAlt, FaShieldAlt, FaBriefcase,
  FaPaperPlane, FaCheckCircle, FaExclamationTriangle,
  FaExternalLinkAlt, FaTags, FaStar, FaRegStar, FaStarHalfAlt,
  FaHeart, FaRegHeart, FaTrash, FaPenAlt
} from 'react-icons/fa';

const CATEGORY_STYLES = {
  "Home Decor":    "bg-amber-50  text-amber-700  border-amber-200",
  "Electronics":   "bg-sky-50    text-sky-700    border-sky-200",
  "IT Services":   "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Clothing":      "bg-pink-50   text-pink-700   border-pink-200",
  "Food Supplier": "bg-orange-50 text-orange-700 border-orange-200",
  "Construction":  "bg-stone-100 text-stone-700  border-stone-200",
  "Marketing":     "bg-purple-50 text-purple-700 border-purple-200",
  "Other":         "bg-slate-50  text-slate-700  border-slate-200",
};

const buildWhatsAppLink = (raw) => {
  if (!raw) return '';
  let num = String(raw).replace(/[^\d]/g, '');
  if (num.startsWith('0')) num = '92' + num.slice(1);
  return `https://wa.me/${num}`;
};

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function VendorProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingToggle, setSavingToggle] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ avgRating: 0, reviewCount: 0 });
  const [myReview, setMyReview] = useState(null);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState({ type: '', text: '' });

  // Inquiry form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // ─── Data loaders ─────────────────────────────
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/${id}`,
          { withCredentials: true, headers: authHeader() }
        );
        setVendor(res.data.vendor);
      } catch (err) {
        console.error('[VendorProfile] load error:', err);
        if (err.response?.status === 401) { router.push('/login'); return; }
        const data = err.response?.data;
        const status = err.response?.status;
        const backendMsg = data?.error || data?.details;
        let friendly;
        if (!err.response) {
          friendly = `Cannot reach the API. Is the backend running on ${process.env.NEXT_PUBLIC_API_BASE_URL || '(API URL not set)'}?`;
        } else if (status === 404) {
          friendly = backendMsg
            ? `${data?.error || ''}${data?.details ? ' — ' + data.details : ''}`.trim()
            : 'This vendor was not found, or the /vendor/:id route is missing on the server (please restart your backend after updating routes).';
        } else if (backendMsg) {
          friendly = backendMsg;
        } else {
          friendly = `Request failed with status ${status || 'unknown'}.`;
        }
        setError(friendly);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVendor();
  }, [id, router]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/${id}/reviews`,
        { withCredentials: true, headers: authHeader() }
      );
      setReviews(res.data.reviews || []);
      setReviewSummary(res.data.summary || { avgRating: 0, reviewCount: 0 });
      setMyReview(res.data.myReview || null);
      if (res.data.myReview) {
        setMyRating(res.data.myReview.rating);
        setMyComment(res.data.myReview.comment || '');
      }
    } catch (err) {
      console.error('Reviews load failed', err);
    }
  };

  useEffect(() => { if (id) fetchReviews(); }, [id]);

  // ─── Handlers ────────────────────────────────
  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
  };
  const showReviewFeedback = (type, text) => {
    setReviewFeedback({ type, text });
    setTimeout(() => setReviewFeedback({ type: '', text: '' }), 4000);
  };

  const handleToggleSave = async () => {
    if (!vendor) return;
    setSavingToggle(true);
    const prev = vendor.savedByMe;
    setVendor({ ...vendor, savedByMe: !prev });
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/${id}/save`,
        {},
        { withCredentials: true, headers: authHeader() }
      );
    } catch (err) {
      console.error('Save toggle failed', err);
      setVendor({ ...vendor, savedByMe: prev });
    } finally {
      setSavingToggle(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (myRating < 1 || myRating > 5) {
      showReviewFeedback('error', 'Please pick a star rating.');
      return;
    }
    try {
      setReviewSubmitting(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/${id}/review`,
        { rating: myRating, comment: myComment },
        { withCredentials: true, headers: authHeader() }
      );
      showReviewFeedback('success', myReview ? 'Review updated!' : 'Review posted!');
      await fetchReviews();
    } catch (err) {
      console.error(err);
      showReviewFeedback('error', err.response?.data?.error || 'Failed to save review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Delete your review? This cannot be undone.')) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/${id}/review`,
        { withCredentials: true, headers: authHeader() }
      );
      setMyRating(0); setMyComment('');
      await fetchReviews();
      showReviewFeedback('success', 'Review deleted.');
    } catch (err) {
      console.error(err);
      showReviewFeedback('error', err.response?.data?.error || 'Failed to delete.');
    }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || message.trim().length < 10) {
      showFeedback('error', 'Please fill name, email, and a message of at least 10 characters.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/${id}/inquire`,
        { name, email, phone, budget, message },
        { withCredentials: true, headers: authHeader() }
      );
      showFeedback('success', res.data.message || 'Inquiry sent!');
      setName(''); setEmail(''); setPhone(''); setBudget(''); setMessage('');
    } catch (err) {
      console.error(err);
      showFeedback('error', err.response?.data?.error || 'Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ──────────────────────────────────
  if (loading) return <SkeletonProfile />;

  if (error || !vendor) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-red-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-bold text-lg">Vendor not found</p>
          <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">{error || 'It may have been removed.'}</p>
          <p className="text-slate-400 text-xs mt-3 font-mono break-all">id: {id}</p>
          <div className="flex gap-2 justify-center mt-6">
            <Link href="/vendors" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition">
              <FaArrowLeft size={11} /> Back to Vendors
            </Link>
            <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg font-semibold text-sm transition">
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  const catStyle = CATEGORY_STYLES[vendor.category] || CATEGORY_STYLES.Other;
  const websiteHref = vendor.website?.startsWith('http')
    ? vendor.website
    : `https://${vendor.website}`;
  const services = Array.isArray(vendor.services) ? vendor.services : [];
  const waLink = buildWhatsAppLink(vendor.whatsapp);

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <Link href="/vendors" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 text-sm font-medium mb-6 transition">
          <FaArrowLeft size={11} /> Back to all vendors
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* HERO CARD */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-700 relative" />
              <div className="px-6 pb-6 -mt-12">
                <div className="flex items-start gap-4">
                  {vendor.logo ? (
                    <img src={vendor.logo} alt={vendor.vendorName}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-3xl shadow-md border-4 border-white shrink-0">
                      {vendor.vendorName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="pt-12 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {vendor.vendorName}
                      </h1>
                      {vendor.verified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <FaShieldAlt size={10} /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${catStyle}`}>
                        {vendor.category}
                      </span>
                      {vendor.city && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <FaMapMarkerAlt size={10} /> {vendor.city}
                        </span>
                      )}
                      {vendor.yearsInBusiness > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <FaBriefcase size={10} /> {vendor.yearsInBusiness} years in business
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <StarRow value={reviewSummary.avgRating || vendor.avgRating || 0} size={13} />
                      {(reviewSummary.reviewCount || vendor.reviewCount) ? (
                        <span className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-800">{(reviewSummary.avgRating || vendor.avgRating).toFixed(1)}</span>
                          <span className="text-slate-400"> · {reviewSummary.reviewCount || vendor.reviewCount} review{(reviewSummary.reviewCount || vendor.reviewCount) === 1 ? '' : 's'}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">No reviews yet</span>
                      )}
                    </div>
                  </div>
                </div>

                {vendor.description && (
                  <p className="mt-5 text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {vendor.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <a href={websiteHref} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition">
                    <FaGlobe size={12} /> Visit Website <FaExternalLinkAlt size={10} />
                  </a>
                  {waLink && (
                    <a href={waLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-lg font-semibold text-sm transition">
                      <FaWhatsapp size={13} /> WhatsApp
                    </a>
                  )}
                  <a href={`mailto:${vendor.email}`}
                    className="inline-flex items-center gap-2 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 px-4 py-2 rounded-lg font-semibold text-sm transition">
                    <FaEnvelope size={12} /> Email
                  </a>
                  <button
                    onClick={handleToggleSave}
                    disabled={savingToggle}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition border ${
                      vendor.savedByMe
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                        : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border-slate-200 hover:border-rose-200'
                    } disabled:opacity-60`}
                  >
                    {vendor.savedByMe ? <FaHeart size={12} /> : <FaRegHeart size={12} />}
                    {vendor.savedByMe ? 'Saved' : 'Save Vendor'}
                  </button>
                </div>
              </div>
            </div>

            {/* SERVICES */}
            {services.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <FaTags />
                  </span>
                  Services & Specialties
                </h2>
                <div className="flex flex-wrap gap-2">
                  {services.map((s, i) => (
                    <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEWS SECTION */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                      <FaStar size={13} />
                    </span>
                    Reviews & Ratings
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {reviewSummary.reviewCount > 0
                      ? `${reviewSummary.reviewCount} review${reviewSummary.reviewCount === 1 ? '' : 's'} · average ${reviewSummary.avgRating.toFixed(1)} / 5`
                      : 'Be the first to review this vendor'}
                  </p>
                </div>
                {reviewSummary.reviewCount > 0 && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                    <span className="text-2xl font-extrabold text-amber-600 leading-none">
                      {reviewSummary.avgRating.toFixed(1)}
                    </span>
                    <div>
                      <StarRow value={reviewSummary.avgRating} size={11} />
                      <p className="text-[10px] text-amber-700 font-semibold uppercase mt-0.5 tracking-wider">/ 5</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Write/edit my review form */}
              <form onSubmit={handleSubmitReview} className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                  <FaPenAlt size={10} /> {myReview ? 'Edit your review' : 'Write a review'}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  {[1,2,3,4,5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setMyRating(n)}
                      className="transition hover:scale-110"
                      title={`${n} star${n>1?'s':''}`}
                    >
                      {n <= myRating
                        ? <FaStar size={22} className="text-amber-400" />
                        : <FaRegStar size={22} className="text-slate-300 hover:text-amber-300" />}
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-slate-600 font-medium">
                    {myRating > 0 ? `${myRating} / 5` : 'Pick rating'}
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Share your experience working with this vendor (optional)..."
                  value={myComment}
                  maxLength={1000}
                  onChange={(e) => setMyComment(e.target.value)}
                  className="profile-input resize-none w-full"
                />
                <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                  <p className="text-[11px] text-slate-400">{myComment.length}/1000</p>
                  <div className="flex gap-2">
                    {myReview && (
                      <button type="button" onClick={handleDeleteReview}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 text-sm font-semibold transition">
                        <FaTrash size={11} /> Delete
                      </button>
                    )}
                    <button type="submit" disabled={reviewSubmitting}
                      className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition disabled:opacity-60">
                      {reviewSubmitting ? 'Saving...' : myReview ? 'Update Review' : 'Post Review'}
                    </button>
                  </div>
                </div>
                {reviewFeedback.text && (
                  <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 border ${
                    reviewFeedback.type === 'error'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {reviewFeedback.type === 'error' ? <FaExclamationTriangle size={11} /> : <FaCheckCircle size={11} />}
                    {reviewFeedback.text}
                  </div>
                )}
              </form>

              {/* List of reviews */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-6">No reviews yet. Be the first to share your experience.</p>
                ) : (
                  reviews.map((r) => (
                    <div key={r._id} className="border-b border-slate-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {(r.userName || 'B').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm">
                            {r.userName || 'Buyer'}
                            {myReview && r._id === myReview._id && (
                              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-teal-600">You</span>
                            )}
                          </p>
                          <div className="flex items-center gap-2">
                            <StarRow value={r.rating} size={11} />
                            <span className="text-[11px] text-slate-400">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {r.comment && (
                        <p className="text-sm text-slate-600 leading-relaxed pl-12">{r.comment}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* INQUIRY FORM */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <FaPaperPlane size={13} />
                </span>
                Send an Inquiry
              </h2>
              <p className="text-sm text-slate-500 mb-5">
                Tell {vendor.vendorName} what you need. They will receive your message instantly by email.
              </p>

              <form onSubmit={handleInquiry} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Your Name *">
                  <input type="text" placeholder="e.g. Ahmed Khan"
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="profile-input"/>
                </Field>
                <Field label="Email *">
                  <input type="email" placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="profile-input"/>
                </Field>
                <Field label="Phone (optional)">
                  <input type="text" placeholder="0300-1234567"
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="profile-input"/>
                </Field>
                <Field label="Budget (optional)">
                  <input type="text" placeholder="e.g. PKR 50,000 / month"
                    value={budget} onChange={(e) => setBudget(e.target.value)}
                    className="profile-input"/>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Message *">
                    <textarea rows={5}
                      placeholder="Describe what you need — quantity, timeline, delivery city, etc."
                      value={message} maxLength={2000}
                      onChange={(e) => setMessage(e.target.value)}
                      className="profile-input resize-none"/>
                  </Field>
                  <p className="text-[11px] text-slate-400 mt-1 text-right">{message.length}/2000</p>
                </div>

                <div className="sm:col-span-2 flex items-center gap-3">
                  <button type="submit" disabled={submitting}
                    className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md shadow-teal-600/20 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane size={12} /> Send Inquiry
                      </>
                    )}
                  </button>
                </div>

                {feedback.text && (
                  <div className={`sm:col-span-2 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border ${
                    feedback.type === 'error'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {feedback.type === 'error' ? <FaExclamationTriangle /> : <FaCheckCircle />}
                    {feedback.text}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Contact Details
              </h3>
              <div className="space-y-3 text-sm">
                <ContactRow icon={<FaGlobe />} label="Website" value={vendor.website} href={websiteHref} external />
                <ContactRow icon={<FaEnvelope />} label="Email" value={vendor.email} href={`mailto:${vendor.email}`} />
                <ContactRow icon={<FaPhone />} label="Phone" value={vendor.phone} href={`tel:${vendor.phone}`} />
                {vendor.whatsapp && (
                  <ContactRow icon={<FaWhatsapp className="text-emerald-500" />} label="WhatsApp" value={vendor.whatsapp} href={waLink} external />
                )}
                {vendor.city && (
                  <ContactRow icon={<FaMapMarkerAlt />} label="City" value={vendor.city} />
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-teal-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FaShieldAlt /> Trust & Experience
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className={vendor.verified ? "text-emerald-500" : "text-slate-300"} size={12} />
                  {vendor.verified ? 'Verified by ECommerce Guider' : 'Verification pending'}
                </li>
                {vendor.yearsInBusiness > 0 && (
                  <li className="flex items-center gap-2">
                    <FaBriefcase className="text-teal-500" size={12} />
                    {vendor.yearsInBusiness} years in business
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <FaStore className="text-teal-500" size={12} />
                  Listed in {vendor.category}
                </li>
                {reviewSummary.reviewCount > 0 && (
                  <li className="flex items-center gap-2">
                    <FaStar className="text-amber-500" size={12} />
                    {reviewSummary.avgRating.toFixed(1)} / 5 from {reviewSummary.reviewCount} review{reviewSummary.reviewCount === 1 ? '' : 's'}
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .profile-input {
          width: 100%;
          border: 1px solid rgb(226 232 240);
          padding: 0.625rem 0.75rem;
          border-radius: 0.5rem;
          outline: none;
          transition: all 0.15s;
          background: white;
          font-size: 0.875rem;
        }
        .profile-input:focus {
          border-color: rgb(20 184 166);
          box-shadow: 0 0 0 2px rgb(20 184 166 / 0.25);
        }
      `}</style>
    </section>
  );
}

function StarRow({ value = 0, size = 12 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) stars.push(<FaStar key={i} size={size} className="text-amber-400" />);
    else if (value >= i - 0.5) stars.push(<FaStarHalfAlt key={i} size={size} className="text-amber-400" />);
    else stars.push(<FaRegStar key={i} size={size} className="text-slate-300" />);
  }
  return <span className="inline-flex items-center gap-0.5">{stars}</span>;
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function ContactRow({ icon, label, value, href, external }) {
  const content = (
    <span className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 text-xs">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
          {label}
        </span>
        <span className="block text-slate-700 break-all">{value}</span>
      </span>
    </span>
  );

  if (!href) return <div>{content}</div>;
  return (
    <a href={href} target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="block hover:bg-teal-50/40 -mx-2 px-2 py-1 rounded-lg transition">
      {content}
    </a>
  );
}

function SkeletonProfile() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="h-4 w-32 bg-slate-200 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
              <div className="h-24 bg-slate-100" />
              <div className="px-6 pb-6 -mt-12">
                <div className="w-24 h-24 rounded-2xl bg-slate-100 border-4 border-white" />
                <div className="space-y-2 mt-4">
                  <div className="h-6 w-48 bg-slate-100 rounded" />
                  <div className="h-3 w-32 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-64 animate-pulse" />
          </div>
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-48 animate-pulse" />
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-32 animate-pulse" />
          </aside>
        </div>
      </div>
    </section>
  );
}
