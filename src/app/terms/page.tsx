import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getAbsoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of service for UCode. Learn about your rights to use generated QR codes for personal and commercial applications without royalties or fees.",
  alternates: {
    canonical: getAbsoluteUrl("/terms"),
  },
  openGraph: {
    title: "Terms of Use | UCode",
    description:
      "Terms of service for UCode. Learn about your rights to use generated QR codes for personal and commercial applications without royalties or fees.",
    url: getAbsoluteUrl("/terms"),
    type: "website",
    images: [
      {
        url: getAbsoluteUrl("/og-image.png"),
        width: 1200,
        height: 630,
        alt: "UCode Terms of Use",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Use | UCode",
    description:
      "Terms of service for UCode. Learn about your rights to use generated QR codes for personal and commercial applications without royalties or fees.",
    images: [getAbsoluteUrl("/og-image.png")],
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-neutral-900">
      <Header />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
              Terms of Use
            </h1>
            <p className="text-sm text-neutral-500">
              Last updated: October 2026 • Effective immediately
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 sm:p-10 shadow-sm space-y-8 text-sm sm:text-base text-neutral-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-neutral-900">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using UCode (a product operated by UCreates), you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, please do not use the application.
              </p>
            </section>

            <section className="space-y-2 pt-6 border-t border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900">
                2. Free Commercial &amp; Personal License
              </h2>
              <p>
                All static QR codes generated through UCode may be used freely for personal, commercial, and editorial purposes without payment of royalties or licensing fees.
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-600 text-sm pl-2">
                <li>You may print generated codes on packaging, business cards, signs, menus, and marketing collateral.</li>
                <li>UCode claims zero ownership or copyright over the data, logos, or content you encode into your QR codes.</li>
                <li>Generated static codes never expire and have no scan limitations.</li>
              </ul>
            </section>

            <section className="space-y-2 pt-6 border-t border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900">
                3. Acceptable Use Policy
              </h2>
              <p>
                You agree not to use UCode to generate barcodes directing users to malicious software, phishing pages, deceptive scams, or unlawful content. UCode reserves the right to block malicious traffic patterns to protect general web safety.
              </p>
            </section>

            <section className="space-y-2 pt-6 border-t border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900">
                4. Pre-Print Testing &amp; Disclaimer of Warranty
              </h2>
              <p>
                While UCode provides industry-leading diagnostic tools and optical scannability calculations, optical scanning depends on multiple external physical variables—including ambient lighting, camera hardware, printing substrate, ink bleeding, and physical distance.
              </p>
              <p className="font-semibold text-neutral-900">
                You must always conduct a test print on physical paper and verify scanning with multiple smartphones before placing commercial print orders.
              </p>
              <p className="text-xs text-neutral-500">
                UCode is provided &ldquo;as is&rdquo; without warranty of any kind, express or implied. Under no circumstances shall UCreates or its developers be held liable for any commercial printing costs, lost revenue, or damages resulting from unreadable printed codes.
              </p>
            </section>

            <section className="space-y-2 pt-6 border-t border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900">
                5. Questions
              </h2>
              <p>
                For questions regarding our terms, email us at:{" "}
                <strong className="text-neutral-900 font-medium">umesh@ucreates.online</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
