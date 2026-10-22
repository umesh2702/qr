import React from "react";
import Link from "next/link";
import { QrCode, Home } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-neutral-900">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto border border-neutral-200/80">
            <QrCode className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">
              Error 404 • Destination Missing
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
              Page Not Found
            </h1>
            <p className="text-sm text-neutral-600">
              The page you are looking for doesn’t exist or has moved. Let’s get you back on track to generating QR codes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs text-white bg-neutral-900 hover:bg-neutral-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back to QR Generator</span>
            </Link>

            <Link
              href="/blog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              <span>Explore Guides</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
