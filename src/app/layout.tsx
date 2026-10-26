import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getBaseUrl, UCREATES_OFFICIAL_URL } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "UCode — Free, Privacy-First QR Code Generator | No Expiry, No Signup",
    template: "%s | UCode",
  },
  description:
    "Generate permanent, high-resolution static QR codes for websites, Wi-Fi, vCard, WhatsApp, and email directly in your browser. Vector SVG and Ultra-HD 4096px PNG downloads with zero watermarks.",
  keywords: [
    "QR code generator",
    "free QR code",
    "static QR code",
    "privacy-first QR code",
    "vector SVG QR code",
    "Wi-Fi QR code generator",
    "vCard QR code",
    "restaurant menu QR code",
    "no expiration QR code",
  ],
  authors: [{ name: "UCreates", url: UCREATES_OFFICIAL_URL }],
  creator: "UCreates",
  publisher: "UCreates",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "UCode — Free, Privacy-First QR Code Generator",
    description:
      "Permanent static QR codes generated client-side. No signups, no expiring trials, no redirected links. Download pure SVG and Ultra-HD PNG.",
    url: baseUrl,
    siteName: "UCode by UCreates",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UCode — Free, Privacy-First QR Code Generator by UCreates",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UCode — Free, Privacy-First QR Code Generator",
    description: "Create permanent, scannable QR codes in seconds. Vector SVG & Ultra-HD PNG downloads.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900 selection:bg-indigo-500 selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
