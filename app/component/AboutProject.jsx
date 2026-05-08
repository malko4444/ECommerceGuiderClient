import React from "react";
import { FaRocket, FaMoneyBillWave, FaChartBar, FaCalculator, FaStore, FaBookOpen } from "react-icons/fa";

export default function AboutProject() {
  return (
    <section className="relative bg-gradient-to-br from-teal-600 via-teal-500 to-teal-700 py-20 text-white">
      {/* Curved top divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
        <svg
          className="relative block w-full h-12"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path
            d="M0,0V46.29c47.79,22,103.18,29.05,158,17.39C230.18,50,284,22,339,20c54-.73,108,22.54,162,35.39C565.82,67.18,620,67,675,58.71c55-8.29,110-26.88,165-32.71C895,20,950,31,1005,47.08c55,16.61,110,38.73,165,39.72V0Z"
            opacity=".25"
            fill="#fff"
          ></path>
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        {/* Heading */}
        <h2 className="text-5xl font-extrabold mb-6 drop-shadow-lg">
          About <span className="text-orange-300">Ecommerce Guider</span>
        </h2>
        <p className="text-lg md:text-xl mb-16 text-gray-100 leading-relaxed max-w-3xl mx-auto">
          Ecommerce Guider is your AI-powered assistant for launching, managing,
          and scaling online businesses in Pakistan. From startup planning to
          profit optimization, we’ve got you covered.
        </p>

        {/* Features in timeline style */}
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <FaRocket className="text-5xl text-orange-300" />
            <div className="text-left">
              <h3 className="text-2xl font-semibold">Startup Roadmap</h3>
              <p className="text-gray-100">
                Step-by-step guidance tailored to Pakistan’s e-commerce ecosystem.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <FaMoneyBillWave className="text-5xl text-orange-300" />
            <div className="text-left">
              <h3 className="text-2xl font-semibold">Budget Planner</h3>
              <p className="text-gray-100">
                Smart financial insights into costs, marketing, and platform fees.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <FaChartBar className="text-5xl text-orange-300" />
            <div className="text-left">
              <h3 className="text-2xl font-semibold">Competitor Analysis</h3>
              <p className="text-gray-100">
                Track competition, pricing, and positioning with real market data.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <FaCalculator className="text-5xl text-orange-300" />
            <div className="text-left">
              <h3 className="text-2xl font-semibold">Profit Calculator</h3>
              <p className="text-gray-100">
                Instantly calculate ROI, break-even points, and margins.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <FaStore className="text-5xl text-orange-300" />
            <div className="text-left">
              <h3 className="text-2xl font-semibold">Vendor Directory</h3>
              <p className="text-gray-100">
                Find reliable local and international suppliers with ease.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <FaBookOpen className="text-5xl text-orange-300" />
            <div className="text-left">
              <h3 className="text-2xl font-semibold">Tutorials & Guides</h3>
              <p className="text-gray-100">
                Beginner-friendly step-by-step resources to master ads,
                packaging, and customer support.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold mb-4">
            Why Choose <span className="text-orange-300">Ecommerce Guider?</span>
          </h3>
          <p className="text-lg text-gray-100 max-w-3xl mx-auto">
            Starting an online business can feel overwhelming — but you don’t
            have to do it alone. Ecommerce Guider combines{" "}
            <span className="font-semibold text-orange-300">AI intelligence</span>,{" "}
            <span className="font-semibold text-orange-300">market research</span>, and{" "}
            <span className="font-semibold text-orange-300">practical tools</span>{" "}
            into one platform to save time, reduce risks, and boost growth.
          </p>
        </div>
      </div>

      {/* Curved bottom divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg
          className="relative block w-full h-12 rotate-180"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path
            d="M0,0V46.29c47.79,22,103.18,29.05,158,17.39C230.18,50,284,22,339,20c54-.73,108,22.54,162,35.39C565.82,67.18,620,67,675,58.71c55-8.29,110-26.88,165-32.71C895,20,950,31,1005,47.08c55,16.61,110,38.73,165,39.72V0Z"
            opacity=".25"
            fill="#fff"
          ></path>
        </svg>
      </div>
    </section>
  );
}
