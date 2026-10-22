import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://ucode.app"),
  title: {
    default: "UCode — Free, Privacy-First QR Code Generator",
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
  authors: [{ name: "UCreates", url: "https://ucreates.io" }],
  creator: "UCreates",
  publisher: "UCreates",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "UCode — Free, Privacy-First QR Code Generator",
    description:
      "Permanent static QR codes generated client-side. No signups, no expiring trials, no redirected links. Download pure SVG and Ultra-HD PNG.",
    url: "https://ucode.app",
    siteName: "UCode by UCreates",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UCode — Free, Privacy-First QR Code Generator",
    description: "Create permanent, scannable QR codes in seconds. Vector SVG & Ultra-HD PNG downloads.",
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
      <body className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
