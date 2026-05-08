import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-teal-700 text-white py-10 mt-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand / About */}
        <div>
          <h2 className="text-2xl font-bold">EcomGuide</h2>
          <p className="mt-3 text-sm text-gray-200">
            Helping businesses grow with smart platform advice, competitor
            insights, and tailored eCommerce strategies.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-200">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/signup" className="hover:text-white">Sign Up</a></li>
            <li><a href="/login" className="hover:text-white">Login</a></li>
            <li><a href="/guide" className="hover:text-white">Guide</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Resources</h3>
          <ul className="space-y-2 text-gray-200">
            <li><a href="/roadmap" className="hover:text-white">Roadmap</a></li>
            <li><a href="/profit" className="hover:text-white">Profit Tips</a></li>
            <li><a href="/competitor" className="hover:text-white">Competitor Analysis</a></li>
            <li><a href="/advice" className="hover:text-white">Platform Advice</a></li>
          </ul>
        </div>

        {/* Contact / Social */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Get in Touch</h3>
          <p className="text-gray-200 text-sm">support@ecomguide.com</p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="p-2 rounded-full bg-teal-600 hover:bg-white hover:text-teal-700 transition">
              <FaFacebookF />
            </a>
            <a href="#" className="p-2 rounded-full bg-teal-600 hover:bg-white hover:text-teal-700 transition">
              <FaTwitter />
            </a>
            <a href="#" className="p-2 rounded-full bg-teal-600 hover:bg-white hover:text-teal-700 transition">
              <FaLinkedinIn />
            </a>
            <a href="#" className="p-2 rounded-full bg-teal-600 hover:bg-white hover:text-teal-700 transition">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-teal-500 mt-8 pt-4 text-center text-sm text-gray-300">
        © {new Date().getFullYear()} EcomGuide. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
