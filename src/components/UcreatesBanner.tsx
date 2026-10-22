"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Code2, Palette, Smartphone, Globe } from "lucide-react";
import { analytics } from "@/lib/analytics";

interface UcreatesBannerProps {
  context?: "menu" | "vcard" | "general" | "event" | "wifi";
  className?: string;
}

export const UcreatesBanner: React.FC<UcreatesBannerProps> = ({
  context = "general",
  className = "",
}) => {
  const getContextualContent = () => {
    switch (context) {
      case "menu":
        return {
          tag: "Hospitality & Digital Menus",
          icon: Globe,
          title: "Need a custom mobile menu or restaurant website?",
          description:
            "Stop forcing customers to pinch and zoom slow PDF files. UCreates builds lightning-fast, interactive digital dining experiences with instant updates.",
          cta: "Explore Hospitality Solutions",
        };
      case "vcard":
        return {
          tag: "Executive Brand Identity",
          icon: Smartphone,
          title: "Upgrading your personal or corporate brand?",
          description:
            "From premium bespoke portfolio websites to comprehensive digital brand design, UCreates crafts memorable online presences for executives and agencies.",
          cta: "View Portfolio & Services",
        };
      case "event":
        return {
          tag: "Event & Conference Tech",
          icon: Sparkles,
          title: "Organizing an upcoming event or conference?",
          description:
            "UCreates creates custom attendee portals, registration microsites, and interactive mobile web apps designed for high-concurrency event check-ins.",
          cta: "Plan Your Event Platform",
        };
      case "wifi":
        return {
          tag: "Commercial Space Design",
          icon: Code2,
          title: "Transforming customer touchpoints in physical spaces?",
          description:
            "Combine physical QR wayfinding with bespoke web portals, loyalty programs, and automated guest onboarding designed by UCreates.",
          cta: "Discuss Your Project",
        };
      default:
        return {
          tag: "Digital Solutions by UCreates",
          icon: Palette,
          title: "Looking for tailored web, mobile, or UI/UX engineering?",
          description:
            "UCreates is the creative digital solutions studio behind UCode. We architect high-performance web applications, ecommerce stores, and digital products.",
          cta: "Discover UCreates Services",
        };
    }
  };

  const item = getContextualContent();
  const Icon = item.icon;

  const handleClick = () => {
    analytics.track("ucreates_cta_clicked", {
      ctaLocation: `banner_${context}`,
      ctaTarget: "/services",
    });
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-indigo-950/40 p-6 md:p-8 shadow-sm transition-all hover:shadow-md ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100/80 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            <Icon className="w-3.5 h-3.5" />
            <span>{item.tag}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {item.title}
          </h3>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="flex-shrink-0">
          <Link
            href="/services"
            onClick={handleClick}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{item.cta}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
