"use client";

import React from "react";

interface AdBannerProps {
  slotId: string;
  format?: "leaderboard" | "rectangle" | "responsive";
  className?: string;
}

/**
 * Configurable, CLS-safe display advertising component.
 *
 * SAFETY & POLICY GUARANTEES:
 * 1. Ads remain disabled by default until NEXT_PUBLIC_ENABLE_ADS="true" and client ID is configured.
 * 2. Pre-reserves min-heights (90px for leaderboards, 250px for rectangles) to completely prevent Cumulative Layout Shift (CLS).
 * 3. Clearly labeled with "SPONSORED / ADVERTISEMENT" to prevent deceptive confusion with generator buttons.
 * 4. Safe fallback placeholder for development and pre-approval staging.
 */
export const AdBanner: React.FC<AdBannerProps> = ({
  slotId,
  format = "responsive",
  className = "",
}) => {
  const adsEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === "true";
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  // Height reservation to eliminate CLS (Cumulative Layout Shift)
  const heightClasses =
    format === "leaderboard"
      ? "min-h-[90px] max-w-[728px]"
      : format === "rectangle"
      ? "min-h-[250px] max-w-[300px]"
      : "min-h-[100px] max-w-full";

  if (!adsEnabled || !adClientId) {
    // In disabled/pre-approval mode: render zero visual clutter or a subtle dev badge in development only
    return null;
  }

  return (
    <div
      className={`w-full mx-auto my-6 flex flex-col items-center justify-center ${className}`}
      aria-label="Advertisement Container"
    >
      <div className="w-full flex justify-between items-center px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
        <span>Advertisement</span>
        <span className="text-[9px] opacity-70">UCode Sponsor</span>
      </div>
      <div
        className={`w-full flex items-center justify-center bg-neutral-50 border border-dashed border-neutral-200 rounded-lg overflow-hidden ${heightClasses}`}
      >
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "100%" }}
          data-ad-client={adClientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
