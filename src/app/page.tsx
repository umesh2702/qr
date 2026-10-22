import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  ArrowRight,
  Utensils,
  Wifi,
  Briefcase,
  Layers,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QRWorkspace } from "@/components/QRWorkspace";
import { AdBanner } from "@/components/AdBanner";
import { UcreatesBanner } from "@/components/UcreatesBanner";
import { ARTICLES } from "@/lib/articles";

export const metadata: Metadata = {
  title: "UCode — Free, Privacy-First QR Code Generator | No Expiry, No Signup",
  description:
    "Generate permanent, high-resolution static QR codes for websites, Wi-Fi, vCard, WhatsApp, and email directly in your browser. Vector SVG and Ultra-HD 4096px PNG downloads with zero watermarks.",
  alternates: {
    canonical: "https://ucode.app",
  },
  openGraph: {
    title: "UCode — Free, Privacy-First QR Code Generator",
    description:
      "Permanent static QR codes generated client-side. No signups, no expiring trials, no redirected links. Download pure SVG and Ultra-HD PNG.",
    url: "https://ucode.app",
    siteName: "UCode by UCreates",
    type: "website",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "UCode",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "A privacy-first, client-side static QR code generator supporting 10 standard QR types with vector SVG and 4096px print exports.",
  };

  const faqItems = [
    {
      q: "Do QR codes generated on UCode ever expire?",
      a: "No, never. UCode creates direct static QR codes where your destination or credentials are mathematically encoded directly into the pixel grid. Because there is no intermediate redirect server, your codes remain operational forever without scan limits or monthly subscription fees.",
    },
    {
      q: "Can I use UCode QR codes for commercial products and marketing?",
      a: "Yes, 100% free for personal, commercial, and enterprise usage. You can print them on packaging, restaurant tables, flyers, billboards, or business cards with no licensing restrictions or watermarks.",
    },
    {
      q: "Why does UCode generate QR codes in the browser instead of on a server?",
      a: "Privacy and speed. By generating your QR codes client-side, your private Wi-Fi passwords, personal contact numbers, and confidential URLs never touch a remote server or get stored in third-party databases. It also makes generation instantaneous.",
    },
    {
      q: "What is the difference between PNG and SVG downloads?",
      a: "PNG is a raster image format ideal for websites, email signatures, and desktop printers. SVG is a vector format made of mathematical paths, meaning it can be scaled infinitely to billboard sizes in Adobe Illustrator or InDesign without losing any sharpness.",
    },
    {
      q: "Why do some other QR generators stop working after two weeks?",
      a: "Many commercial generators deceptively route your QR code through their own redirect servers under a 14-day 'free trial'. When the trial lapses, they hold your printed codes hostage until you subscribe to a costly monthly plan. UCode bypasses third-party redirects completely.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="flex-1">
        {/* Unified QR Generator Workspace */}
        <QRWorkspace />

        {/* Display Advertising Placement (Disabled by default, CLS-safe) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdBanner slotId="homepage-under-generator" format="leaderboard" />
        </section>

        {/* How It Works (3 Steps) */}
        <section className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Frictionless Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                How UCode Works
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                No accounts to register, no verification emails to click. Three simple steps to print-ready QR codes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 relative">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Select Type &amp; Input Data
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Choose from 10 supported types: Website URL, Guest Wi-Fi, vCard contact, WhatsApp, Calendar Events, and more.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 relative">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Style &amp; Validate Instantly
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Customize brand colors, error correction, and add your logo. Built-in diagnostics verify scannability in real time.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 relative">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Instant Vector or Ultra-HD Download
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Download infinitely scalable Vector SVG for professional press, or high-res PNG at up to 4096px resolution with zero watermarks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table vs. Competitors */}
        <section className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Ethical Product Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                How UCode Compares to Other Generators
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                An objective breakdown of features, privacy practices, and pricing models.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    <th className="py-4 px-6">Capability / Policy</th>
                    <th className="py-4 px-6 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/30">
                      UCode (Free Forever)
                    </th>
                    <th className="py-4 px-6">QRCode Monkey</th>
                    <th className="py-4 px-6">Bitly Free Tier</th>
                    <th className="py-4 px-6">Subscription Generators</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
                      Code Expiration
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">
                      Never expires (Direct static)
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400">
                      Never (for static)
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400">
                      Never (tied to account)
                    </td>
                    <td className="py-3.5 px-6 text-rose-500 font-medium">
                      Expires after 14-day trial
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
                      Registration Required
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">
                      Zero signup required
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400">
                      No for basic
                    </td>
                    <td className="py-3.5 px-6 text-rose-500 font-medium">
                      Account mandatory
                    </td>
                    <td className="py-3.5 px-6 text-rose-500 font-medium">
                      Account + Credit Card
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
                      Free Code Limits
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">
                      Unlimited
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400">
                      Unlimited static
                    </td>
                    <td className="py-3.5 px-6 text-amber-600 font-medium">
                      2 codes per month
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400">
                      Limited trial codes
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
                      Client-Side Privacy
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">
                      100% in-browser processing
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400">
                      Partial (Partner redirects)
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400">
                      Server routing &amp; tracking
                    </td>
                    <td className="py-3.5 px-6 text-rose-500 font-medium">
                      All scans routed &amp; tracked
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
                      Vector SVG &amp; 4096px Export
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">
                      Free instant download
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400">
                      SVG available
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400">
                      Basic PNG/SVG
                    </td>
                    <td className="py-3.5 px-6 text-rose-500 font-medium">
                      Locked behind paid plan
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
                      Integrated Scan Diagnostics
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">
                      Included with optical distance math
                    </td>
                    <td className="py-3.5 px-6 text-slate-400">
                      Not available
                    </td>
                    <td className="py-3.5 px-6 text-slate-400">
                      Not available
                    </td>
                    <td className="py-3.5 px-6 text-slate-400">
                      Not available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Real-World Business Applications */}
        <section className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Practical Use Cases
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                Engineered for Real-World Physical Scenarios
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Utensils className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Restaurants &amp; Dining
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Table tents and coasters pointing directly to your live mobile menu. Use Level Q error correction to resist smudges and spills.
                </p>
                <Link
                  href="/blog/restaurant-menu-qr-code-guide"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  <span>Read Restaurant Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Wifi className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Guest Wi-Fi Cards
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Airbnb hosts, boutique hotels, and offices. Guests scan to connect automatically without typing complex passwords.
                </p>
                <Link
                  href="/blog/wifi-qr-code-setup-and-security"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  <span>Read Wi-Fi Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Digital Business Cards
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  vCard 3.0 formatting adds your full contact card to phone address books in one tap. Perfect for back-of-card printing.
                </p>
                <Link
                  href="/blog/vcard-qr-code-digital-business-card"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  <span>Read vCard Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Packaging &amp; Print
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Export infinitely scalable Vector SVG files that prepress and packaging printers can import directly into Adobe Illustrator.
                </p>
                <Link
                  href="/blog/qr-code-print-sizing-and-readability"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  <span>Read Sizing Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contextual UCreates Agency Spotlight */}
        <section className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <UcreatesBanner context="general" />
        </section>

        {/* Featured Educational Articles */}
        <section className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Educational Resources
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                  Guides, Best Practices &amp; Research
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>View All Articles</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ARTICLES.slice(0, 3).map((article) => (
                <article
                  key={article.slug}
                  className="flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {article.category}
                      </span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                      {article.summary}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <span>Read Full Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Compact FAQ Section */}
        <section className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Clear Answers
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2"
                >
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>{item.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
