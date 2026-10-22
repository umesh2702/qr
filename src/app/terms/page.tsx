import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use | UCode — Free QR Code Generator",
  description:
    "Terms of service for UCode. Learn about your rights to use generated QR codes for personal and commercial applications without royalties or fees.",
  alternates: {
    canonical: "https://ucode.app/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Terms of Use
            </h1>
            <p className="text-sm text-slate-500">
              Last updated: October 2026 • Effective immediately
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm space-y-8 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using UCode (a product operated by UCreates), you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, please do not use the application.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                2. Free Commercial &amp; Personal License
              </h2>
              <p>
                All static QR codes generated through UCode may be used freely for personal, commercial, and editorial purposes without payment of royalties or licensing fees.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-sm pl-2">
                <li>You may print generated codes on packaging, business cards, signs, menus, and marketing collateral.</li>
                <li>UCode claims zero ownership or copyright over the data, logos, or content you encode into your QR codes.</li>
                <li>Generated static codes never expire and have no scan limitations.</li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                3. Acceptable Use Policy
              </h2>
              <p>
                You agree not to use UCode to generate barcodes directing users to malicious software, phishing pages, deceptive scams, or unlawful content. UCode reserves the right to block malicious traffic patterns to protect general web safety.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                4. Pre-Print Testing &amp; Disclaimer of Warranty
              </h2>
              <p>
                While UCode provides industry-leading diagnostic tools and optical scannability calculations, optical scanning depends on multiple external physical variables—including ambient lighting, camera hardware, printing substrate, ink bleeding, and physical distance.
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                You must always conduct a test print on physical paper and verify scanning with multiple smartphones before placing commercial print orders.
              </p>
              <p className="text-xs text-slate-500">
                UCode is provided &ldquo;as is&rdquo; without warranty of any kind, express or implied. Under no circumstances shall UCreates or its developers be held liable for any commercial printing costs, lost revenue, or damages resulting from unreadable printed codes.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                5. Questions
              </h2>
              <p>
                For questions regarding our terms, email us at:{" "}
                <strong className="text-indigo-600 dark:text-indigo-400">hello@ucreates.io</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
