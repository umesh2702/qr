import React from "react";
import type { Metadata } from "next";
import { Mail, Clock, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { getAbsoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Contact UCode & UCreates — Project Enquiries & Engineering",
  description:
    "Have a question about UCode or need custom web and mobile engineering from UCreates? Get in touch with our engineering team.",
  alternates: {
    canonical: getAbsoluteUrl("/contact"),
  },
  openGraph: {
    title: "Contact UCode & UCreates — Project Enquiries & Engineering",
    description:
      "Have a question about UCode or need custom web and mobile engineering from UCreates? Get in touch with our engineering team.",
    url: getAbsoluteUrl("/contact"),
    type: "website",
    images: [
      {
        url: getAbsoluteUrl("/og-image.png"),
        width: 1200,
        height: 630,
        alt: "Contact UCode & UCreates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact UCode & UCreates — Project Enquiries & Engineering",
    description:
      "Have a question about UCode or need custom web and mobile engineering from UCreates? Get in touch with our engineering team.",
    images: [getAbsoluteUrl("/og-image.png")],
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 antialiased">
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Inquiries &amp; Support
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Get in Touch
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Have feedback on UCode, need help with a custom QR deployment, or looking for bespoke web engineering from UCreates? We look forward to hearing from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Direct Info Cards */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-xl border border-slate-200/90 bg-white space-y-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900">Direct Email</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  For general questions, partnerships, or immediate support inquiries:
                </p>
                <a
                  href="mailto:umesh@ucreates.online"
                  className="block text-xs font-semibold text-indigo-600 hover:underline pt-1"
                >
                  umesh@ucreates.online
                </a>
              </div>

              <div className="p-5 rounded-xl border border-slate-200/90 bg-white space-y-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900">Response Time</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We review project enquiries within 24 business hours. You will receive a direct reply from a senior solutions architect.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200/90 bg-white space-y-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900">UCreates Studio</h3>
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
