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
  CheckCircle2,
  X,
  Upload,
  Sparkles,
  Palette,
  Sliders,
} from "lucide-react";
import {
  QRType,
  QRFormDataMap,
  QRCustomizationOptions,
  ErrorCorrectionLevel,
  ScannabilityReport,
  QRModuleShape,
  QRPatternStyle,
  QRFinderStyle,
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
  { id: "url", label: "Website URL", shortLabel: "URL", icon: Globe, description: "Direct link to any website, menu, or web page without third-party redirects." },
  { id: "wifi", label: "Wi-Fi Network", shortLabel: "Wi-Fi", icon: Wifi, description: "Connect smartphones directly to Wi-Fi without manually typing passwords." },
  { id: "vcard", label: "Contact (vCard)", shortLabel: "vCard", icon: UserCheck, description: "Digital business card that pre-populates smartphone address books." },
  { id: "whatsapp", label: "WhatsApp Chat", shortLabel: "WhatsApp", icon: MessageSquare, description: "Open a direct WhatsApp conversation with optional prefilled message." },
  { id: "text", label: "Plain Text", shortLabel: "Text", icon: FileText, description: "Display unformatted plain text, notes, or serial numbers." },
  { id: "email", label: "Send Email", shortLabel: "Email", icon: Mail, description: "Pre-composed email with recipient, subject line, and body." },
  { id: "phone", label: "Phone Call", shortLabel: "Phone", icon: Phone, description: "Direct telephone dialer link for mobile devices." },
  { id: "sms", label: "SMS Message", shortLabel: "SMS", icon: MessageCircle, description: "Send a prefilled text message to any mobile phone." },
  { id: "geo", label: "Location / Map", shortLabel: "Location", icon: MapPin, description: "Pinpoint latitude and longitude on Google Maps." },
  { id: "event", label: "Calendar Event", shortLabel: "Event", icon: Calendar, description: "iCalendar invitation with start and end times, description, and location." },
];

const COLOR_PRESETS = [
  { id: "classic", name: "Classic Noir", fg: "#000000", bg: "#ffffff" },
  { id: "midnight", name: "Slate Minimal", fg: "#0f172a", bg: "#f8fafc" },
  { id: "indigo", name: "Deep Indigo", fg: "#312e81", bg: "#eef2ff" },
  { id: "emerald", name: "Forest Green", fg: "#064e3b", bg: "#f0fdf4" },
  { id: "ruby", name: "Wine Ruby", fg: "#881337", bg: "#fff1f2" },
  { id: "teal", name: "Cyber Teal", fg: "#164e63", bg: "#ecfeff" },
];

const STYLE_PRESETS: {
  id: string;
  name: string;
  tagline: string;
  moduleShape: QRModuleShape;
  patternStyle: QRPatternStyle;
  finderStyle: QRFinderStyle;
  fgColor: string;
  bgColor: string;
}[] = [
  {
    id: "classic",
    name: "Classic Noir",
    tagline: "Standard crisp geometric modules",
    moduleShape: "square",
    patternStyle: "classic-grid",
    finderStyle: "square",
    fgColor: "#000000",
    bgColor: "#ffffff",
  },
  {
    id: "modern-flow",
    name: "Modern Flow",
    tagline: "Connected liquid circuit aesthetic",
    moduleShape: "rounded-square",
    patternStyle: "connected-flow",
    finderStyle: "rounded",
    fgColor: "#0f172a",
    bgColor: "#f8fafc",
  },
  {
    id: "cyber-dots",
    name: "Cyber Dots",
    tagline: "Futuristic circular matrix",
    moduleShape: "bubble",
    patternStyle: "dotted-matrix",
    finderStyle: "circular",
    fgColor: "#164e63",
    bgColor: "#ecfeff",
  },
  {
    id: "soft-minimal",
    name: "Soft Tech",
    tagline: "Cushioned rounded pixels",
    moduleShape: "soft-pixel",
    patternStyle: "soft-grid",
    finderStyle: "rounded",
    fgColor: "#312e81",
    bgColor: "#eef2ff",
  },
  {
    id: "luxe-diamond",
    name: "Luxe Diamond",
    tagline: "Angled faceted diamond cells",
    moduleShape: "diamond",
    patternStyle: "classic-grid",
    finderStyle: "square",
    fgColor: "#881337",
    bgColor: "#fff1f2",
  },
];

export const QRWorkspace: React.FC = () => {
  const [activeType, setActiveType] = useState<QRType>("url");

  // Form states with clean initial defaults
  const [formData, setFormData] = useState<QRFormDataMap>({
    url: { url: "https://ucreates.io" },
    text: { text: "Scan and explore UCode by UCreates." },
    wifi: { ssid: "UCreates-Guest", password: "welcomeguest2026", encryption: "WPA", hidden: false },
    whatsapp: { phone: "+15551234567", message: "Hi! I scanned your QR code from UCode." },
    vcard: {
      firstName: "Alex",
      lastName: "Morgan",
      organization: "UCreates Digital",
      title: "Lead Solutions Architect",
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
      location: "San Francisco, CA",
      description: "Live demonstration of privacy-first QR engineering.",
      startDate: "2026-11-20T10:00",
      endDate: "2026-11-20T12:00",
      allDay: false,
    },
  });

  // Customization state with Style Studio defaults
  const [customization, setCustomization] = useState<QRCustomizationOptions>({
    fgColor: "#000000",
    bgColor: "#ffffff",
    errorCorrectionLevel: "M",
    margin: 4,
    size: 512,
    moduleShape: "square",
    patternStyle: "classic-grid",
    finderStyle: "square",
    logo: null,
    logoSize: 18,
    logoPadding: 12,
    logoRadius: 20,
    logoMode: false,
  });

  // Dedicated customization sections: "style" | "colors" | "logo" | "precision"
  const [customSection, setCustomSection] = useState<"style" | "colors" | "logo" | "precision">("style");

  const [exportResolution, setExportResolution] = useState<number>(2048);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; decodedPayload: string | null } | null>(null);
  const [liveDecoderStatus, setLiveDecoderStatus] = useState<{ tested: boolean; success: boolean; decodedPayload: string | null } | null>(null);
  const [viewingDistance, setViewingDistance] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Derive current payload and validation
  const currentFormData = formData[activeType];
  const payload = encodeQRPayload(activeType, currentFormData as never);
  const validation = validateQRFormData(activeType, currentFormData as never);
  const scannability: ScannabilityReport = evaluateScannability(customization, liveDecoderStatus || undefined);

  // Redraw canvas whenever payload, type, or customization changes
  const updateCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    if (!payload || !validation.isValid) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      requestAnimationFrame(() => {
        setLiveDecoderStatus(null);
      });
      return;
    }

    try {
      await renderQRToCanvas(canvasRef.current, payload, customization);
      // Run independent decoder against visual canvas output
      const scan = verifyCanvasScan(canvasRef.current);
      requestAnimationFrame(() => {
        setLiveDecoderStatus({ tested: true, success: scan.success, decodedPayload: scan.decodedPayload });
      });
    } catch (err) {
      console.warn("Canvas render failed:", err);
      requestAnimationFrame(() => {
        setLiveDecoderStatus({ tested: true, success: false, decodedPayload: null });
      });
    }
  }, [payload, validation.isValid, customization]);

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  useEffect(() => {
    analytics.track("generator_opened");
  }, []);

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
              logoMode: true,
              errorCorrectionLevel: "H",
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
          logoMode: true,
          errorCorrectionLevel: "H",
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
      setDownloadSuccess("Downloaded Scalable Vector SVG!");
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

    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && window.ClipboardItem) {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } else {
          setCopyError("Clipboard copy is not supported in this browser. Please use Download PNG.");
          setTimeout(() => setCopyError(null), 4000);
        }
      });
    } catch (err) {
      console.warn("Clipboard copy not permitted:", err);
      setCopyError("Unable to copy image. Please use Download PNG.");
      setTimeout(() => setCopyError(null), 4000);
    }
  };

  const handleRunScanTest = () => {
    if (!canvasRef.current) return;
    const scan = verifyCanvasScan(canvasRef.current);
    setTestResult(scan);
    setLiveDecoderStatus({ tested: true, success: scan.success, decodedPayload: scan.decodedPayload });
    setIsTestModalOpen(true);
    analytics.track("scannability_diagnostics_viewed", { qrType: activeType });
  };

  const printSize = calculatePrintSize(viewingDistance);

  return (
    <div id="generator" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Quiet, refined section header */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Create High-Precision QR Codes
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
          Permanent static QR codes generated directly in your browser. Vector SVG and Ultra-HD PNG downloads with zero middleman redirects.
        </p>
      </div>

      {/* 1. Type Selector Tabs: Precision Horizontal Segmented Bar */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-1.5 mb-6 sm:mb-8 overflow-x-auto scrollbar-none shadow-2xs">
        <div className="flex items-center gap-1 min-w-max mx-auto justify-start sm:justify-center">
          {QR_TYPE_CONFIG.map((item) => {
            const Icon = item.icon;
            const isActive = activeType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTypeChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-950 shadow-xs border border-slate-200/80 font-semibold"
                    : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                }`}
                aria-pressed={isActive}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Workspace Body: Left (Input & Customization) | Right (Preview & Prepress) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Form & Customization (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-6 sm:p-7 space-y-7">
            {/* Step 1: Content Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                    1. Content &bull; {QR_TYPE_CONFIG.find((t) => t.id === activeType)?.label}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {QR_TYPE_CONFIG.find((t) => t.id === activeType)?.description}
                  </p>
                </div>
              </div>

              {/* URL Form */}
              {activeType === "url" && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Website or Destination URL
                  </label>
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
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 text-xs sm:text-sm font-mono"
                  />
                  {validation.errors.url && (
                    <p className="mt-1 text-xs text-rose-500">{validation.errors.url}</p>
                  )}
                  <p className="mt-1 text-[11px] text-slate-400">
                    Direct static link without any intermediary server or redirection fee.
                  </p>
                </div>
              )}

              {/* Wi-Fi Form */}
              {activeType === "wifi" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Network Name (SSID) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. OfficeGuest_5G"
                      value={formData.wifi.ssid}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          wifi: { ...formData.wifi, ssid: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm"
                    />
                    {validation.errors.ssid && (
                      <p className="mt-1 text-xs text-rose-500">{validation.errors.ssid}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Security Type
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
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                        <option value="WEP">WEP (Legacy)</option>
                        <option value="nopass">None (Open Network)</option>
                      </select>
                    </div>

                    {formData.wifi.encryption !== "nopass" && (
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
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
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-mono"
                        />
                        {validation.errors.password && (
                          <p className="mt-1 text-xs text-rose-500">{validation.errors.password}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-0.5">
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
                    <span className="text-xs text-slate-600">
                      Hidden Network (SSID broadcast is disabled)
                    </span>
                  </label>
                </div>
              )}

              {/* vCard Form */}
              {activeType === "vcard" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Alex"
                        value={formData.vcard.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vcard: { ...formData.vcard, firstName: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Morgan"
                        value={formData.vcard.lastName || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vcard: { ...formData.vcard, lastName: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Organization
                      </label>
                      <input
                        type="text"
                        placeholder="UCreates Digital"
                        value={formData.vcard.organization || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vcard: { ...formData.vcard, organization: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        placeholder="Lead Architect"
                        value={formData.vcard.title || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vcard: { ...formData.vcard, title: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 019-2834"
                        value={formData.vcard.phone || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vcard: { ...formData.vcard, phone: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="alex@ucreates.io"
                        value={formData.vcard.email || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vcard: { ...formData.vcard, email: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://ucreates.io"
                      value={formData.vcard.url || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vcard: { ...formData.vcard, url: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* WhatsApp Form */}
              {activeType === "whatsapp" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
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
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-mono"
                    />
                    {validation.errors.phone && (
                      <p className="mt-1 text-xs text-rose-500">{validation.errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
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
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Plain Text Form */}
              {activeType === "text" && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Plain Text Content
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter any text, instructions, or serial number..."
                    value={formData.text.text}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        text: { ...formData.text, text: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-mono"
                  />
                  {validation.errors.text && (
                    <p className="mt-1 text-xs text-rose-500">{validation.errors.text}</p>
                  )}
                </div>
              )}

              {/* Email Form */}
              {activeType === "email" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
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
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm"
                    />
                    {validation.errors.email && (
                      <p className="mt-1 text-xs text-rose-500">{validation.errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Inquiry"
                      value={formData.email.subject || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: { ...formData.email, subject: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Body
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Message content..."
                      value={formData.email.body || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: { ...formData.email, body: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Phone Form */}
              {activeType === "phone" && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Telephone Number <span className="text-rose-500">*</span>
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
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-mono"
                  />
                  {validation.errors.phone && (
                    <p className="mt-1 text-xs text-rose-500">{validation.errors.phone}</p>
                  )}
                </div>
              )}

              {/* SMS Form */}
              {activeType === "sms" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
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
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-mono"
                    />
                    {validation.errors.phone && (
                      <p className="mt-1 text-xs text-rose-500">{validation.errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Prefilled Message
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Please confirm my appointment."
                      value={formData.sms.message || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sms: { ...formData.sms, message: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Geo Form */}
              {activeType === "geo" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
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
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
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
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Creates a universal navigation link that opens directly in Google Maps and Apple Maps.
                  </p>
                </div>
              )}

              {/* Event Form */}
              {activeType === "event" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Event Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Product Launch & Keynote"
                      value={formData.event.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          event: { ...formData.event, title: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Start Time
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
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        End Time
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
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Venue or Meeting Link"
                      value={formData.event.location || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          event: { ...formData.event, location: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Customization — Dedicated Style Studio & Advanced Options */}
            <div className="pt-5 border-t border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-semibold tracking-tight text-slate-900 flex items-center gap-1.5">
                  <span>2. Style Studio &amp; Customization</span>
                </h3>
                {/* 4-Section Segmented Navigation */}
                <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200/60 text-xs font-medium overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setCustomSection("style")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                      customSection === "style"
                        ? "bg-white text-slate-950 font-semibold shadow-2xs"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Style Studio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomSection("colors")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                      customSection === "colors"
                        ? "bg-white text-slate-950 font-semibold shadow-2xs"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 text-slate-500" />
                    <span>Colors</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomSection("logo")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                      customSection === "logo"
                        ? "bg-white text-slate-950 font-semibold shadow-2xs"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    <span>Logo</span>
                    {customization.logo && customization.logoMode !== false && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomSection("precision")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                      customSection === "precision"
                        ? "bg-white text-slate-950 font-semibold shadow-2xs"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span>Precision</span>
                  </button>
                </div>
              </div>

              {/* Group 1: Style Studio */}
              {customSection === "style" && (
                <div className="space-y-4 pt-1">
                  {/* Curated Presets */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Curated Style Presets
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {STYLE_PRESETS.map((preset) => {
                        const isSelected =
                          customization.moduleShape === preset.moduleShape &&
                          customization.patternStyle === preset.patternStyle &&
                          customization.finderStyle === preset.finderStyle &&
                          customization.fgColor === preset.fgColor &&
                          customization.bgColor === preset.bgColor;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              setCustomization((prev) => ({
                                ...prev,
                                moduleShape: preset.moduleShape,
                                patternStyle: preset.patternStyle,
                                finderStyle: preset.finderStyle,
                                fgColor: preset.fgColor,
                                bgColor: preset.bgColor,
                              }))
                            }
                            className={`flex flex-col text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                              isSelected
                                ? "border-slate-900 bg-slate-50 text-slate-950 font-semibold shadow-2xs"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold">{preset.name}</span>
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                                style={{ backgroundColor: preset.fgColor }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 leading-tight">
                              {preset.tagline}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Module Shape */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-medium text-slate-700">Module Shape</label>
                      <span className="text-[11px] text-slate-500 font-mono capitalize">
                        {(customization.moduleShape || "square").replace("-", " ")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "square", label: "Classic Squares", desc: "Crisp rectangular cells" },
                        { id: "rounded-square", label: "Rounded Squares", desc: "Controlled smooth radius" },
                        { id: "bubble", label: "Bubble / Dots", desc: "Centered circular dots" },
                        { id: "soft-pixel", label: "Soft Pixels", desc: "Subtle softened edges" },
                        { id: "diamond", label: "Diamond Facets", desc: "Angled geometric rhombuses" },
                      ].map((shape) => {
                        const isSelected = (customization.moduleShape || "square") === shape.id;
                        return (
                          <button
                            key={shape.id}
                            type="button"
                            onClick={() =>
                              setCustomization((prev) => ({
                                ...prev,
                                moduleShape: shape.id as QRModuleShape,
                              }))
                            }
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-slate-900 bg-slate-50 text-slate-950 font-semibold shadow-2xs"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <div className="text-xs font-semibold">{shape.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{shape.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pattern Style */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-medium text-slate-700">Pattern Style</label>
                      <span className="text-[11px] text-slate-500 font-mono capitalize">
                        {(customization.patternStyle || "classic-grid").replace("-", " ")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "classic-grid", label: "Classic Grid", desc: "Standard grid spacing" },
                        { id: "dotted-matrix", label: "Dotted Matrix", desc: "Matrix dot treatment" },
                        { id: "soft-grid", label: "Soft Grid", desc: "Cushioned micro-spacing" },
                        { id: "connected-flow", label: "Connected / Flow", desc: "Seamless orthogonal links" },
                        { id: "dense-geometric", label: "Dense Geometric", desc: "Full-bleed solid blocks" },
                      ].map((pat) => {
                        const isSelected = (customization.patternStyle || "classic-grid") === pat.id;
                        return (
                          <button
                            key={pat.id}
                            type="button"
                            onClick={() =>
                              setCustomization((prev) => ({
                                ...prev,
                                patternStyle: pat.id as QRPatternStyle,
                              }))
                            }
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-slate-900 bg-slate-50 text-slate-950 font-semibold shadow-2xs"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <div className="text-xs font-semibold">{pat.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{pat.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Finder Patterns */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-medium text-slate-700">Finder Patterns</label>
                      <span className="text-[11px] text-slate-500 font-mono capitalize">
                        {customization.finderStyle || "square"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: "square", label: "Classic Square", desc: "Standard 7×7 outer & 3×3 square" },
                        { id: "rounded", label: "Rounded Frame", desc: "Smooth concentric rounded corners" },
                        { id: "circular", label: "Circular Frame", desc: "Curved border & circular center dot" },
                      ].map((finder) => {
                        const isSelected = (customization.finderStyle || "square") === finder.id;
                        return (
                          <button
                            key={finder.id}
                            type="button"
                            onClick={() =>
                              setCustomization((prev) => ({
                                ...prev,
                                finderStyle: finder.id as QRFinderStyle,
                              }))
                            }
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-slate-900 bg-slate-50 text-slate-950 font-semibold shadow-2xs"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <div className="text-xs font-semibold">{finder.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{finder.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Standards Notice */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
                    <span className="font-semibold text-slate-700">Standards-Compliant Geometry:</span> Visual styling applies strictly to data modules. ISO/IEC 18004 functional modules (timing pattern row/column 6 and interior alignment patterns) remain geometrically calibrated to ensure standard decoders achieve 100% clock sync and pitch recovery.
                  </div>
                </div>
              )}

              {/* Group 2: Colors */}
              {customSection === "colors" && (
                <div className="space-y-4 pt-1">
                  {/* Curated Presets */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      Curated Color Pairings
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                              isSelected
                                ? "border-slate-900 bg-slate-50 text-slate-950 font-semibold shadow-2xs"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0 shadow-2xs"
                              style={{ backgroundColor: preset.fg }}
                            />
                            <span className="truncate">{preset.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Foreground (Modules)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customization.fgColor}
                          onChange={(e) =>
                            setCustomization({ ...customization, fgColor: e.target.value })
                          }
                          className="w-8 h-8 rounded-md border border-slate-300 cursor-pointer p-0.5 bg-transparent"
                        />
                        <input
                          type="text"
                          value={customization.fgColor}
                          onChange={(e) =>
                            setCustomization({ ...customization, fgColor: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Background
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customization.bgColor}
                          onChange={(e) =>
                            setCustomization({ ...customization, bgColor: e.target.value })
                          }
                          className="w-8 h-8 rounded-md border border-slate-300 cursor-pointer p-0.5 bg-transparent"
                        />
                        <input
                          type="text"
                          value={customization.bgColor}
                          onChange={(e) =>
                            setCustomization({ ...customization, bgColor: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contrast ratio metric */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                    <span className="text-slate-600 font-medium">Photometric Contrast Ratio:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {scannability.contrastRatio}:1 &bull;{" "}
                      <span className={scannability.contrastGrade === "excellent" ? "text-emerald-600" : "text-amber-600"}>
                        {scannability.contrastGrade.toUpperCase()}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Group 3: Center Logo & Branding */}
              {customSection === "logo" && (
                <div className="space-y-4 pt-1">
                  {/* Optional Center-Logo Mode Switch */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                    <div>
                      <span className="text-xs font-semibold text-slate-900">Center Logo Overlay</span>
                      <p className="text-[11px] text-slate-500">Overlay an opaque branded mark centered on the QR module grid</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={customization.logoMode ?? false}
                      onClick={() =>
                        setCustomization((prev) => ({
                          ...prev,
                          logoMode: !prev.logoMode,
                          ...(prev.logo && !prev.logoMode ? { errorCorrectionLevel: "H" } : {}),
                        }))
                      }
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        customization.logoMode ? "bg-indigo-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          customization.logoMode ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {!customization.logo ? (
                    <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-medium text-slate-800">
                        Upload Custom Center Mark
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        PNG, JPEG, WebP, or SVG (Maximum 2MB)
                      </p>
                      <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 cursor-pointer transition-colors">
                        <span>Select Image File</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {/* Active Logo Pill */}
                      <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={customization.logo}
                              alt="Logo thumbnail"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">Custom Logo Active</p>
                            <p className="text-[11px] text-slate-500">
                              Error correction set to Level {customization.errorCorrectionLevel}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-slate-700 hover:text-slate-950 cursor-pointer underline">
                            Change
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setCustomization((prev) => ({
                                ...prev,
                                logo: null,
                                logoMode: false,
                              }))
                            }
                            className="text-xs font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Logo Size Control */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-medium text-slate-700">Logo Scale</label>
                          <span className="text-xs font-mono text-slate-500">{customization.logoSize}%</span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={28}
                          step={1}
                          value={customization.logoSize}
                          onChange={(e) =>
                            setCustomization({
                              ...customization,
                              logoSize: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full accent-slate-900 cursor-pointer"
                        />
                        {customization.logoSize > 20 && (
                          <div className="flex items-start gap-1.5 p-2 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] leading-tight mt-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                            <span>
                              Scale &gt; 20% increases module occlusion. Level H error correction is strongly recommended to preserve scannability.
                            </span>
                          </div>
                        )}
                        {customization.errorCorrectionLevel !== "H" && (
                          <div className="flex items-center justify-between p-2 rounded-md bg-indigo-50 border border-indigo-200/80 text-[11px] text-indigo-950 mt-1.5">
                            <span>Level {customization.errorCorrectionLevel} active. Level H (30%) is best for logos.</span>
                            <button
                              type="button"
                              onClick={() => setCustomization((prev) => ({ ...prev, errorCorrectionLevel: "H" }))}
                              className="px-2 py-0.5 rounded font-semibold bg-indigo-600 text-white hover:bg-indigo-700 text-[10px] transition-colors cursor-pointer"
                            >
                              Set Level H
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Backing Padding */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                          Protective Backing Padding
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Compact", value: 8 },
                            { label: "Standard", value: 14 },
                            { label: "Relaxed", value: 20 },
                          ].map((pad) => (
                            <button
                              key={pad.value}
                              type="button"
                              onClick={() =>
                                setCustomization({
                                  ...customization,
                                  logoPadding: pad.value,
                                })
                              }
                              className={`p-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                                (customization.logoPadding ?? 12) === pad.value
                                    ? "border-slate-900 bg-slate-50 text-slate-950 font-semibold"
                                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              {pad.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Backing Corner Radius */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                          Backing Shape Style
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Rounded Rect", value: 20 },
                            { label: "Circle / Pill", value: 50 },
                            { label: "Sharp Square", value: 6 },
                          ].map((shape) => (
                            <button
                              key={shape.value}
                              type="button"
                              onClick={() =>
                                setCustomization({
                                  ...customization,
                                  logoRadius: shape.value,
                                })
                              }
                              className={`p-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                                (customization.logoRadius ?? 20) === shape.value
                                    ? "border-slate-900 bg-slate-50 text-slate-950 font-semibold"
                                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              {shape.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Advisory Notice */}
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                        Logo overlays occlude central modules. UCode aligns the protective backing to the exact QR module grid with zero drop-shadow bleed, using Level {customization.errorCorrectionLevel} Reed-Solomon recovery. Always run the diagnostic test before printing.
                      </p>
                    </div>
                  )}

                  {logoError && (
                    <p className="text-xs text-rose-500 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{logoError}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Group 4: Precision */}
              {customSection === "precision" && (
                <div className="space-y-4 pt-1">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        Error Correction Level
                      </label>
                      <span className="text-xs font-mono text-slate-500">
                        Level {customization.errorCorrectionLevel}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {(["L", "M", "Q", "H"] as ErrorCorrectionLevel[]).map((lvl) => {
                        const labels: Record<ErrorCorrectionLevel, string> = {
                          L: "7% Recovery",
                          M: "15% (Default)",
                          Q: "25% (Print)",
                          H: "30% (Logos)",
                        };
                        const isSelected = customization.errorCorrectionLevel === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() =>
                              setCustomization({
                                ...customization,
                                errorCorrectionLevel: lvl,
                              })
                            }
                            className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-slate-900 bg-slate-50 text-slate-950 font-semibold shadow-2xs"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            <div className="text-xs font-bold">Level {lvl}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{labels[lvl]}</div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-400 leading-tight">
                      Higher error correction allows smartphone cameras to reconstruct payloads even if modules are occluded or dirty.
                    </p>
                  </div>

                  {/* Quiet Zone Margin */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        Quiet Zone Margin
                      </label>
                      <span className="text-xs font-mono text-slate-600">
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
                      className="w-full accent-slate-900 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                      <span>0 (None)</span>
                      <span>2 (Compact)</span>
                      <span>4 (ISO Standard)</span>
                      <span>8 (Generous)</span>
                    </div>
                  </div>

                  {/* Print Sizing Calculator */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-800">
                        Print Sizing Calculator (10:1 Optical Rule)
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {printSize.sizeCm} cm &bull; {printSize.sizeInches} in
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-500 min-w-max">Scan Distance:</span>
                      <input
                        type="range"
                        min={0.2}
                        max={3}
                        step={0.1}
                        value={viewingDistance}
                        onChange={(e) => setViewingDistance(parseFloat(e.target.value))}
                        className="w-full accent-slate-900 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-700 min-w-[50px] text-right">
                        {viewingDistance} m
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {printSize.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Right Column: Live Preview & Prepress Export (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-5 sm:p-6 space-y-4">
            {/* Preview Header & Verification Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Live Preview
              </span>
              <button
                type="button"
                onClick={handleRunScanTest}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  liveDecoderStatus?.tested && !liveDecoderStatus.success
                    ? "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                    : liveDecoderStatus?.success
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                }`}
              >
                {liveDecoderStatus?.tested && !liveDecoderStatus.success ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Decode Failed ({scannability.score}/100)</span>
                  </>
                ) : liveDecoderStatus?.success ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Score: {scannability.score}/100 • Verified</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                    <span>Score: {scannability.score}/100</span>
                  </>
                )}
              </button>
            </div>

            {/* QR Preview Canvas Container — Clean Square, No Fake Padding, No Corner Clipping */}
            <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[300px] aspect-square rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain qr-canvas-crisp"
                aria-label="Generated QR Code Preview"
              />

              {/* Incomplete Payload Overlay */}
              {(!payload || !validation.isValid) && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-2xs flex flex-col items-center justify-center p-4 text-center">
                  <AlertTriangle className="w-6 h-6 text-amber-500 mb-1.5" />
                  <p className="text-xs font-semibold text-slate-800">Input Required</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 max-w-[200px]">
                    Complete the required fields on the left to render the QR code.
                  </p>
                </div>
              )}
            </div>

            {/* Scannability Warning Badges */}
            {scannability.recommendations.length > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px] leading-tight">
                  {scannability.recommendations.map((rec, i) => (
                    <p key={i}>{rec}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Download Feedback Banner */}
            {downloadSuccess && (
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{downloadSuccess}</span>
              </div>
            )}

            {/* Prepress Export Section */}
            <div className="space-y-3 pt-3 border-t border-slate-200/80">
              {/* PNG Resolution Selector */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">PNG Resolution:</span>
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
                          ? "bg-slate-900 text-white font-bold"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSVG}
                  disabled={!payload || !validation.isValid}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-semibold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Vector SVG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  disabled={!payload || !validation.isValid}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-semibold text-xs text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>{exportResolution}px PNG</span>
                </button>
              </div>

              {/* Secondary Utility Actions */}
              <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleCopyImage}
                  disabled={!payload || !validation.isValid}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Copied!</span>
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
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Diagnostic Report &rarr;</span>
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

      {/* Diagnostics Modal */}
      {isTestModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="diagnostic-modal-title"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 id="diagnostic-modal-title" className="text-base font-bold text-slate-900">
                  Optical &amp; Scannability Audit Report
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                aria-label="Close diagnostic report"
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Audit Section 1: Independent Software Decoder Validation */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">1. Independent Decoder Validation (jsQR)</span>
                  {testResult?.success ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% Readable
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                      <AlertTriangle className="w-3.5 h-3.5" /> Decoder Failure
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {testResult?.success
                    ? "Synthetic camera sensor independently sampled and decoded the exact payload from the rendered pixel matrix."
                    : "The software decoder could not decode the rendered pixel matrix. This indicates module occlusion or contrast issues that exceed Reed-Solomon recovery capacity."}
                </p>
                {testResult?.decodedPayload && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Decoded Payload:</span>
                    <p className="text-[11px] font-mono text-slate-800 break-all bg-white p-2 rounded border border-slate-200 mt-1 max-h-24 overflow-y-auto">
                      {testResult.decodedPayload}
                    </p>
                  </div>
                )}
              </div>

              {/* Audit Section 2: Geometric & Optical Quality */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-800">2. Optical &amp; Geometric Quality</span>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 text-[11px]">Contrast Ratio</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">{scannability.contrastRatio}:1</p>
                    <p className="text-[11px] text-emerald-600 font-medium capitalize mt-0.5">{scannability.contrastGrade} (WCAG 2.1)</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 text-[11px]">Quiet Zone Margin</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">{customization.margin} modules</p>
                    <p className={`text-[11px] font-medium mt-0.5 ${scannability.quietZoneSafe ? "text-emerald-600" : "text-amber-600"}`}>
                      {scannability.quietZoneSafe ? "ISO/IEC 18004 Safe" : "Narrow Margin"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 text-[11px]">Error Correction</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">Level {customization.errorCorrectionLevel}</p>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                      {customization.errorCorrectionLevel === "H" ? "30% Recovery (Logos)" :
                       customization.errorCorrectionLevel === "Q" ? "25% Recovery" :
                       customization.errorCorrectionLevel === "M" ? "15% Recovery" : "7% Recovery"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 text-[11px]">Logo Overlay Safety</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {customization.logo && customization.logoMode !== false ? `${customization.logoSize}% Scale` : "Disabled"}
                    </p>
                    <p className={`text-[11px] font-medium mt-0.5 ${scannability.logoSafe ? "text-emerald-600" : "text-amber-600"}`}>
                      {!customization.logo || customization.logoMode === false ? "Unoccluded Grid" : scannability.logoSafe ? "Within Safe Headroom" : "High Occlusion Risk"}
                    </p>
                  </div>

                  <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 text-[11px]">Style Studio Profile</span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5 capitalize">
                        {(customization.moduleShape || "square").replace("-", " ")} &bull; {(customization.patternStyle || "classic-grid").replace("-", " ")} &bull; {customization.finderStyle || "square"} finders
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Functional Patterns Preserved
                    </span>
                  </div>
                </div>
              </div>

              {/* Audit Section 3: Physical Camera Scan Reliability Advisory */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-xs font-semibold text-slate-800">3. Physical Scan &amp; Print Advisory</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Software decoding verifies visual syntax and Reed-Solomon defect recovery. However, real-world camera scans depend on physical factors—including ambient illumination, print substrate reflectance, lamination glare, and camera focal distance (10:1 ratio). Always test printed proofs with your target phone camera.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
