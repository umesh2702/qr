/**
 * Canonical Site URL Helper
 *
 * Resolves the consistent absolute production base URL in accordance with:
 * 1. Explicitly configured NEXT_PUBLIC_SITE_URL or SITE_URL environment variable
 * 2. Vercel system environment variables (VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL)
 * 3. Verified live production deployment fallback (https://qr-eight-omega.vercel.app)
 */
export function getBaseUrl(): string {
  // 1. Explicit user/team environment variable override (e.g., custom domain https://ucode.app)
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/+$/, "");
  }

  if (process.env.SITE_URL && process.env.SITE_URL.trim() !== "") {
    return process.env.SITE_URL.trim().replace(/\/+$/, "");
  }

  // 2. Vercel production deployment domain (automatically set by Vercel platform)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL.trim() !== "") {
    const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\/+$/, "");
    return domain.startsWith("http") ? domain : `https://${domain}`;
  }

  if (process.env.VERCEL_URL && process.env.VERCEL_URL.trim() !== "") {
    const domain = process.env.VERCEL_URL.trim().replace(/\/+$/, "");
    return domain.startsWith("http") ? domain : `https://${domain}`;
  }

  // 3. Fallback to the live verified Vercel production URL for this project
  return "https://qr-eight-omega.vercel.app";
}

/**
 * Returns an absolute canonical URL for a given relative path
 */
export function getAbsoluteUrl(path: string = "/"): string {
  const base = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath === "/") return base;
  return `${base}${cleanPath}`;
}
