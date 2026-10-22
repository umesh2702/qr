import React from "react";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | UCode — Privacy-First QR Generation",
  description:
    "UCode's transparent privacy policy. Learn how all QR code encoding occurs directly inside your web browser without storing passwords, URLs, or personal data.",
  alternates: {
    canonical: "https://ucode.app/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Transparent &amp; Honest Data Practices</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-500">
              Last updated: October 2026 • Effective immediately
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm space-y-8 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                1. Our Core Privacy Philosophy
              </h2>
              <p>
                At UCode (by UCreates), privacy is an architectural guarantee, not merely a marketing slogan. We believe that generating a barcode should never require surrendering your personal contact information, business leads, or network credentials to a remote database.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                2. In-Browser Client-Side Generation
              </h2>
              <p>
                When you input a URL, Wi-Fi network passkey, vCard contact card, or phone number into the UCode unified generator:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 dark:text-slate-400 text-sm">
                <li>The payload is encoded directly into memory on your personal device using JavaScript Canvas and SVG standards.</li>
                <li><strong>No QR payloads are ever transmitted to our web servers.</strong></li>
                <li><strong>No Wi-Fi credentials or contact names are saved in cookies, local storage, or application logs.</strong></li>
                <li>When you close or refresh your browser tab, the payload in memory is instantly erased.</li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                3. Analytics and Measurement
              </h2>
              <p>
                To understand aggregate product usage and ensure high platform availability, we may collect minimal, privacy-conscious aggregate metrics (such as total QR codes generated, export format chosen, or page views).
              </p>
              <p>
                <strong>We explicitly sanitize all telemetry</strong> to ensure that zero URLs, phone numbers, passwords, or personal parameters are ever sent to analytics platforms.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                4. Advertising &amp; Third-Party Partners
              </h2>
              <p>
                UCode may display non-intrusive banner advertisements in pre-reserved containers to help offset domain and hosting infrastructure expenses. Any future advertising providers (such as Google AdSense) are subject to standard cookie consent policies. We do not sell user data or personal lead lists to third parties.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                5. Project Enquiries &amp; Contact Forms
              </h2>
              <p>
                If you voluntarily submit an enquiry form regarding UCreates digital services, the information you submit (Name, Email, Business Needs) is transmitted securely via HTTPS solely for the purpose of communicating with you regarding your project. We never sell or distribute your contact details to third-party marketers.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                6. Contact for Privacy Questions
              </h2>
              <p>
                If you have any questions regarding this policy or our technical architecture, please contact our engineering team directly at:
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                hello@ucreates.io
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
