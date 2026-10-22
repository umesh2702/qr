import React from "react";
import type { Metadata } from "next";
import {
  Sparkles,
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

export const metadata: Metadata = {
  title: "UCreates Digital Solutions | Web Development, UI/UX & Mobile Products",
  description:
    "UCreates crafts high-converting digital products, custom web applications, responsive dining menus, and mobile experiences. The digital studio behind UCode.",
  alternates: {
    canonical: "https://ucode.app/services",
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Hero Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>UCreates Digital Solutions Studio</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              We Architect Digital Products That People Love to Use.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              UCreates is the digital design and engineering studio behind UCode. We partner with ambitious founders, restaurants, and enterprises to build bespoke web platforms, brand identities, and mobile applications.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((serv, i) => {
              const Icon = serv.icon;
              return (
                <div
                  key={i}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {serv.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {serv.description}
                    </p>
                    <ul className="space-y-2 pt-2">
                      {serv.features.map((feat, fIdx) => (
                        <li
                          key={fIdx}
                          className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href="#enquiry-form"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <span>Inquire About {serv.title.split(" ")[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Engagement Process */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                How We Partner
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                From Concept to Production in Weeks
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 space-y-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center mx-auto text-sm">
                  01
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Discovery &amp; Scope</h4>
                <p className="text-xs text-slate-500">
                  Align on technical architecture, user flows, and realistic milestones.
                </p>
              </div>

              <div className="p-4 space-y-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center mx-auto text-sm">
                  02
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Design &amp; Prototype</h4>
                <p className="text-xs text-slate-500">
                  Interactive Figma prototypes and refined aesthetic design tokens.
                </p>
              </div>

              <div className="p-4 space-y-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center mx-auto text-sm">
                  03
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Full-Stack Build</h4>
                <p className="text-xs text-slate-500">
                  Clean Next.js / TypeScript code with unit tests and SEO foundations.
                </p>
              </div>

              <div className="p-4 space-y-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center mx-auto text-sm">
                  04
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Launch &amp; Scale</h4>
                <p className="text-xs text-slate-500">
                  Zero-downtime deployment, analytics tracking, and continuous improvement.
                </p>
              </div>
            </div>
          </div>

          {/* Integrated Enquiry Form */}
          <div id="enquiry-form" className="pt-8">
            <ContactForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
