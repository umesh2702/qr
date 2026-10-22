import React from "react";
import type { Metadata } from "next";
import { Mail, MessageSquare, Clock, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact UCode & UCreates | Enquiries, Feedback & Custom Engineering",
  description:
    "Have a question about UCode or need custom web and mobile engineering from UCreates? Get in touch with our engineering team.",
  alternates: {
    canonical: "https://ucode.app/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Direct Support &amp; Engineering Enquiries</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Get in Touch
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Have feedback on UCode, need help with a custom QR deployment, or looking for bespoke web development from UCreates? We look forward to hearing from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Direct Info Cards */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Direct Email</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  For general questions, partnerships, or immediate support inquiries:
                </p>
                <a
                  href="mailto:hello@ucreates.io"
                  className="block text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  hello@ucreates.io
                </a>
              </div>

              <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Response Time</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We review project enquiries within 24 business hours. You will receive a direct reply from a senior solutions architect.
                </p>
              </div>

              <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">UCreates Solutions</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Looking for custom web apps, digital dining menus, or UX design systems? Fill out the project form to receive a detailed scope breakdown.
                </p>
              </div>
            </div>

            {/* Right Column: Contact & Project Form */}
            <div className="lg:col-span-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
