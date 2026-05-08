'use client';
import React from 'react';
import { FaLightbulb, FaRocket, FaCogs } from 'react-icons/fa';

export default function HeroSection() {
  return (
    <section className="bg-white p-8 rounded-xl shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Text Content */}
        <div>
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4 leading-tight">
            Launch Your <span className="text-teal-600 italic">Online Store</span> With Confidence
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            ECommerce Guider helps you plan, budget, and scale your digital business journey. Learn from industry leaders, analyze trends, and unlock growth.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center bg-teal-100 px-4 py-2 rounded-full text-teal-800 font-medium">
              <FaRocket className="mr-2" /> Quick Start Guide
            </div>
            <div className="flex items-center bg-teal-100 px-4 py-2 rounded-full text-teal-800 font-medium">
              <FaCogs className="mr-2" /> Custom Strategies
            </div>
            <div className="flex items-center bg-teal-100 px-4 py-2 rounded-full text-teal-800 font-medium">
              <FaLightbulb className="mr-2" /> Expert Insights
            </div>
          </div>
        </div>

        {/* Optional Hero Image or Illustration */}
        <div className="hidden md:block">
          <img
            src="/assets/images/3.jpg"
            alt="Ecommerce illustration"
            className="w-full rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}
