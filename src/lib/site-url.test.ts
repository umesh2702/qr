import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getBaseUrl,
  getAbsoluteUrl,
  PRODUCTION_CANONICAL_DOMAIN,
  UCREATES_OFFICIAL_URL,
} from "./site-url";

describe("Canonical Site URL Helper (site-url.ts)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.SITE_URL;
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("exports PRODUCTION_CANONICAL_DOMAIN as https://ucodeqr.in", () => {
    expect(PRODUCTION_CANONICAL_DOMAIN).toBe("https://ucodeqr.in");
  });

  it("exports UCREATES_OFFICIAL_URL as https://ucreates.online", () => {
    expect(UCREATES_OFFICIAL_URL).toBe("https://ucreates.online");
    expect(UCREATES_OFFICIAL_URL).not.toContain("ucreates.io");
  });

  it("defaults to https://ucodeqr.in when no environment variables are configured", () => {
    expect(getBaseUrl()).toBe("https://ucodeqr.in");
  });

  it("never emits vercel.app or ucode.app as fallback", () => {
    const url = getBaseUrl();
    expect(url).not.toContain("vercel.app");
    expect(url).not.toContain("ucode.app");
    expect(url).toBe("https://ucodeqr.in");
  });

  it("respects and normalizes NEXT_PUBLIC_SITE_URL with trailing slashes", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://ucodeqr.in///";
    expect(getBaseUrl()).toBe("https://ucodeqr.in");
  });

  it("prepends https:// if protocol is omitted in NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "ucodeqr.in";
    expect(getBaseUrl()).toBe("https://ucodeqr.in");
  });

  it("handles whitespace in environment variable gracefully", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "   https://ucodeqr.in   ";
    expect(getBaseUrl()).toBe("https://ucodeqr.in");
  });

  it("resolves getAbsoluteUrl('/') to the base URL without trailing slash", () => {
    expect(getAbsoluteUrl("/")).toBe("https://ucodeqr.in");
    expect(getAbsoluteUrl("")).toBe("https://ucodeqr.in");
  });

  it("normalizes path with leading slash", () => {
    expect(getAbsoluteUrl("/sitemap.xml")).toBe("https://ucodeqr.in/sitemap.xml");
    expect(getAbsoluteUrl("/robots.txt")).toBe("https://ucodeqr.in/robots.txt");
    expect(getAbsoluteUrl("/about")).toBe("https://ucodeqr.in/about");
  });

  it("normalizes path without leading slash", () => {
    expect(getAbsoluteUrl("services")).toBe("https://ucodeqr.in/services");
    expect(getAbsoluteUrl("blog/restaurant-menu-qr-code-guide")).toBe(
      "https://ucodeqr.in/blog/restaurant-menu-qr-code-guide"
    );
  });

  it("prevents duplicate consecutive slashes in generated paths", () => {
    expect(getAbsoluteUrl("///contact")).toBe("https://ucodeqr.in/contact");
  });
});
