/**
 * Canonical Site URL Configuration
 *
 * Production Canonical Domain: https://ucodeqr.in
 *
 * Resolves the consistent absolute production base URL:
 * 1. Explicitly configured NEXT_PUBLIC_SITE_URL (or SITE_URL) environment variable
 * 2. Safe production fallback: https://ucodeqr.in
 *
 * Guaranteed Behavior:
 * - Emits https://ucodeqr.in as the sole canonical domain
 * - Strips trailing slashes to ensure consistent canonicalization
 * - Does not emit *.vercel.app or ucode.app as canonical URLs
 */

export const PRODUCTION_CANONICAL_DOMAIN = "https://ucodeqr.in";
export const UCREATES_OFFICIAL_URL = "https://ucreates.online";

export function getBaseUrl(): string {
  // 1. Explicit environment variable override (configured in Vercel or .env.local)
  const envUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "").trim();

  if (envUrl !== "") {
    const normalized = envUrl.startsWith("http://") || envUrl.startsWith("https://")
      ? envUrl
      : `https://${envUrl}`;
    return normalized.replace(/\/+$/, "");
  }

  // 2. Safe production fallback
  return PRODUCTION_CANONICAL_DOMAIN;
}

/**
 * Returns an absolute canonical URL for a given relative path.
 * Normalizes leading and trailing slashes to prevent accidental duplicate path separators.
 */
export function getAbsoluteUrl(path: string = "/"): string {
  const base = getBaseUrl();
  const trimmed = (path || "").trim();

  if (!trimmed || trimmed === "/") {
    return base;
  }

  const cleanPath = trimmed.replace(/^\/+/, "");
  return `${base}/${cleanPath}`;
}

