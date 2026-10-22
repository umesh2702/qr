"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Code2, Palette, Smartphone, Globe, Sparkles } from "lucide-react";
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
          title: "Need a custom mobile menu or restaurant web application?",
          description:
            "Replace slow, pinch-and-zoom PDF files. UCreates builds high-speed, interactive digital dining experiences with instant price and menu updates.",
          cta: "Explore Hospitality Solutions",
        };
      case "vcard":
        return {
          tag: "Executive Brand Identity",
          icon: Smartphone,
          title: "Upgrading your personal or corporate brand?",
          description:
            "From premium bespoke portfolio websites to comprehensive digital design systems, UCreates crafts memorable online presences for executives and firms.",
          cta: "View Portfolio & Services",
        };
      case "event":
        return {
          tag: "Event & Conference Tech",
          icon: Sparkles,
          title: "Organizing an upcoming event or corporate conference?",
          description:
            "UCreates creates custom attendee portals, registration microsites, and interactive web apps engineered for high-concurrency event check-ins.",
          cta: "Plan Your Event Platform",
        };
      case "wifi":
        return {
          tag: "Commercial Space Experiences",
          icon: Code2,
          title: "Transforming customer touchpoints in physical spaces?",
          description:
            "Combine physical QR wayfinding with bespoke web portals, loyalty programs, and automated guest onboarding engineered by UCreates.",
          cta: "Discuss Your Project",
        };
      default:
        return {
          tag: "Digital Solutions Studio",
          icon: Palette,
          title: "Looking for bespoke web, mobile, or UI/UX engineering?",
          description:
            "UCreates is the digital solutions studio behind UCode. We architect high-performance web applications, tailored digital products, and design systems.",
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
      className={`rounded-xl border border-slate-200/90 bg-slate-50/70 p-6 sm:p-7 transition-all ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Icon className="w-3.5 h-3.5 text-indigo-600" />
            <span>{item.tag}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            {item.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="flex-shrink-0">
          <Link
            href="/services"
            onClick={handleClick}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <span>{item.cta}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
