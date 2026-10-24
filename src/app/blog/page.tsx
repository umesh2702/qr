import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { ARTICLES, CONTENT_ROADMAP_BRIEFS } from "@/lib/articles";
import { getAbsoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "QR Code Guides, Prepress Standards & Research Library",
  description:
    "Practical, evidence-based guides on QR code generation, print sizing calculations, error correction standards, restaurant digital menus, and Wi-Fi security.",
  alternates: {
    canonical: getAbsoluteUrl("/blog"),
  },
  openGraph: {
    title: "QR Code Guides, Prepress Standards & Research Library | UCode",
    description:
      "Practical, evidence-based guides on QR code generation, print sizing calculations, error correction standards, restaurant digital menus, and Wi-Fi security.",
    url: getAbsoluteUrl("/blog"),
    type: "website",
    images: [
      {
        url: getAbsoluteUrl("/og-image.png"),
        width: 1200,
        height: 630,
        alt: "UCode QR Engineering & Prepress Library",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Code Guides, Prepress Standards & Research Library | UCode",
    description:
      "Practical, evidence-based guides on QR code generation, print sizing calculations, error correction standards, restaurant digital menus, and Wi-Fi security.",
    images: [getAbsoluteUrl("/og-image.png")],
  },
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 antialiased">
      <Header />

      <main className="flex-1 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Technical &amp; Practical Resources
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              QR Engineering &amp; Prepress Library
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              In-depth optical research, pre-press sizing formulas, and hospitality guidelines to ensure your printed QR codes never fail.
            </p>
          </div>

          {/* Ad slot */}
          <AdBanner slotId="blog-top-ad" format="leaderboard" />

          {/* Published Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARTICLES.map((article) => (
              <article
                key={article.slug}
                className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </span>
                  </div>

                  <h2 className="text-base font-semibold text-slate-900 leading-snug">
                    <Link
                      href={`/blog/${article.slug}`}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </h2>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {article.publishedAt}
                  </span>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-900 hover:text-indigo-600 transition-colors"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Content Roadmap Briefs */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Editorial Roadmap
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Upcoming Technical Research &amp; Guides
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Scheduled by UCode Editorial Team
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CONTENT_ROADMAP_BRIEFS.map((brief, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-lg border border-slate-200/70 bg-white flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-xs sm:text-sm text-slate-900">
                      {brief.topic}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Target: {brief.targetAudience} &bull; {brief.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
