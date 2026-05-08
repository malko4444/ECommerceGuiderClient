"use client";
import React, { useEffect, useState } from "react";
import {
  FaVenusMars, FaCalendarAlt, FaSignOutAlt, FaEnvelope,
  FaUser, FaShieldAlt, FaCheckCircle, FaExclamationCircle,
  FaRedo, FaPen, FaClock
} from "react-icons/fa";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login again.");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:4000/auth/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) setUser(data.user);
      else setError(data.error || "Failed to fetch profile");
    } catch (err) {
      setError("Server error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // ── initials for avatar fallback ──
  const initials = user?.name
    ? user.name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  // ═══════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════
  if (loading) {
    return (
      <section className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
          <div className="h-36 bg-gradient-to-r from-slate-200 to-slate-100" />
          <div className="p-6 pt-0">
            <div className="w-28 h-28 rounded-full bg-slate-200 -mt-14 border-4 border-white mx-auto" />
            <div className="h-6 w-40 bg-slate-200 rounded mx-auto mt-4" />
            <div className="h-4 w-56 bg-slate-100 rounded mx-auto mt-2" />
            <div className="grid grid-cols-2 gap-3 mt-8">
              <div className="h-20 bg-slate-100 rounded-xl" />
              <div className="h-20 bg-slate-100 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ═══════════════════════════════════════
  // ERROR STATE
  // ═══════════════════════════════════════
  if (error) {
    return (
      <section className="max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
            <FaExclamationCircle className="text-2xl" />
          </div>
          <p className="font-bold text-red-800">Couldn&apos;t load profile</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold text-sm inline-flex items-center gap-2"
          >
            <FaRedo size={11} /> Try again
          </button>
        </div>
      </section>
    );
  }

  // ═══════════════════════════════════════
  // MAIN PROFILE
  // ═══════════════════════════════════════
  return (
    <section className="max-w-4xl mx-auto">

      {/* ═══ PROFILE CARD ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Teal gradient cover — no stock photo needed */}
        <div className="relative h-36 sm:h-44 bg-gradient-to-br from-teal-400 via-teal-600 to-teal-800 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm" />
        </div>

        <div className="px-5 sm:px-8 pb-8">
          {/* Avatar + edit button row */}
          <div className="flex items-end justify-between -mt-14 mb-4">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
              {initials}
            </div>
            <button
              className="mb-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-teal-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 transition"
              title="Edit profile (coming soon)"
            >
              <FaPen size={11} /> Edit
            </button>
          </div>

          {/* Name + email + verified badge */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {user?.name || "Unnamed User"}
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                <FaCheckCircle size={10} /> Verified
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
              <FaEnvelope size={11} className="text-slate-400" />
              {user?.email}
            </p>
          </div>

          {/* ─── INFO GRID ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <InfoCard
              icon={<FaVenusMars />}
              label="Gender"
              value={user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "Not specified"}
              tone="purple"
            />
            <InfoCard
              icon={<FaCalendarAlt />}
              label="Date of Birth"
              value={user?.dob
                ? new Date(user.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                : "Not specified"}
              tone="amber"
            />
            {memberSince && (
              <InfoCard
                icon={<FaClock />}
                label="Member Since"
                value={memberSince}
                tone="sky"
              />
            )}
            <InfoCard
              icon={<FaShieldAlt />}
              label="Account Status"
              value="Active"
              tone="teal"
              highlight
            />
          </div>

          {/* ─── LOGOUT ─── */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 py-3 rounded-xl font-semibold transition flex justify-center items-center gap-2"
            >
              <FaSignOutAlt /> Sign out
            </button>
          </div>
        </div>
      </div>

      {/* ═══ LOGOUT CONFIRM MODAL ═══ */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <FaSignOutAlt />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">Sign out?</h3>
            <p className="text-slate-500 text-sm text-center mt-1">
              You&apos;ll need to log in again to access your dashboard.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <FaSignOutAlt size={13} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ════════════════════════════════════════════
// SUB-COMPONENT
// ════════════════════════════════════════════
function InfoCard({ icon, label, value, tone = "slate", highlight = false }) {
  const tones = {
    teal:   "bg-teal-50   text-teal-600",
    purple: "bg-purple-50 text-purple-600",
    amber:  "bg-amber-50  text-amber-600",
    sky:    "bg-sky-50    text-sky-600",
    slate:  "bg-slate-50  text-slate-600",
  };
  return (
    <div className={`
      rounded-xl p-4 border transition
      ${highlight
        ? 'bg-gradient-to-br from-teal-50 to-white border-teal-200'
        : 'bg-slate-50/60 border-slate-100 hover:border-slate-200'}
    `}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;