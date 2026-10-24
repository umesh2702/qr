import React from "react";
import type { Metadata } from "next";
import {
  ArrowRight,
  Code2,
  Palette,
  Smartphone,
  Utensils,
  ShoppingBag,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { getAbsoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "UCreates Digital Solutions — Web Development & UI/UX Studio",
  description:
    "UCreates crafts high-converting digital products, custom web applications, responsive dining menus, and mobile experiences. The digital studio behind UCode.",
  alternates: {
    canonical: getAbsoluteUrl("/services"),
  },
  openGraph: {
    title: "UCreates Digital Solutions — Web Development & UI/UX Studio",
    description:
      "UCreates crafts high-converting digital products, custom web applications, responsive dining menus, and mobile experiences. The digital studio behind UCode.",
    url: getAbsoluteUrl("/services"),
    type: "website",
    images: [
      {
        url: getAbsoluteUrl("/og-image.png"),
        width: 1200,
        height: 630,
        alt: "UCreates Digital Solutions — Web Development & UI/UX Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UCreates Digital Solutions — Web Development & UI/UX Studio",
    description:
      "UCreates crafts high-converting digital products, custom web applications, responsive dining menus, and mobile experiences. The digital studio behind UCode.",
    images: [getAbsoluteUrl("/og-image.png")],
  },
};

export default function ServicesPage() {
  const services = [
    {
      icon: Code2,
      title: "Web Application Engineering",
      description:
        "Full-stack Next.js, React, and TypeScript applications built for speed, SEO excellence, and rock-solid reliability.",
      features: [
        "Modern Next.js App Router architecture",
        "Rigorous TypeScript type-safety",
        "Sub-second Core Web Vitals optimization",
        "API integrations & custom databases",
      ],
    },
    {
      icon: Palette,
      title: "UI/UX & Brand Design",
      description:
        "Elevate your brand beyond generic templates. We design custom design systems, typography tokens, and conversion-focused interfaces.",
      features: [
        "Figma design systems & interactive prototypes",
        "Executive brand identity & styling",
        "Accessibility compliance (WCAG 2.1)",
        "Mobile-first responsive layouts",
      ],
    },
    {
      icon: Utensils,
      title: "Hospitality & Digital Dining Portals",
      description:
        "Replace slow, pinch-and-zoom PDF menus with lightning-fast interactive mobile menus that increase table turnover and average order value.",
      features: [
        "Instant updates without reprinting QR codes",
        "Dietary & allergen filter tags",
        "Direct POS and ordering integration",
        "Designed for low-light ambiance scanning",
      ],
    },
    {
      icon: Smartphone,
      title: "Mobile Applications & PWAs",
      description:
        "Native and cross-platform mobile applications that engage users and deliver fluid, touch-optimized performance on iOS and Android.",
      features: [
        "React Native & Progressive Web Apps (PWA)",
        "Offline caching & push notifications",
        "App Store & Google Play deployment",
        "Biometric login & native camera features",
      ],
    },
    {
      icon: ShoppingBag,
      title: "Modern Ecommerce Experiences",
      description:
        "High-converting Shopify, headless commerce, and custom storefronts engineered for fast checkouts and maximum order completion.",
      features: [
        "Custom Shopify themes & headless architectures",
        "Stripe payment orchestration",
        "Conversion rate optimization (CRO)",
        "Automated inventory & ERP sync",
      ],
    },
    {
      icon: Calendar,
      title: "Event Portals & Conference Tech",
      description:
        "Attendee registration microsites, high-concurrency check-in portals, and digital itineraries built for trade shows and summits.",
      features: [
        "Digital badge & attendee QR generation",
        "Real-time schedule and speaker directories",
        "Interactive sponsor lead capture",
        "Live concurrency load balancing",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 antialiased">
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {/* Hero Banner */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              UCreates Studio Solutions
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
              We Architect Digital Products That People Love to Use
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              UCreates is the digital design and engineering studio behind UCode. We partner with ambitious founders, restaurants, and enterprises to build bespoke web platforms, brand identities, and mobile applications.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((serv, i) => {
              const Icon = serv.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200/90 bg-white p-6 flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-3.5">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {serv.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {serv.description}
                    </p>
                    <ul className="space-y-1.5 pt-1">
                      {serv.features.map((feat, fIdx) => (
                        <li
                          key={fIdx}
                          className="flex items-center gap-2 text-xs text-slate-600"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <a
                      href="#enquiry-form"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      <span>Inquire About {serv.title.split(" ")[0]}</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Engagement Process */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-6 sm:p-8 space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Methodology
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-0.5">
                From Concept to Production in Weeks
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-3.5 bg-white rounded-lg border border-slate-200/70 space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400">01</span>
                <h4 className="font-semibold text-xs text-slate-900">Discovery &amp; Scope</h4>
                <p className="text-[11px] text-slate-500">
                  Align on technical architecture, user flows, and realistic milestones.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-slate-200/70 space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400">02</span>
                <h4 className="font-semibold text-xs text-slate-900">Design &amp; Prototype</h4>
                <p className="text-[11px] text-slate-500">
                  Interactive Figma prototypes and refined aesthetic design tokens.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-slate-200/70 space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400">03</span>
                <h4 className="font-semibold text-xs text-slate-900">Full-Stack Build</h4>
                <p className="text-[11px] text-slate-500">
                  Clean Next.js / TypeScript code with unit tests and SEO foundations.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-slate-200/70 space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400">04</span>
                <h4 className="font-semibold text-xs text-slate-900">Launch &amp; Scale</h4>
                <p className="text-[11px] text-slate-500">
                  Zero-downtime deployment, analytics tracking, and continuous improvement.
                </p>
              </div>
            </div>
          </div>

          {/* Integrated Enquiry Form */}
          <div id="enquiry-form" className="pt-4">
            <ContactForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
