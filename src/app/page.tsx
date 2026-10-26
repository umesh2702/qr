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
import { getAbsoluteUrl, UCREATES_OFFICIAL_URL } from "@/lib/site-url";

const pageUrl = getAbsoluteUrl("/");

export const metadata: Metadata = {
  title: {
    absolute: "UCode — Free, Privacy-First QR Code Generator | No Expiry, No Signup",
  },
  description:
    "Generate permanent, high-resolution static QR codes for websites, Wi-Fi, vCard, WhatsApp, and email directly in your browser. Vector SVG and Ultra-HD 4096px PNG downloads with zero watermarks.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "UCode — Free, Privacy-First QR Code Generator",
    description:
      "Permanent static QR codes generated client-side. No signups, no expiring trials, no redirected links. Download pure SVG and Ultra-HD PNG.",
    url: pageUrl,
    siteName: "UCode by UCreates",
    type: "website",
    images: [
      {
        url: getAbsoluteUrl("/og-image.png"),
        width: 1200,
        height: 630,
        alt: "UCode — Free, Privacy-First QR Code Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UCode — Free, Privacy-First QR Code Generator",
    description: "Create permanent, scannable QR codes in seconds. Vector SVG & Ultra-HD PNG downloads.",
    images: [getAbsoluteUrl("/og-image.png")],
  },
};

export default function HomePage() {
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${pageUrl}#website`,
        url: pageUrl,
        name: "UCode",
        description:
          "Free, privacy-first QR code generator by UCreates. Permanent static codes with no expiration.",
        publisher: {
          "@type": "Organization",
          "@id": `${pageUrl}#organization`,
          name: "UCreates",
          url: UCREATES_OFFICIAL_URL,
          logo: {
            "@type": "ImageObject",
            url: getAbsoluteUrl("/favicon.ico"),
          },
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#webapp`,
        name: "UCode",
        url: pageUrl,
        applicationCategory: "DesignApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript. Requires HTML5 Canvas.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "A privacy-first, client-side static QR code generator supporting 10 standard QR types with vector SVG and 4096px print exports.",
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 antialiased">
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
        <section className="py-14 md:py-20 border-t border-slate-200/80 bg-slate-50/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Frictionless Workflow
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                How UCode Works
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                No accounts to register, no verification emails to click. Three simple steps to print-ready QR codes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl border border-slate-200/90 bg-white">
                <span className="text-xs font-mono font-bold text-slate-400 block mb-3">01</span>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                  Select Type &amp; Input Data
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Choose from 10 supported types: Website URL, Guest Wi-Fi, vCard contact, WhatsApp, Calendar Events, and more.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200/90 bg-white">
                <span className="text-xs font-mono font-bold text-slate-400 block mb-3">02</span>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                  Style &amp; Validate Instantly
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Customize brand colors, error correction, and add your center logo. Built-in diagnostics verify scannability in real time.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200/90 bg-white">
                <span className="text-xs font-mono font-bold text-slate-400 block mb-3">03</span>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                  Instant Vector or Ultra-HD Download
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Download infinitely scalable Vector SVG for prepress, or high-res PNG at up to 4096px resolution with zero watermarks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table vs. Competitors */}
        <section className="py-14 md:py-20 border-t border-slate-200/80 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ethical Architecture
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                How UCode Compares
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                An objective breakdown of privacy, longevity, and print fidelity.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-700">
                    <th className="py-3.5 px-5">Capability / Policy</th>
                    <th className="py-3.5 px-5 font-bold text-slate-950 bg-slate-100/60">
                      UCode (Free Forever)
                    </th>
                    <th className="py-3.5 px-5 text-slate-500">QRCode Monkey</th>
                    <th className="py-3.5 px-5 text-slate-500">Bitly Free Tier</th>
                    <th className="py-3.5 px-5 text-slate-500">Subscription SaaS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr>
                    <td className="py-3 px-5 font-medium text-slate-900">
                      Code Expiration
                    </td>
                    <td className="py-3 px-5 font-semibold text-emerald-700 bg-slate-50/40">
                      Never expires (Direct static)
                    </td>
                    <td className="py-3 px-5 text-slate-600">
                      Never (for static)
                    </td>
                    <td className="py-3 px-5 text-slate-600">
                      Never (tied to account)
                    </td>
                    <td className="py-3 px-5 text-rose-600 font-medium">
                      Expires after 14-day trial
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-slate-900">
                      Registration Required
                    </td>
                    <td className="py-3 px-5 font-semibold text-emerald-700 bg-slate-50/40">
                      Zero signup required
                    </td>
                    <td className="py-3 px-5 text-slate-600">
                      No for basic
                    </td>
                    <td className="py-3 px-5 text-slate-600">
                      Account mandatory
                    </td>
                    <td className="py-3 px-5 text-rose-600 font-medium">
                      Account + Credit Card
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-slate-900">
                      Free Code Limits
                    </td>
                    <td className="py-3 px-5 font-semibold text-emerald-700 bg-slate-50/40">
                      Unlimited
                    </td>
                    <td className="py-3 px-5 text-slate-600">
                      Unlimited static
                    </td>
                    <td className="py-3 px-5 text-slate-600">
                      2 codes per month
                    </td>
                    <td className="py-3 px-5 text-slate-600">
                      Limited trial codes
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-slate-900">
                      Client-Side Privacy
                    </td>
                    <td className="py-3 px-5 font-semibold text-emerald-700 bg-slate-50/40">
                      100% in-browser processing
                    </td>
                    <td className="py-3 px-5 text-slate-600">
                      Partial (Partner redirects)
                    </td>
                    <td className="py-3 px-5 text-slate-600">
                      Server routing &amp; tracking
                    </td>
                    <td className="py-3 px-5 text-rose-600 font-medium">
                      All scans routed &amp; tracked
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-slate-900">
                      Vector SVG &amp; 4096px Export
                    </td>
                    <td className="py-3 px-5 font-semibold text-emerald-700 bg-slate-50/40">
                      Free instant download
                    </td>
                    <td className="py-3 px-5 text-slate-600">
                      SVG available
                    </td>
                    <td className="py-3 px-5 text-slate-600">
                      Basic PNG/SVG
                    </td>
                    <td className="py-3 px-5 text-rose-600 font-medium">
                      Locked behind paid plan
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-slate-900">
                      Integrated Scan Diagnostics
                    </td>
                    <td className="py-3 px-5 font-semibold text-emerald-700 bg-slate-50/40">
                      Included with optical distance math
                    </td>
                    <td className="py-3 px-5 text-slate-400">
                      Not available
                    </td>
                    <td className="py-3 px-5 text-slate-400">
                      Not available
                    </td>
                    <td className="py-3 px-5 text-slate-400">
                      Not available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Real-World Business Applications */}
        <section className="py-14 md:py-20 border-t border-slate-200/80 bg-slate-50/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Practical Applications
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                Engineered for Physical Environments
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-xl border border-slate-200/90 bg-white space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
                  <Utensils className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Restaurants &amp; Dining
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Table tents and coasters pointing directly to your live mobile menu without slow 40MB PDF downloads.
                </p>
                <Link
                  href="/blog/restaurant-menu-qr-code-guide"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline pt-1"
                >
                  <span>Menu Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-5 rounded-xl border border-slate-200/90 bg-white space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
                  <Wifi className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Guest Wi-Fi Cards
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Airbnb hosts, boutique hotels, and offices. Guests scan to connect automatically without typing passwords.
                </p>
                <Link
                  href="/blog/wifi-qr-code-setup-and-security"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline pt-1"
                >
                  <span>Wi-Fi Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-5 rounded-xl border border-slate-200/90 bg-white space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Digital Business Cards
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  vCard 3.0 formatting adds your full contact card to phone address books in one tap. Perfect for back-of-card printing.
                </p>
                <Link
                  href="/blog/vcard-qr-code-digital-business-card"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline pt-1"
                >
                  <span>vCard Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-5 rounded-xl border border-slate-200/90 bg-white space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Packaging &amp; Print
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Export infinitely scalable Vector SVG files that prepress and packaging printers can import directly into Adobe Illustrator.
                </p>
                <Link
                  href="/blog/qr-code-print-sizing-and-readability"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline pt-1"
                >
                  <span>Sizing Guide</span>
                  <ArrowRight className="w-3 h-3" />
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
        <section className="py-14 md:py-20 border-t border-slate-200/80 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Educational Resources
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                  Guides &amp; Technical Research
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <span>View All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ARTICLES.slice(0, 3).map((article) => (
                <article
                  key={article.slug}
                  className="flex flex-col justify-between p-5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-700">
                        {article.category}
                      </span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-100">
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
          </div>
        </section>

        {/* Compact FAQ Section */}
        <section className="py-14 md:py-20 border-t border-slate-200/80 bg-slate-50/40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Honest Answers
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl border border-slate-200/90 bg-white space-y-1.5"
                >
                  <h3 className="text-sm font-semibold text-slate-900 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{item.q}</span>
                  </h3>
                  <p className="text-xs text-slate-500 pl-6 leading-relaxed">
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
