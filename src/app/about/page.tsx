import React from "react";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UcreatesBanner } from "@/components/UcreatesBanner";

export const metadata: Metadata = {
  title: "About UCode | The Free, Privacy-First QR Platform",
  description:
    "Learn why UCode was created by UCreates to eliminate predatory QR code subscriptions, protect user privacy with client-side generation, and provide honest free tools.",
  alternates: {
    canonical: "https://ucode.app/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Product Purpose &amp; Engineering Principles</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Why We Built UCode
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              A free utility should respect its users. UCode was built to put an end to subscription traps and bring privacy back to the physical web.
            </p>
          </div>

          {/* Narrative Content */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm space-y-8 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                The Problem With Modern QR Tools
              </h2>
              <p>
                In 2020, QR codes became ubiquitous. But alongside their convenience came predatory SaaS models. Hundreds of search-engine-optimized websites lured restaurant owners, small business founders, and designers into creating &ldquo;free&rdquo; QR codes.
              </p>
              <p>
                Unbeknownst to the user, these tools encoded third-party redirect links rather than direct destinations. Two weeks after printing 5,000 flyers or acrylic menu stands, the provider disabled the redirect and displayed an extortionate paywall demanding $20 to $50 every single month just to keep the printed collateral alive.
              </p>
            </section>

            <section className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Our Three Engineering Commitments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Direct Encoding Only
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    All static QR codes are mathematically encoded into the image matrix. Zero third-party redirects. They can never expire.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    100% In-Browser Privacy
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Your Wi-Fi passwords, contact addresses, and private URLs are processed locally by your browser. No server storage.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    No Forced Signup
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    No account registration, no email verification, no watermarks, and no download timers. Just create and go.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                The Relationship Between UCode and UCreates
              </h2>
              <p>
                UCode is engineered and maintained by <strong>UCreates</strong>, a digital solutions studio specializing in bespoke web application development, UI/UX architecture, and interactive dining platforms.
              </p>
              <p>
                UCode is completely free for everyone. When a business using UCode needs something more advanced—such as a custom digital restaurant menu portal, a high-converting web application, or an executive brand design system—they can hire UCreates. This transparent model allows UCode to remain permanently free without resorting to bait-and-switch tactics.
              </p>
            </section>
          </div>

          {/* Banner */}
          <UcreatesBanner context="general" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
