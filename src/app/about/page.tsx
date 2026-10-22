import React from "react";
import type { Metadata } from "next";
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
    <div className="min-h-screen flex flex-col bg-white text-slate-900 antialiased">
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Product Principles
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Why We Built UCode
            </h1>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              A free utility should respect its users. UCode was built to put an end to subscription traps and bring privacy back to the physical web.
            </p>
          </div>

          {/* Narrative Content */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 sm:p-8 space-y-7 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                The Problem With Modern QR Tools
              </h2>
              <p>
                In 2020, QR codes became ubiquitous. But alongside their convenience came predatory SaaS models. Hundreds of search-engine-optimized websites lured restaurant owners, small business founders, and designers into creating &ldquo;free&rdquo; QR codes.
              </p>
              <p>
                Unbeknownst to the user, these tools encoded third-party redirect links rather than direct destinations. Two weeks after printing 5,000 flyers or acrylic menu stands, the provider disabled the redirect and displayed an extortionate paywall demanding $20 to $50 every single month just to keep the printed collateral alive.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                Our Three Engineering Commitments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/70 space-y-1.5">
                  <span className="text-xs font-mono font-bold text-slate-400">01</span>
                  <h3 className="font-semibold text-xs text-slate-900">
                    Direct Encoding Only
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    All static QR codes are mathematically encoded into the image matrix. Zero third-party redirects. They can never expire.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/70 space-y-1.5">
                  <span className="text-xs font-mono font-bold text-slate-400">02</span>
                  <h3 className="font-semibold text-xs text-slate-900">
                    100% In-Browser Privacy
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Your Wi-Fi passwords, contact addresses, and private URLs are processed locally by your browser. No server storage.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/70 space-y-1.5">
                  <span className="text-xs font-mono font-bold text-slate-400">03</span>
                  <h3 className="font-semibold text-xs text-slate-900">
                    No Forced Signup
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    No account registration, no email verification, no watermarks, and no download timers. Just create and go.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
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
