"use client";

import React from "react";
import Link from "next/link";
import { QrCode, ShieldCheck, ArrowUpRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <QrCode className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">
                UCode
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
              The honest, privacy-first QR platform. Generate high-resolution, permanent static QR codes directly in your browser. No accounts, no paywalls, no expiration traps.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% In-Browser &bull; Zero Server Retention</span>
            </div>
          </div>

          {/* Product links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              QR Formats
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/#generator" className="hover:text-slate-950 transition-colors">
                  Website URL
                </Link>
              </li>
              <li>
                <Link href="/#generator" className="hover:text-slate-950 transition-colors">
                  Wi-Fi Network
                </Link>
              </li>
              <li>
                <Link href="/#generator" className="hover:text-slate-950 transition-colors">
                  vCard Contact Card
                </Link>
              </li>
              <li>
                <Link href="/#generator" className="hover:text-slate-950 transition-colors">
                  WhatsApp Direct
                </Link>
              </li>
              <li>
                <Link href="/#generator" className="hover:text-slate-950 transition-colors">
                  Calendar Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Educational Guides */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Guides &amp; Research
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/blog/static-vs-dynamic-qr-codes" className="hover:text-slate-950 transition-colors">
                  Static vs Dynamic Truth
                </Link>
              </li>
              <li>
                <Link href="/blog/restaurant-menu-qr-code-guide" className="hover:text-slate-950 transition-colors">
                  Restaurant Menu Guide
                </Link>
              </li>
              <li>
                <Link href="/blog/qr-code-print-sizing-and-readability" className="hover:text-slate-950 transition-colors">
                  Print Sizing &amp; Quiet Zones
                </Link>
              </li>
              <li>
                <Link href="/blog/wifi-qr-code-setup-and-security" className="hover:text-slate-950 transition-colors">
                  Guest Wi-Fi Setup
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                  All Guides &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Agency & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Studio &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/services" className="hover:text-slate-950 transition-colors inline-flex items-center gap-1">
                  <span>UCreates Solutions</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-slate-950 transition-colors">
                  About UCode
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-950 transition-colors">
                  Contact &amp; Inquiries
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-slate-950 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-950 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-400">
            &copy; 2026 UCode. Engineered by{" "}
            <Link
              href="/services"
              className="text-slate-700 font-medium hover:underline"
            >
              UCreates
            </Link>
            . Free, permanent, privacy-first QR platform.
          </p>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Direct Vector SVG</span>
            <span>&bull;</span>
            <span>Ultra-HD 4096px PNG</span>
            <span>&bull;</span>
            <span>Zero Watermarks</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
