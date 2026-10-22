"use client";

import React, { useState } from "react";
import Link from "next/link";
import { QrCode, Menu, X, ArrowUpRight } from "lucide-react";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white transition-transform group-hover:scale-[1.02]">
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base tracking-tight text-slate-900">
              UCode
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              by UCreates
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#generator"
            className="text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors"
          >
            Generator
          </Link>
          <Link
            href="/blog"
            className="text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors"
          >
            Guides &amp; Research
          </Link>
          <Link
            href="/services"
            className="text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors inline-flex items-center gap-1"
          >
            <span>UCreates Solutions</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </Link>
          <Link
            href="/about"
            className="text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/#generator"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <span>New QR Code</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            href="/#generator"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            QR Generator
          </Link>
          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Guides &amp; Research
          </Link>
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-slate-50"
          >
            UCreates Solutions
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            About UCode
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Contact
          </Link>
          <div className="pt-2">
            <Link
              href="/#generator"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800"
            >
              <span>Create QR Code</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
