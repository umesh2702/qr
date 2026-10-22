"use client";

import React from "react";
import Link from "next/link";
import { QrCode, ShieldCheck, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-sm">
                <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center text-white">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                UCode
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              The honest, privacy-first QR platform. Generate high-resolution, permanent static QR codes directly in your browser. No accounts, no paywalls, no expiration traps.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>100% Client-Side Processing • Zero Payload Retention</span>
            </div>
          </div>

          {/* Product links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              QR Solutions
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#generator" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Unified Generator
                </Link>
              </li>
              <li>
                <Link href="/#generator" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Website URL QR
                </Link>
              </li>
              <li>
                <Link href="/#generator" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Wi-Fi Network QR
                </Link>
              </li>
              <li>
                <Link href="/#generator" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Digital vCard Business Card
                </Link>
              </li>
              <li>
                <Link href="/#generator" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  WhatsApp Direct Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Educational Guides */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Guides &amp; Research
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog/static-vs-dynamic-qr-codes" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Static vs Dynamic Truth
                </Link>
              </li>
              <li>
                <Link href="/blog/restaurant-menu-qr-code-guide" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Restaurant Menu Guide
                </Link>
              </li>
              <li>
                <Link href="/blog/qr-code-print-sizing-and-readability" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Print Sizing &amp; Quiet Zones
                </Link>
              </li>
              <li>
                <Link href="/blog/wifi-qr-code-setup-and-security" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Guest Wi-Fi Setup
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-indigo-600 dark:text-indigo-400 font-medium">
                  View All Guides &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Agency & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              UCreates &amp; Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>UCreates Agency</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  About UCode
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            &copy; 2026 UCode. Engineered with care by{" "}
            <Link
              href="/services"
              className="text-slate-800 dark:text-slate-200 font-semibold hover:underline"
            >
              UCreates
            </Link>
            . Free, permanent, privacy-first QR platform.
          </p>
          <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400">
            <span>Direct Vector SVG</span>
            <span>•</span>
            <span>Ultra-HD 4096px PNG</span>
            <span>•</span>
            <span>Zero Watermarks</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
