'use client';
import React from 'react';
import Link from '@bradgarropy/next-link';
import { CgProfile } from 'react-icons/cg';
import { FaBars } from 'react-icons/fa';
import { useSidebar } from './SidebarContext';

const Topbar = () => {
  const { setOpen } = useSidebar();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3">
        {/* LEFT — hamburger (mobile only) + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden w-10 h-10 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200 transition"
            aria-label="Open menu"
          >
            <FaBars />
          </button>

          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight truncate">
            Welcome to{' '}
            <span className="text-teal-700 italic font-black">
              ECommerce Guider
            </span>
          </h1>
        </div>

        {/* RIGHT — profile */}
        <Link to="/profile">
          <div className="flex items-center px-3 sm:px-4 py-2 bg-[#a9e0dd] hover:bg-teal-600 rounded-lg cursor-pointer transition duration-200 group shrink-0">
            <CgProfile className="text-xl sm:text-2xl text-teal-800 group-hover:text-white transition duration-200" />
            <p className="hidden sm:inline ms-2 text-teal-800 text-base font-semibold group-hover:text-white transition duration-200">
              Profile
            </p>
          </div>
        </Link>
      </div>

      {/* Decorative gradient divider */}
      <div className="h-0.5 w-full bg-gradient-to-r from-teal-400 via-teal-300 to-transparent mt-4" />
    </div>
  );
};

export default Topbar;