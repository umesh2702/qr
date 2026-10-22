import React from "react";
import Link from "next/link";
import { QrCode, Home } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
            <QrCode className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Error 404 • Destination Missing
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Page Not Found
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The page you are looking for doesn’t exist or has moved. Let’s get you back on track to generating QR codes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Back to QR Generator</span>
            </Link>

            <Link
              href="/blog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
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
