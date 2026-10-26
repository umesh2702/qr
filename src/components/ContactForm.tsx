"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { analytics } from "@/lib/analytics";

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    serviceType: "Web Application Development",
    budget: "$2,500 – $5,000",
    timeline: "1–2 Months",
    message: "",
    honeypot: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    notConfigured?: boolean;
  } | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = "Full name is required (minimum 2 characters).";
    }
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      errs.email = "Please provide a valid business email address.";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = "Please describe your project or enquiry in at least 10 characters.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitResult({
          success: true,
          message: data.message,
        });
        analytics.track("enquiry_form_submitted", {
          ctaLocation: "contact_page",
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          serviceType: "Web Application Development",
          budget: "$2,500 – $5,000",
          timeline: "1–2 Months",
          message: "",
          honeypot: "",
        });
      } else {
        setSubmitResult({
          success: false,
          notConfigured: data.notConfigured,
          message: data.message || "Failed to submit enquiry. Please check your inputs.",
        });
        if (data.errors) {
          setErrors(data.errors);
        }
      }
    } catch {
      setSubmitResult({
        success: false,
        message: "Network error. Please try again or reach out to us directly at umesh@ucreates.online.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-10 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
          Start a Conversation with UCreates
        </h2>
        <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
          Whether you need a bespoke web app, high-converting UI/UX design, or an interactive mobile dining portal, tell us about your goals.
        </p>
      </div>

      {submitResult?.success ? (
        <div className="p-6 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <h3 className="font-semibold text-base">Enquiry Successfully Transmitted!</h3>
          </div>
          <p className="text-sm text-emerald-800 leading-relaxed">
            {submitResult.message}
          </p>
          <button
            type="button"
            onClick={() => setSubmitResult(null)}
            className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Send Another Enquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitResult && !submitResult.success && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
                submitResult.notConfigured
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <AlertCircle
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  submitResult.notConfigured ? "text-amber-600" : "text-rose-600"
                }`}
              />
              <div className="space-y-1.5">
                <p className="font-medium">{submitResult.message}</p>
                {submitResult.notConfigured && (
                  <a
                    href="mailto:umesh@ucreates.online"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:underline"
                  >
                    <span>Click to email umesh@ucreates.online directly &rarr;</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Hidden Honeypot Spam Bot Trap */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website-trap">Leave this field blank</label>
            <input
              type="text"
              id="website-trap"
              name="website-trap"
              tabIndex={-1}
              autoComplete="off"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-600 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Alex Morgan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-neutral-50/50 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm ${
                  errors.name
                    ? "border-rose-400 focus:ring-rose-400 focus:border-rose-400"
                    : "border-neutral-200"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-600 mb-1.5">
                Business Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="alex@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-neutral-50/50 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm ${
                  errors.email
                    ? "border-rose-400 focus:ring-rose-400 focus:border-rose-400"
                    : "border-neutral-200"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-600 mb-1.5">
                Company / Organization
              </label>
              <input
                type="text"
                placeholder="Morgan Hospitality Group"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-600 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-600 mb-1.5">
                Primary Need
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 text-sm"
              >
                <option value="Web Application Development">Web Application</option>
                <option value="UI/UX & Brand Design">UI/UX &amp; Brand Design</option>
                <option value="Hospitality Digital Menu">Digital Menu &amp; Dining</option>
                <option value="Mobile App Development">Mobile Application</option>
                <option value="Ecommerce Platform">Ecommerce Store</option>
                <option value="Consultation & Strategy">Consultation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-600 mb-1.5">
                Target Budget
              </label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 text-sm"
              >
                <option value="Under $2,500">Under $2,500</option>
                <option value="$2,500 – $5,000">$2,500 – $5,000</option>
                <option value="$5,000 – $15,000">$5,000 – $15,000</option>
                <option value="$15,000+">$15,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-600 mb-1.5">
                Timeline
              </label>
              <select
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 text-sm"
              >
                <option value="Urgent (< 1 month)">Urgent (&lt; 1 month)</option>
                <option value="1–2 Months">1–2 Months</option>
                <option value="3+ Months">3+ Months</option>
                <option value="Exploring Options">Exploring Options</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-neutral-600 mb-1.5">
              Project Description & Goals <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Tell us about what you want to build, current challenges, and desired launch date..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-neutral-50/50 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm leading-relaxed ${
                errors.message
                  ? "border-rose-400 focus:ring-rose-400 focus:border-rose-400"
                  : "border-neutral-200"
              }`}
            />
            {errors.message && (
              <p className="mt-1 text-xs text-rose-500">{errors.message}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <p className="text-xs text-neutral-500">
              We respect your privacy. No spam or third-party sharing.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-neutral-900 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Project Enquiry</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
