"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Globe,
  FileText,
  Wifi,
  MessageSquare,
  UserCheck,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Download,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Printer,
  Image as ImageIcon,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  QRType,
  QRFormDataMap,
  QRCustomizationOptions,
  ErrorCorrectionLevel,
  ScannabilityReport,
} from "@/types/qr";
import { encodeQRPayload } from "@/lib/qr-encoders";
import {
  validateQRFormData,
  evaluateScannability,
  calculatePrintSize,
} from "@/lib/qr-validator";
import {
  renderQRToCanvas,
  generateQRSVG,
  verifyCanvasScan,
  exportHighResPNG,
  triggerDataURLDownload,
  triggerSVGDownload,
} from "@/lib/qr-generator";
import { analytics } from "@/lib/analytics";

const QR_TYPE_CONFIG: {
  id: QRType;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  { id: "url", label: "Website URL", shortLabel: "URL", icon: Globe, description: "Direct link to any website, menu, or landing page." },
  { id: "wifi", label: "Wi-Fi Network", shortLabel: "Wi-Fi", icon: Wifi, description: "Connect smartphones to guest Wi-Fi without typing passwords." },
  { id: "vcard", label: "Contact (vCard)", shortLabel: "vCard", icon: UserCheck, description: "Digital business card that adds contacts to phone address books." },
  { id: "whatsapp", label: "WhatsApp Chat", shortLabel: "WhatsApp", icon: MessageSquare, description: "Start a direct WhatsApp conversation with optional prefilled text." },
  { id: "text", label: "Plain Text", shortLabel: "Text", icon: FileText, description: "Display unformatted plain text, serial numbers, or notes." },
  { id: "email", label: "Send Email", shortLabel: "Email", icon: Mail, description: "Prefilled email with recipient address, subject, and message." },
  { id: "phone", label: "Phone Call", shortLabel: "Phone", icon: Phone, description: "Dial a telephone number directly on mobile devices." },
  { id: "sms", label: "SMS Message", shortLabel: "SMS", icon: MessageCircle, description: "Send a prefilled text message to any phone number." },
  { id: "geo", label: "Location / Map", shortLabel: "Location", icon: MapPin, description: "Pinpoint latitude and longitude on Google Maps." },
  { id: "event", label: "Calendar Event", shortLabel: "Event", icon: Calendar, description: "iCalendar event invitation with start/end time and location." },
];

const COLOR_PRESETS = [
  { id: "classic", name: "Classic Black", fg: "#000000", bg: "#ffffff" },
  { id: "midnight", name: "Midnight Slate", fg: "#0f172a", bg: "#f8fafc" },
  { id: "indigo", name: "Deep Indigo", fg: "#312e81", bg: "#eef2ff" },
  { id: "emerald", name: "Forest Emerald", fg: "#064e3b", bg: "#f0fdf4" },
  { id: "ruby", name: "Wine Ruby", fg: "#881337", bg: "#fff1f2" },
  { id: "purple", name: "Royal Purple", fg: "#581c87", bg: "#faf5ff" },
  { id: "teal", name: "Cyber Teal", fg: "#164e63", bg: "#ecfeff" },
];

export const QRWorkspace: React.FC = () => {
  const [activeType, setActiveType] = useState<QRType>("url");

  // Form states initialized with realistic initial defaults
  const [formData, setFormData] = useState<QRFormDataMap>({
    url: { url: "https://ucreates.io" },
    text: { text: "Scan and explore UCode by UCreates." },
    wifi: { ssid: "UCreates-Guest", password: "welcomeguest2026", encryption: "WPA", hidden: false },
    whatsapp: { phone: "+15551234567", message: "Hi! I scanned your QR code from UCode." },
    vcard: {
      firstName: "Alex",
      lastName: "Morgan",
      organization: "UCreates Digital",
      title: "Lead Digital Solutions Architect",
      phone: "+1 (555) 019-2834",
      email: "alex@ucreates.io",
      url: "https://ucreates.io",
      address: "San Francisco, CA",
      note: "Connected via UCode digital business card",
    },
    email: { email: "hello@ucreates.io", subject: "Project Inquiry", body: "Hi UCreates team, I'd like to discuss a project." },
    phone: { phone: "+15550192834" },
    sms: { phone: "+15550192834", message: "Hello! Interested in discussing your services." },
    geo: { latitude: "37.7749", longitude: "-122.4194", query: "San Francisco, CA" },
    event: {
      title: "UCode Product Showcase",
      location: "Virtual & In-Person, SF",
      description: "Live demonstration of privacy-first QR engineering.",
      startDate: "2026-11-20T10:00",
      endDate: "2026-11-20T12:00",
      allDay: false,
    },
  });

  // Customization state
  const [customization, setCustomization] = useState<QRCustomizationOptions>({
    fgColor: "#000000",
    bgColor: "#ffffff",
    errorCorrectionLevel: "M",
    margin: 4,
    size: 512,
    logo: null,
    logoSize: 22,
  });

  const [activeTab, setActiveTab] = useState<"colors" | "options" | "logo">("colors");
  const [exportResolution, setExportResolution] = useState<number>(2048);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; decodedPayload: string | null } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Derive current payload and validation
  const currentFormData = formData[activeType];
  const payload = encodeQRPayload(activeType, currentFormData as never);
  const validation = validateQRFormData(activeType, currentFormData as never);
  const scannability: ScannabilityReport = evaluateScannability(customization);

  // Redraw canvas whenever payload, type, or customization changes
  const updateCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    if (!payload || !validation.isValid) {
      // Clear canvas if payload is invalid
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      return;
    }

    try {
      await renderQRToCanvas(canvasRef.current, payload, customization);
    } catch (err) {
      console.warn("Canvas render failed:", err);
    }
  }, [payload, validation.isValid, customization]);

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  // Track generator opened once
  useEffect(() => {
    analytics.track("generator_opened");
  }, []);

  // Listen for Escape key to close diagnostic modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isTestModalOpen) {
        setIsTestModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTestModalOpen]);

  const handleTypeChange = (type: QRType) => {
    setActiveType(type);
    analytics.track("qr_type_selected", { qrType: type });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validMimes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!validMimes.includes(file.type)) {
      setLogoError("Please upload an image file (PNG, JPEG, WebP, or SVG).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Image size must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      // Sanitize SVG inputs by rasterizing to safe canvas to neutralize potential script tags
      if (file.type === "image/svg+xml") {
        const img = new Image();
        img.onload = () => {
          const offscreen = document.createElement("canvas");
          const maxDim = 512;
          const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
          offscreen.width = Math.round(img.width * scale);
          offscreen.height = Math.round(img.height * scale);
          const ctx = offscreen.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
            const safeDataUrl = offscreen.toDataURL("image/png");
            setCustomization((prev) => ({
              ...prev,
              logo: safeDataUrl,
              errorCorrectionLevel:
                prev.errorCorrectionLevel === "L" || prev.errorCorrectionLevel === "M"
                  ? "Q"
                  : prev.errorCorrectionLevel,
            }));
          }
        };
        img.onerror = () => {
          setLogoError("Could not process SVG image. Please try a PNG or JPEG file.");
        };
        img.src = rawDataUrl;
      } else {
        setCustomization((prev) => ({
          ...prev,
          logo: rawDataUrl,
          errorCorrectionLevel:
            prev.errorCorrectionLevel === "L" || prev.errorCorrectionLevel === "M"
              ? "Q"
              : prev.errorCorrectionLevel,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPNG = async () => {
    if (!payload || !validation.isValid) return;

    try {
      const highResDataUrl = await exportHighResPNG(payload, customization, exportResolution);
      const filename = `ucode-${activeType}-${exportResolution}px.png`;
      triggerDataURLDownload(highResDataUrl, filename);
      setDownloadSuccess(`Downloaded ${exportResolution}px PNG!`);
      setTimeout(() => setDownloadSuccess(null), 3500);

      analytics.track("qr_download_completed", {
        qrType: activeType,
        exportFormat: "png",
        resolution: exportResolution,
      });
    } catch (err) {
      console.error("PNG export error:", err);
    }
  };

  const handleDownloadSVG = async () => {
    if (!payload || !validation.isValid) return;

    try {
      const svgString = await generateQRSVG(payload, customization);
      const filename = `ucode-${activeType}-vector.svg`;
      triggerSVGDownload(svgString, filename);
      setDownloadSuccess("Downloaded Pure Vector SVG!");
      setTimeout(() => setDownloadSuccess(null), 3500);

      analytics.track("qr_download_completed", {
        qrType: activeType,
        exportFormat: "svg",
      });
    } catch (err) {
      console.error("SVG export error:", err);
    }
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    setCopyError(null);
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (clipErr) {
          console.warn("Clipboard write failed:", clipErr);
          setCopyError("Clipboard permission denied or unsupported. Please use Download PNG.");
          setTimeout(() => setCopyError(null), 4000);
        }
      });
    } catch (err) {
      console.warn("Clipboard copy not supported or permitted:", err);
      setCopyError("Unable to copy image in this browser. Please use Download PNG.");
      setTimeout(() => setCopyError(null), 4000);
    }
  };

  const handleRunScanTest = () => {
    if (!canvasRef.current) return;
    const scan = verifyCanvasScan(canvasRef.current);
    setTestResult(scan);
    setIsTestModalOpen(true);
    analytics.track("scannability_diagnostics_viewed", { qrType: activeType });
  };

  return (
    <div id="generator" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Direct Client-Side Encoding • Never Expires • No Signup</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create. Customize. Scan. Done.
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Generate professional, permanent static QR codes in seconds. Vector SVG &amp; Ultra-HD print exports with built-in scannability diagnostics.
        </p>
      </div>

      {/* Main Unified Generator Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-indigo-500/5 overflow-hidden">
        {/* 1. Type Selector Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-2 sm:p-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {QR_TYPE_CONFIG.map((item) => {
              const Icon = item.icon;
              const isActive = activeType === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTypeChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-slate-700 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40"
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Workspace Body: Left (Form + Customization) | Right (Preview & Download) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Left Column: Inputs & Customization (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-8">
            {/* Active Type Title & Hint */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {QR_TYPE_CONFIG.find((t) => t.id === activeType)?.label}
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Step 1: Enter details
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {QR_TYPE_CONFIG.find((t) => t.id === activeType)?.description}
              </p>
            </div>

            {/* Dynamic Form Content */}
            <div className="space-y-4">
              {/* URL Form */}
              {activeType === "url" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Website or Destination URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={formData.url.url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          url: { ...formData.url, url: e.target.value },
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                    />
                  </div>
                  {validation.errors.url && (
                    <p className="mt-1.5 text-xs text-rose-500">{validation.errors.url}</p>
                  )}
                  <p className="mt-1.5 text-xs text-slate-500">
                    Direct encoding: The QR code points directly to your destination without any third-party redirect or middleman.
                  </p>
                </div>
              )}

              {/* Wi-Fi Form */}
              {activeType === "wifi" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Network Name (SSID) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CafeGuest_5G"
                      value={formData.wifi.ssid}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          wifi: { ...formData.wifi, ssid: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                    />
                    {validation.errors.ssid && (
                      <p className="mt-1 text-xs text-rose-500">{validation.errors.ssid}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Security / Encryption
                      </label>
                      <select
                        value={formData.wifi.encryption}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            wifi: {
                              ...formData.wifi,
                              encryption: e.target.value as "WPA" | "WEP" | "nopass",
                            },
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                        <option value="WEP">WEP (Legacy)</option>
                        <option value="nopass">None (Open Network)</option>
                      </select>
                    </div>

                    {formData.wifi.encryption !== "nopass" && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Network Password
                        </label>
                        <input
                          type="text"
                          placeholder="Passkey"
                          value={formData.wifi.password || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              wifi: { ...formData.wifi, password: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-mono"
                        />
                        {validation.errors.password && (
                          <p className="mt-1 text-xs text-rose-500">{validation.errors.password}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formData.wifi.hidden || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          wifi: { ...formData.wifi, hidden: e.target.checked },
                        })
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Hidden Network (SSID broadcast is disabled)
                    </span>
                  </label>
                </div>
              )}

              {/* vCard Form */}
              {activeType === "vcard" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Sarah"
                        value={formData.vcard.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vcard: { ...formData.vcard, firstName: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Connor"
                        value={formData.vcard.lastName || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vcard: { ...formData.vcard, lastName: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Organization / Company
                      </label>
                      <input
                        type="text"
                        placeholder="Cyberdyne Solutions"
                        value={formData.vcard.organization || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vcard: { ...formData.vcard, organization: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Job Title
                      </label>
                      <input
                        type="text"
                        placeholder="Chief Security Architect"
                        value={formData.vcard.title || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vcard: { ...formData.vcard, title: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Mobile Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 987-6543"
                        value={formData.vcard.phone || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vcard: { ...formData.vcard, phone: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="sarah@example.com"
                        value={formData.vcard.email || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vcard: { ...formData.vcard, email: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={formData.vcard.url || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vcard: { ...formData.vcard, url: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* WhatsApp Form */}
              {activeType === "whatsapp" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number with Country Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.whatsapp.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsapp: { ...formData.whatsapp, phone: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-mono"
                    />
                    {validation.errors.phone && (
                      <p className="mt-1 text-xs text-rose-500">{validation.errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Prefilled Message (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Hi! I scanned your QR code and would like to learn more."
                      value={formData.whatsapp.message || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsapp: { ...formData.whatsapp, message: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Plain Text Form */}
              {activeType === "text" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Plain Text Content
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter any text, instructions, or alphanumeric code..."
                    value={formData.text.text}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        text: { ...formData.text, text: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-mono"
                  />
                  {validation.errors.text && (
                    <p className="mt-1 text-xs text-rose-500">{validation.errors.text}</p>
                  )}
                </div>
              )}

              {/* Email Form */}
              {activeType === "email" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Recipient Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="support@company.com"
                      value={formData.email.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: { ...formData.email, email: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                    />
                    {validation.errors.email && (
                      <p className="mt-1 text-xs text-rose-500">{validation.errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Customer Inquiry"
                      value={formData.email.subject || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: { ...formData.email, subject: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Message Body
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Hi team, I would like to enquire about..."
                      value={formData.email.body || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: { ...formData.email, body: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Phone Form */}
              {activeType === "phone" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Telephone Number to Call <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (800) 555-0199"
                    value={formData.phone.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: { ...formData.phone, phone: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-mono"
                  />
                  {validation.errors.phone && (
                    <p className="mt-1 text-xs text-rose-500">{validation.errors.phone}</p>
                  )}
                </div>
              )}

              {/* SMS Form */}
              {activeType === "sms" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Recipient Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 012-3456"
                      value={formData.sms.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sms: { ...formData.sms, phone: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-mono"
                    />
                    {validation.errors.phone && (
                      <p className="mt-1 text-xs text-rose-500">{validation.errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      SMS Message Body
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Please confirm my appointment for tomorrow."
                      value={formData.sms.message || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sms: { ...formData.sms, message: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Geo Location Form */}
              {activeType === "geo" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Latitude (-90 to 90) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="37.7749"
                        value={formData.geo.latitude}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            geo: { ...formData.geo, latitude: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Longitude (-180 to 180) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="-122.4194"
                        value={formData.geo.longitude}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            geo: { ...formData.geo, longitude: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Automatically generates a universal Google Maps navigation link compatible with all iOS and Android smartphone camera readers.
                  </p>
                </div>
              )}

              {/* Event Form */}
              {activeType === "event" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Event Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Annual Gala & Awards"
                      value={formData.event.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          event: { ...formData.event, title: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Start Date &amp; Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.event.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            event: { ...formData.event, startDate: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        End Date &amp; Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.event.endDate || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            event: { ...formData.event, endDate: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Venue / Location
                    </label>
                    <input
                      type="text"
                      placeholder="Hotel Ballroom or Zoom Link"
                      value={formData.event.location || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          event: { ...formData.event, location: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Customization Tabs (Colors, Precision/Margin, Brand Logo) */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Step 2: Customize Styling &amp; Precision
                </span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setActiveTab("colors")}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      activeTab === "colors"
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Colors
                  </button>
                  <button
                    onClick={() => setActiveTab("options")}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      activeTab === "options"
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Precision &amp; Margin
                  </button>
                  <button
                    onClick={() => setActiveTab("logo")}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      activeTab === "logo"
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Center Logo
                  </button>
                </div>
              </div>

              {/* Tab 1: Colors & Presets */}
              {activeTab === "colors" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-2">
                      Quick Curated Presets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((preset) => {
                        const isSelected =
                          customization.fgColor === preset.fg &&
                          customization.bgColor === preset.bg;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              setCustomization({
                                ...customization,
                                fgColor: preset.fg,
                                bgColor: preset.bg,
                              })
                            }
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                              style={{ backgroundColor: preset.fg }}
                            />
                            <span>{preset.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Foreground Color (Modules)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customization.fgColor}
                          onChange={(e) =>
                            setCustomization({ ...customization, fgColor: e.target.value })
                          }
                          className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                        />
                        <input
                          type="text"
                          value={customization.fgColor}
                          onChange={(e) =>
                            setCustomization({ ...customization, fgColor: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Background Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customization.bgColor}
                          onChange={(e) =>
                            setCustomization({ ...customization, bgColor: e.target.value })
                          }
                          className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                        />
                        <input
                          type="text"
                          value={customization.bgColor}
                          onChange={(e) =>
                            setCustomization({ ...customization, bgColor: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Precision & Margin */}
              {activeTab === "options" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Reed-Solomon Error Correction Level
                      </label>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Level {customization.errorCorrectionLevel}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {(["L", "M", "Q", "H"] as ErrorCorrectionLevel[]).map((level) => {
                        const descriptions: Record<ErrorCorrectionLevel, string> = {
                          L: "7% Recovery (Smallest)",
                          M: "15% (Standard Default)",
                          Q: "25% (High Reliability)",
                          H: "30% (Recommended for Logos)",
                        };
                        const isSelected = customization.errorCorrectionLevel === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() =>
                              setCustomization({
                                ...customization,
                                errorCorrectionLevel: level,
                              })
                            }
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                            }`}
                          >
                            <div className="font-bold text-xs">Level {level}</div>
                            <div className="text-[10px] opacity-75 mt-0.5">
                              {descriptions[level]}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Quiet Zone Margin
                      </label>
                      <span className="text-xs font-mono text-slate-500">
                        {customization.margin} modules {customization.margin === 4 ? "(ISO Standard)" : ""}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={8}
                      step={1}
                      value={customization.margin}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          margin: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0 (Tight)</span>
                      <span>2 (Compact)</span>
                      <span>4 (ISO Print Standard)</span>
                      <span>8 (Generous)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Center Logo */}
              {activeTab === "logo" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Upload Custom Brand Logo or Icon
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium cursor-pointer transition-colors">
                        <ImageIcon className="w-4 h-4 text-indigo-500" />
                        <span>{customization.logo ? "Change Logo Image" : "Upload PNG or SVG (Max 2MB)"}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {customization.logo && (
                        <button
                          type="button"
                          onClick={() => setCustomization({ ...customization, logo: null })}
                          className="px-3 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-medium transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {logoError && (
                      <p className="mt-2 text-xs text-rose-500 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{logoError}</span>
                      </p>
                    )}
                  </div>

                  {customization.logo && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Logo Size
                        </label>
                        <span className="text-xs font-mono text-slate-500">
                          {customization.logoSize}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={28}
                        step={1}
                        value={customization.logoSize}
                        onChange={(e) =>
                          setCustomization({
                            ...customization,
                            logoSize: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        UCode automatically generates a protective quiet-zone pill behind your logo to preserve contrast and maximize module recovery.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Preview, Diagnostics & Exports (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50/50 dark:bg-slate-950/30 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Preview Header & Diagnostics Score */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Live Preview &amp; Validation
                </span>
                <button
                  type="button"
                  onClick={handleRunScanTest}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Scan Score: {scannability.score}/100</span>
                </button>
              </div>

              {/* QR Canvas Container */}
              <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-900/5 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain rounded-lg"
                  aria-label="Generated QR Code Preview"
                />

                {/* Status Overlays */}
                {(!payload || !validation.isValid) && (
                  <div className="absolute inset-4 rounded-xl bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
                    <p className="text-xs font-semibold">Incomplete or Invalid Input</p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Fill in the required fields on the left to render the live code.
                    </p>
                  </div>
                )}
              </div>

              {/* Scannability Warning Badges if contrast/margin is suboptimal */}
              {scannability.recommendations.length > 0 && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    {scannability.recommendations.map((rec, i) => (
                      <p key={i} className="text-[11px] leading-tight">
                        {rec}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Download Feedback Banner */}
              {downloadSuccess && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>{downloadSuccess}</span>
                </div>
              )}
            </div>

            {/* Export Settings & Download Buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              {/* Resolution Selector for PNG */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  PNG Resolution:
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { label: "512px", value: 512, hint: "Web" },
                    { label: "1024px", value: 1024, hint: "HD" },
                    { label: "2048px", value: 2048, hint: "Print" },
                    { label: "4096px", value: 4096, hint: "Ultra" },
                  ].map((res) => (
                    <button
                      key={res.value}
                      type="button"
                      onClick={() => setExportResolution(res.value)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                        exportResolution === res.value
                          ? "bg-indigo-600 text-white font-bold"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  disabled={!payload || !validation.isValid}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSVG}
                  disabled={!payload || !validation.isValid}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Vector SVG</span>
                </button>
              </div>

              {/* Secondary Actions: Copy to Clipboard & Print Sizing Guide */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyImage}
                  disabled={!payload || !validation.isValid}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 font-medium">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Image</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRunScanTest}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Readiness &amp; Sizing &rarr;</span>
                </button>
              </div>

              {copyError && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{copyError}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics & Print Readiness Modal */}
      {isTestModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="diagnostic-modal-title"
        >
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h3 id="diagnostic-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                  QR Diagnostic &amp; Print-Readiness Report
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                aria-label="Close diagnostic report"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Test Results */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Automated Camera Decoder Simulation (jsQR)
                  </span>
                  {testResult?.success ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Synthetic Decoder: 100% Match
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      <AlertTriangle className="w-3.5 h-3.5" /> Unreadable
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <strong>Decoded Payload:</strong>
                  <p className="mt-1 font-mono text-[11px] p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 break-all">
                    {testResult?.decodedPayload || "No payload extracted. Please check contrast or quiet zone."}
                  </p>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Note: A synthetic software decoder verifies mathematical pixel matrix consistency. Real-world scanning also depends on camera optics, ambient glare, substrate material, and distance. Always test with native iOS/Android camera apps before bulk printing.
                </p>
              </div>

              {/* Optical Print Size Calculator */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Optical Sizing Guide (10:1 Ratio)
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="block text-slate-500 text-[10px]">Business Card</span>
                    <strong className="block text-sm text-slate-900 dark:text-white mt-0.5">
                      {calculatePrintSize(0.2).sizeCm} cm (0.8 in)
                    </strong>
                    <span className="text-[10px] text-slate-400">20cm viewing</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="block text-slate-500 text-[10px]">Table Tent / Flyer</span>
                    <strong className="block text-sm text-slate-900 dark:text-white mt-0.5">
                      {calculatePrintSize(0.5).sizeCm} cm (2.0 in)
                    </strong>
                    <span className="text-[10px] text-slate-400">50cm viewing</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="block text-slate-500 text-[10px]">Poster / Banner</span>
                    <strong className="block text-sm text-slate-900 dark:text-white mt-0.5">
                      {calculatePrintSize(1.5).sizeCm} cm (6.0 in)
                    </strong>
                    <span className="text-[10px] text-slate-400">1.5m viewing</span>
                  </div>
                </div>
              </div>

              {/* Pre-Print Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Pre-Print Commercial Checklist
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Always test print one copy on regular paper before ordering hundreds.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Avoid high-gloss lamination on restaurant tables to prevent ambient glare.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Ensure 4 modules of quiet zone border around the QR code matrix.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
