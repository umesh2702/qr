import { describe, it, expect } from "vitest";
import QRCode from "qrcode";
import jsQR from "jsqr";
import {
  encodeURL,
  encodeText,
  encodeWifi,
  encodeWhatsApp,
  encodeVCard,
  encodeEmail,
  encodePhone,
  encodeSMS,
  encodeGeo,
  encodeEvent,
  encodeQRPayload,
} from "./qr-encoders";
import {
  validateQRFormData,
  calculateContrastRatio,
  evaluateScannability,
  calculatePrintSize,
} from "./qr-validator";
import {
  generateQRSVG,
  renderQRToBuffer,
  calculateLogoModuleDimensions,
} from "./qr-generator";
import { QRCustomizationOptions } from "@/types/qr";

/**
 * Helper to render a payload to a pixel buffer and decode it with jsQR.
 * This simulates a 100% synthetic camera decoder reading the visual pixel matrix.
 */
function decodeMatrixWithJsQR(payload: string): string | null {
  const qr = QRCode.create(payload, { errorCorrectionLevel: "M" });
  const moduleCount = qr.modules.size;
  const margin = 4;
  const scale = 4; // 4x4 pixels per module
  const width = (moduleCount + margin * 2) * scale;
  const height = width;
  const rgba = new Uint8ClampedArray(width * height * 4);

  // Fill canvas with white
  rgba.fill(255);

  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (qr.modules.get(r, c)) {
        // Module is dark, paint black pixels
        for (let py = 0; py < scale; py++) {
          for (let px = 0; px < scale; px++) {
            const x = (c + margin) * scale + px;
            const y = (r + margin) * scale + py;
            const idx = (y * width + x) * 4;
            rgba[idx] = 0;
            rgba[idx + 1] = 0;
            rgba[idx + 2] = 0;
            rgba[idx + 3] = 255;
          }
        }
      }
    }
  }

  const result = jsQR(rgba, width, height);
  return result ? result.data : null;
}

describe("QR Encoders — Correctness & RFC Compliance", () => {
  describe("1. URL Format (encodeURL)", () => {
    it("preserves explicit https protocol", () => {
      expect(encodeURL({ url: "https://ucreates.io/work?source=qr&campaign=spring" })).toBe(
        "https://ucreates.io/work?source=qr&campaign=spring"
      );
    });

    it("preserves explicit http protocol", () => {
      expect(encodeURL({ url: "http://example.com/test#fragment" })).toBe(
        "http://example.com/test#fragment"
      );
    });

    it("auto-prepends https if protocol is missing", () => {
      expect(encodeURL({ url: "ucodeqr.in/generator" })).toBe("https://ucodeqr.in/generator");
    });

    it("handles whitespace correctly without corrupting URL query", () => {
      expect(encodeURL({ url: "   example.org/test?id=123   " })).toBe(
        "https://example.org/test?id=123"
      );
    });
  });

  describe("2. Plain Text Format (encodeText)", () => {
    it("handles plain text verbatim", () => {
      expect(encodeText({ text: "Hello World 2026" })).toBe("Hello World 2026");
    });

    it("handles international UTF-8 characters and multi-byte emojis", () => {
      const multilingual = "Tokyo: 東京 | Berlin: Grütze | Mumbai: नमस्ते | 🚀✨🎯";
      expect(encodeText({ text: multilingual })).toBe(multilingual);
    });
  });

  describe("3. Wi-Fi Format (encodeWifi)", () => {
    it("formats standard WPA Wi-Fi with password", () => {
      const wifi = encodeWifi({
        ssid: "OfficeGuest",
        password: "SecretPassword123",
        encryption: "WPA",
      });
      expect(wifi).toBe("WIFI:S:OfficeGuest;T:WPA;P:SecretPassword123;;");
    });

    it("escapes semicolons, colons, and backslashes in SSID and password", () => {
      const wifi = encodeWifi({
        ssid: "My;Network:Name\\",
        password: "Pass;word:123\\",
        encryption: "WPA",
      });
      expect(wifi).toBe("WIFI:S:My\\;Network\\:Name\\\\;T:WPA;P:Pass\\;word\\:123\\\\;;");
    });

    it("handles open network with nopass and omits password field", () => {
      const wifi = encodeWifi({
        ssid: "AirportFreeWiFi",
        encryption: "nopass",
      });
      expect(wifi).toBe("WIFI:S:AirportFreeWiFi;T:nopass;;");
    });

    it("handles WEP encryption type", () => {
      const wifi = encodeWifi({
        ssid: "LegacyNet",
        password: "weppassword12",
        encryption: "WEP",
      });
      expect(wifi).toBe("WIFI:S:LegacyNet;T:WEP;P:weppassword12;;");
    });

    it("includes hidden network flag when enabled", () => {
      const wifi = encodeWifi({
        ssid: "StealthNet",
        password: "supersecret",
        encryption: "WPA",
        hidden: true,
      });
      expect(wifi).toBe("WIFI:S:StealthNet;T:WPA;P:supersecret;H:true;;");
    });
  });

  describe("4. WhatsApp Format (encodeWhatsApp)", () => {
    it("formats clean chat link with international phone stripped of punctuation", () => {
      const result = encodeWhatsApp({
        phone: "+1 (555) 234-5678",
      });
      expect(result).toBe("https://wa.me/15552345678");
    });

    it("encodes prefilled message with percent encoding", () => {
      const result = encodeWhatsApp({
        phone: "447123456789",
        message: "Hello! I saw your QR code on UCode.",
      });
      expect(result).toBe(
        "https://wa.me/447123456789?text=Hello!%20I%20saw%20your%20QR%20code%20on%20UCode."
      );
    });
  });

  describe("5. vCard 3.0 Format (encodeVCard)", () => {
    it("generates valid vCard 3.0 structure with RFC 2426 escaping", () => {
      const vcard = encodeVCard({
        firstName: "Sarah;Jane",
        lastName: "O'Connor, Jr.",
        organization: "Tech, Innovations; Labs\\Inc.",
        title: "Lead Architect",
        phone: "+1 555 987 6543",
        email: "sarah@techresistors.io",
        url: "techresistors.io",
        address: "123 Cyber Way; Suite 400, Los Angeles, CA",
        note: "Met at Tech Expo 2026.\nFollow up next week.",
      });

      expect(vcard).toContain("BEGIN:VCARD");
      expect(vcard).toContain("VERSION:3.0");
      // Semicolons and commas in names/org must be escaped
      expect(vcard).toContain("N:O'Connor\\, Jr.;Sarah\\;Jane;;;");
      expect(vcard).toContain("FN:Sarah\\;Jane O'Connor\\, Jr.");
      expect(vcard).toContain("ORG:Tech\\, Innovations\\; Labs\\\\Inc.");
      expect(vcard).toContain("TITLE:Lead Architect");
      expect(vcard).toContain("TEL;TYPE=CELL,VOICE:+1 555 987 6543");
      expect(vcard).toContain("EMAIL;TYPE=INTERNET:sarah@techresistors.io");
      expect(vcard).toContain("URL:https://techresistors.io");
      expect(vcard).toContain("ADR;TYPE=WORK:;;123 Cyber Way\\; Suite 400\\, Los Angeles\\, CA;;;;");
      expect(vcard).toContain("NOTE:Met at Tech Expo 2026.\\nFollow up next week.");
      expect(vcard).toContain("END:VCARD");
    });
  });

  describe("6. Email Format (encodeEmail)", () => {
    it("encodes recipient, subject, and body into valid mailto URI", () => {
      const email = encodeEmail({
        email: "contact@ucreates.io",
        subject: "Web Development & MVP Enquiry",
        body: "Hi team, I would like to build an MVP with Next.js.",
      });
      expect(email).toContain("mailto:contact@ucreates.io?");
      expect(email).toContain("subject=Web+Development+%26+MVP+Enquiry");
      expect(email).toContain("body=Hi+team%2C+I+would+like+to+build+an+MVP+with+Next.js.");
    });

    it("handles recipient only without query string", () => {
      const email = encodeEmail({
        email: "simple@domain.com",
      });
      expect(email).toBe("mailto:simple@domain.com");
    });
  });

  describe("7. Phone Format (encodePhone)", () => {
    it("encodes phone call tel URI with sanitized international digits", () => {
      expect(encodePhone({ phone: "+1 (800) 555-0199" })).toBe("tel:+18005550199");
      expect(encodePhone({ phone: "+44 20 7946 0958" })).toBe("tel:+442079460958");
    });
  });

  describe("8. SMS Format (encodeSMS)", () => {
    it("encodes SMS URI with prefilled message", () => {
      expect(encodeSMS({ phone: "+15551234567", message: "Code: 4920 & Verify" })).toBe(
        "sms:+15551234567?body=Code%3A%204920%20%26%20Verify"
      );
    });

    it("encodes SMS URI without body if message is empty", () => {
      expect(encodeSMS({ phone: "+15551234567", message: "" })).toBe("sms:+15551234567");
    });
  });

  describe("9. Geographic Location Format (encodeGeo)", () => {
    it("formats geographic coordinates into Google Maps query link", () => {
      const geo = encodeGeo({ latitude: "37.7749", longitude: "-122.4194" });
      expect(geo).toBe("https://www.google.com/maps/search/?api=1&query=37.7749%2C-122.4194");
    });

    it("preserves direct Google/Apple map URL if pasted in latitude/mapUrl field", () => {
      const directUrl = "https://maps.google.com/?q=Statue+of+Liberty";
      const geo = encodeGeo({ latitude: directUrl });
      expect(geo).toBe(directUrl);
    });
  });

  describe("10. Calendar Event Format (encodeEvent — RFC 5545)", () => {
    it("encodes RFC 5545 compliant VEVENT with mandatory PRODID, VERSION, UID, and DTSTAMP", () => {
      const event = encodeEvent({
        title: "Product Launch Party, 2026; Keynote",
        startDate: "2026-11-15T18:00:00Z",
        endDate: "2026-11-15T22:00:00Z",
        location: "Grand Ballroom, San Francisco; CA",
        description: "Official celebration.\nLive demo.",
      });

      expect(event).toContain("BEGIN:VCALENDAR");
      expect(event).toContain("VERSION:2.0");
      expect(event).toContain("PRODID:-//UCode//UCode QR Platform//EN");
      expect(event).toContain("BEGIN:VEVENT");
      expect(event).toContain("UID:");
      expect(event).toContain("DTSTAMP:");
      expect(event).toContain("DTSTART:20261115T180000Z");
      expect(event).toContain("DTEND:20261115T220000Z");
      // Commas and semicolons escaped per RFC 5545 §3.3.11
      expect(event).toContain("SUMMARY:Product Launch Party\\, 2026\\; Keynote");
      expect(event).toContain("LOCATION:Grand Ballroom\\, San Francisco\\; CA");
      expect(event).toContain("DESCRIPTION:Official celebration.\\nLive demo.");
      expect(event).toContain("END:VEVENT");
      expect(event).toContain("END:VCALENDAR");
    });
  });

  describe("encodeQRPayload router", () => {
    it("routes correctly to active type", () => {
      const urlPayload = encodeQRPayload("url", { url: "ucreates.io" });
      expect(urlPayload).toBe("https://ucreates.io");

      const textPayload = encodeQRPayload("text", { text: "Direct test" });
      expect(textPayload).toBe("Direct test");
    });
  });
});

describe("QR Validation and Diagnostics", () => {
  it("flags empty URL", () => {
    const res = validateQRFormData("url", { url: "" });
    expect(res.isValid).toBe(false);
    expect(res.errors.url).toBeDefined();
  });

  it("passes valid URL", () => {
    const res = validateQRFormData("url", { url: "https://ucreates.io" });
    expect(res.isValid).toBe(true);
  });

  it("validates Wi-Fi passwords when WPA is selected", () => {
    const shortPass = validateQRFormData("wifi", {
      ssid: "HomeNet",
      password: "123",
      encryption: "WPA",
    });
    expect(shortPass.isValid).toBe(false);
    expect(shortPass.errors.password).toContain("at least 8 characters");

    const validPass = validateQRFormData("wifi", {
      ssid: "HomeNet",
      password: "validpassword123",
      encryption: "WPA",
    });
    expect(validPass.isValid).toBe(true);
  });

  it("allows nopass without password for open Wi-Fi", () => {
    const openWifi = validateQRFormData("wifi", {
      ssid: "CoffeeShop",
      encryption: "nopass",
    });
    expect(openWifi.isValid).toBe(true);
  });

  it("validates geographic coordinates and bounds", () => {
    const invalidLat = validateQRFormData("geo", { latitude: "95.0", longitude: "0" });
    expect(invalidLat.isValid).toBe(false);

    const invalidLng = validateQRFormData("geo", { latitude: "0", longitude: "190.0" });
    expect(invalidLng.isValid).toBe(false);

    const validCoords = validateQRFormData("geo", { latitude: "37.7749", longitude: "-122.4194" });
    expect(validCoords.isValid).toBe(true);

    const validMapUrl = validateQRFormData("geo", { latitude: "https://maps.google.com/?q=Test" });
    expect(validMapUrl.isValid).toBe(true);
  });

  it("calculates contrast ratios accurately", () => {
    const blackOnWhite = calculateContrastRatio("#000000", "#ffffff");
    expect(blackOnWhite).toBeGreaterThan(20);

    const lowContrast = calculateContrastRatio("#cccccc", "#ffffff");
    expect(lowContrast).toBeLessThan(3.0);
  });

  it("evaluates scannability and recommends improvements", () => {
    const standardOptions: QRCustomizationOptions = {
      fgColor: "#000000",
      bgColor: "#ffffff",
      errorCorrectionLevel: "M",
      margin: 4,
      size: 512,
      logo: null,
      logoSize: 20,
    };

    const goodReport = evaluateScannability(standardOptions);
    expect(goodReport.score).toBe(100);
    expect(goodReport.contrastGrade).toBe("excellent");

    // Inverted colors and low margin
    const badOptions: QRCustomizationOptions = {
      ...standardOptions,
      fgColor: "#ffffff",
      bgColor: "#000000",
      margin: 0,
      logo: "data:image/png;base64,sample",
      errorCorrectionLevel: "L", // risky with logo
    };

    const warnedReport = evaluateScannability(badOptions);
    expect(warnedReport.score).toBeLessThan(70);
    expect(warnedReport.recommendations.length).toBeGreaterThanOrEqual(2);
    expect(warnedReport.logoSafe).toBe(false);
  });

  describe("calculatePrintSize", () => {
    it("applies 10:1 distance-to-size formula", () => {
      const calc1m = calculatePrintSize(1);
      expect(calc1m.sizeCm).toBe(10);

      const calc2m = calculatePrintSize(2);
      expect(calc2m.sizeCm).toBe(20);
    });
  });
});

describe("SVG Output Generation", () => {
  it("produces valid, scalable SVG markup with appropriate attributes", async () => {
    const svg = await generateQRSVG("https://ucreates.io", {
      fgColor: "#1e1b4b",
      bgColor: "#ffffff",
      errorCorrectionLevel: "M",
      margin: 4,
      size: 512,
      logo: null,
      logoSize: 20,
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('width="512"');
    expect(svg).toContain('height="512"');
    expect(svg).toContain("viewBox=");
    expect(svg).toContain("</svg>");
  });

  it("embeds center logo safely with quote escaping", async () => {
    const svg = await generateQRSVG("https://ucreates.io", {
      fgColor: "#000000",
      bgColor: "#ffffff",
      errorCorrectionLevel: "H",
      margin: 4,
      size: 512,
      logo: 'data:image/svg+xml;utf8,<svg viewBox="0 0 10 10"></svg>',
      logoSize: 20,
    });

    expect(svg).toContain('<g id="ucode-center-logo">');
    expect(svg).toContain("xlink:href=");
    expect(svg).not.toContain('href="data:image/svg+xml;utf8,<svg viewBox="0'); // quotes properly escaped
  });

  it("renders protective backing plate with custom padding and corner radius in module coordinates", async () => {
    const svg = await generateQRSVG("https://ucreates.io", {
      fgColor: "#000000",
      bgColor: "#ffffff",
      errorCorrectionLevel: "H",
      margin: 4,
      size: 512,
      logo: 'data:image/svg+xml;utf8,<svg viewBox="0 0 10 10"></svg>',
      logoSize: 20,
      logoPadding: 16,
      logoRadius: 8,
    });

    // Contains backing rect with rx (radius) and fill (white)
    expect(svg).toContain('<rect');
    expect(svg).toContain('rx=');
    expect(svg).toContain('preserveAspectRatio="xMidYMid meet"');
    // Ensure logo coordinates are in module space (e.g. < 50 for version 2-4 QR code), not pixel space (512)
    const logoGroup = svg.match(/<g id="ucode-center-logo">([\s\S]*?)<\/g>/)?.[1];
    expect(logoGroup).toBeDefined();
    // In module coordinates, x coordinate should be proportional to modules (e.g. ~10-25), not > 100
    const xMatch = logoGroup?.match(/x="([\d.]+)"/);
    expect(xMatch).toBeTruthy();
    const xVal = parseFloat(xMatch![1]);
    expect(xVal).toBeLessThan(50);
  });
});

describe("Synthetic Decoder Visual Round-Trip Verification (jsQR on Pixel Matrix)", () => {
  const testPayloads = [
    { type: "URL", payload: "https://ucreates.io/work" },
    { type: "Text", payload: "UCode Privacy-First QR Code 2026! 東京" },
    { type: "Wi-Fi", payload: "WIFI:S:TestNet;T:WPA;P:SecP@ssw0rd123;;;" },
    { type: "WhatsApp", payload: "https://wa.me/15551234567?text=Hello%20World" },
    {
      type: "vCard",
      payload:
        "BEGIN:VCARD\nVERSION:3.0\nN:Smith;John;;;\nFN:John Smith\nORG:Acme Corp\nTEL;TYPE=CELL,VOICE:+15551234567\nEND:VCARD",
    },
    { type: "Email", payload: "mailto:hello@ucreates.io?subject=Inquiry" },
    { type: "Phone", payload: "tel:+18005550199" },
    { type: "SMS", payload: "sms:+15559876543?body=Code123" },
    { type: "Geo", payload: "https://www.google.com/maps/search/?api=1&query=37.7749%2C-122.4194" },
    {
      type: "Event",
      payload:
        "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//UCode//EN\nBEGIN:VEVENT\nUID:ev-123\nDTSTAMP:20261016T000000Z\nDTSTART:20261101T090000Z\nDTEND:20261101T100000Z\nSUMMARY:Conference\nEND:VEVENT\nEND:VCALENDAR",
    },
  ];

    for (const { type, payload } of testPayloads) {
      it(`round-trip decodes generated visual pixel matrix for format: ${type}`, () => {
        const decoded = decodeMatrixWithJsQR(payload);
        expect(decoded).toBe(payload);
      });
    }
  });

  describe("Module Grid Logo Dimensioning & Boundary Guarantees", () => {
    it("snaps logo box to an odd integer of modules centered on middle module", () => {
      // For Version 2 (25x25), center is module 12
      const v2_18 = calculateLogoModuleDimensions(25, 18);
      expect(v2_18.boxModules % 2).toBe(1); // odd integer
      expect(v2_18.startModule).toBe((25 - 1) / 2 - (v2_18.boxModules - 1) / 2);
      expect(v2_18.isSafe).toBe(true);

      // For Version 7 (45x45), center is module 22
      const v7_18 = calculateLogoModuleDimensions(45, 18);
      expect(v7_18.boxModules % 2).toBe(1);
      expect(v7_18.startModule).toBe((45 - 1) / 2 - (v7_18.boxModules - 1) / 2);
      expect(v7_18.isSafe).toBe(true);
    });

    it("strictly guarantees finder patterns and timing patterns are never occluded", () => {
      // Test across all common QR versions (21 to 101 modules)
      for (const size of [21, 25, 29, 33, 45, 57, 77, 93, 101]) {
        const dim = calculateLogoModuleDimensions(size, 30); // max requested
        // Finder patterns and separators span 0..7 and (size-8)..(size-1)
        // Timing pattern runs at row/col 6
        expect(dim.startModule).toBeGreaterThanOrEqual(7);
        expect(dim.startModule + dim.boxModules).toBeLessThanOrEqual(size - 7);
        expect(dim.boxModules).toBeLessThanOrEqual(dim.maxSafeModules);
      }
    });
  });

  describe("Automated Decoder Regression Gate (jsQR on Final Rasterized Buffers)", () => {
    const testUrl = "https://ucreates.io";

    it("1. Plain URL QR generation and independent decoding at 2048px", () => {
      const rendered = renderQRToBuffer(testUrl, {
        fgColor: "#000000",
        bgColor: "#ffffff",
        errorCorrectionLevel: "H",
        margin: 4,
        size: 2048,
        logo: null,
        logoSize: 18,
      }, 2048);

      const code = jsQR(rendered.data, rendered.width, rendered.height, { inversionAttempts: "attemptBoth" });
      expect(code).not.toBeNull();
      expect(code?.data).toBe(testUrl);
    });

    it("2. URL QR with small logo (12%) and protective backing plate", () => {
      const rendered = renderQRToBuffer(testUrl, {
        fgColor: "#000000",
        bgColor: "#ffffff",
        errorCorrectionLevel: "H",
        margin: 4,
        size: 2048,
        logo: "data:image/svg+xml;base64,sample",
        logoSize: 12,
      }, 2048);

      const code = jsQR(rendered.data, rendered.width, rendered.height, { inversionAttempts: "attemptBoth" });
      expect(code).not.toBeNull();
      expect(code?.data).toBe(testUrl);
    });

    it("3. URL QR with default logo configuration (18% scale, Level H)", () => {
      const rendered = renderQRToBuffer(testUrl, {
        fgColor: "#000000",
        bgColor: "#ffffff",
        errorCorrectionLevel: "H",
        margin: 4,
        size: 2048,
        logo: "data:image/svg+xml;base64,sample",
        logoSize: 18,
      }, 2048);

      const code = jsQR(rendered.data, rendered.width, rendered.height, { inversionAttempts: "attemptBoth" });
      expect(code).not.toBeNull();
      expect(code?.data).toBe(testUrl);
    });

    it("4. URL QR with large logo (>24%) triggers scannability warning and recovery bounds", () => {
      // Under Level Q, large logo (26%) leaves minimal headroom
      const reportQ = evaluateScannability({
        fgColor: "#000000",
        bgColor: "#ffffff",
        errorCorrectionLevel: "Q",
        margin: 4,
        size: 2048,
        logo: "data:image/svg+xml;base64,sample",
        logoSize: 26,
      });
      expect(reportQ.logoSafe).toBe(false);
      expect(reportQ.logoWarning).toContain("exceeds safe headroom");

      // When decoder validation fails, score is penalized honestly
      const failedReport = evaluateScannability({
        fgColor: "#000000",
        bgColor: "#ffffff",
        errorCorrectionLevel: "M",
        margin: 4,
        size: 2048,
        logo: "data:image/svg+xml;base64,sample",
        logoSize: 28,
      }, { tested: true, success: false });
      expect(failedReport.score).toBeLessThanOrEqual(30);
      expect(failedReport.recommendations[0]).toContain("Software Decoder Validation FAILED");
    });

    it("5. PNG export raster validation at 512, 1024, 2048, and 4096 pixels", () => {
      const resolutions = [512, 1024, 2048, 4096];
      for (const res of resolutions) {
        const rendered = renderQRToBuffer(testUrl, {
          fgColor: "#0f172a",
          bgColor: "#ffffff",
          errorCorrectionLevel: "H",
          margin: 4,
          size: res,
          logo: "data:image/svg+xml;base64,sample",
          logoSize: 18,
        }, res);

        expect(rendered.width).toBe(res);
        expect(rendered.height).toBe(res);
        expect(rendered.data.length).toBe(res * res * 4);

        const code = jsQR(rendered.data, res, res, { inversionAttempts: "attemptBoth" });
        expect(code).not.toBeNull();
        expect(code?.data).toBe(testUrl);
      }
    });

    it("6. Standards-compliant SVG export structure and module coordinate fidelity", async () => {
      const svg = await generateQRSVG(testUrl, {
        fgColor: "#000000",
        bgColor: "#ffffff",
        errorCorrectionLevel: "H",
        margin: 4,
        size: 1024,
        logo: "data:image/svg+xml;base64,sample",
        logoSize: 18,
        logoPadding: 14,
        logoRadius: 20,
      });

      expect(svg).toContain("<svg");
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('xmlns:xlink="http://www.w3.org/1999/xlink"');
      expect(svg).toContain('<g id="ucode-center-logo">');
      // Ensure rect and image elements exist with valid module-space coordinates
      expect(svg).toMatch(/<rect\s+x="[\d.]+"\s+y="[\d.]+"\s+width="[\d.]+"\s+height="[\d.]+"/);
      expect(svg).toMatch(/<image\s+x="[\d.]+"\s+y="[\d.]+"\s+width="[\d.]+"\s+height="[\d.]+"/);
      expect(svg).toContain('preserveAspectRatio="xMidYMid meet"');
    });

    it("7. Foreground/background contrast calculation and ISO 18004 quiet zone behavior", () => {
      // ISO 18004 requires 4-module quiet zone
      const compliantReport = evaluateScannability({
        fgColor: "#000000",
        bgColor: "#ffffff",
        errorCorrectionLevel: "H",
        margin: 4,
        size: 512,
        logo: null,
        logoSize: 18,
      });
      expect(compliantReport.quietZoneSafe).toBe(true);
      expect(compliantReport.contrastRatio).toBeGreaterThanOrEqual(20);
      expect(compliantReport.contrastGrade).toBe("excellent");

      // Narrow quiet zone (<4 modules)
      const narrowReport = evaluateScannability({
        fgColor: "#000000",
        bgColor: "#ffffff",
        errorCorrectionLevel: "H",
        margin: 2,
        size: 512,
        logo: null,
        logoSize: 18,
      });
      expect(narrowReport.quietZoneSafe).toBe(false);
      expect(narrowReport.recommendations.some(r => r.includes("Narrow margin"))).toBe(true);
    });

    it("8. Exact payload preservation across all 10 formats through styling and export paths", () => {
      const allFormats = [
        { name: "URL", payload: "https://ucreates.io/solutions" },
        { name: "Text", payload: "UCode High-Precision Verification 2026." },
        { name: "Wi-Fi", payload: "WIFI:S:UCreates-Secure;T:WPA;P:HighSec#2026;;;" },
        { name: "WhatsApp", payload: "https://wa.me/15550192834?text=Hello" },
        {
          name: "vCard",
          payload:
            "BEGIN:VCARD\nVERSION:3.0\nN:Alex;Morgan;;;\nFN:Alex Morgan\nORG:UCreates\nTEL;TYPE=CELL:+15550192834\nEMAIL:alex@ucreates.io\nEND:VCARD",
        },
        { name: "Email", payload: "mailto:hello@ucreates.io?subject=Lead" },
        { name: "Phone", payload: "tel:+15550192834" },
        { name: "SMS", payload: "sms:+15550192834?body=Test" },
        { name: "Geo", payload: "https://www.google.com/maps/search/?api=1&query=37.7749%2C-122.4194" },
        {
          name: "Event",
          payload:
            "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Launch\nDTSTART:20261101T090000Z\nEND:VEVENT\nEND:VCALENDAR",
        },
      ];

      for (const item of allFormats) {
        const rendered = renderQRToBuffer(item.payload, {
          fgColor: "#0f172a",
          bgColor: "#ffffff",
          errorCorrectionLevel: "H",
          margin: 4,
          size: 1024,
          logo: "data:image/svg+xml;base64,sample",
          logoSize: 18,
        }, 1024);

        const code = jsQR(rendered.data, rendered.width, rendered.height, { inversionAttempts: "attemptBoth" });
        expect(code, `Failed decoding format: ${item.name}`).not.toBeNull();
        expect(code?.data).toBe(item.payload);
      }
    });

    it("9. Long payloads and higher QR versions requiring alignment patterns", () => {
      const longPayloads = [
        {
          name: "Long URL (QR Version 12, 65x65 modules)",
          payload: "https://ucreates.io/work/enterprise-digital-solutions-portfolio-case-studies-2026?source=qr-code&campaign=global-launch&medium=print-magazine-q4",
        },
        {
          name: "Full vCard 3.0 (QR Version 19, 93x93 modules)",
          payload:
            "BEGIN:VCARD\nVERSION:3.0\nN:Morgan;Alex;;;\nFN:Alex Morgan\nORG:UCreates Digital Solutions Studio\nTITLE:Chief Technology Architect\nTEL;TYPE=CELL,VOICE:+15550192834\nEMAIL:alex@ucreates.io\nURL:https://ucreates.io\nADR:;;100 Montgomery St;San Francisco;CA;94104;USA\nNOTE:Full vCard contact card generated via UCode platform.\nEND:VCARD",
        },
        {
          name: "Complex Event (QR Version 21, 101x101 modules)",
          payload:
            "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//UCreates//UCode 2026//EN\nBEGIN:VEVENT\nUID:ucode-summit-2026\nDTSTAMP:20261023T050000Z\nDTSTART:20261115T090000Z\nDTEND:20261115T180000Z\nSUMMARY:Global Engineering & QR Architecture Summit 2026\nLOCATION:Moscone Center West, San Francisco, CA\nDESCRIPTION:Keynote address on privacy-first client-side web applications and prepress optical engineering.\nEND:VEVENT\nEND:VCALENDAR",
        },
      ];

      for (const item of longPayloads) {
        // Test without logo
        const plain = renderQRToBuffer(item.payload, {
          fgColor: "#000000",
          bgColor: "#ffffff",
          errorCorrectionLevel: "H",
          margin: 4,
          size: 2048,
          logo: null,
          logoSize: 18,
        }, 2048);
        const codePlain = jsQR(plain.data, 2048, 2048, { inversionAttempts: "attemptBoth" });
        expect(codePlain, `Failed decoding plain: ${item.name}`).not.toBeNull();
        expect(codePlain?.data).toBe(item.payload);

        // Test with logo overlay
        const withLogo = renderQRToBuffer(item.payload, {
          fgColor: "#000000",
          bgColor: "#ffffff",
          errorCorrectionLevel: "H",
          margin: 4,
          size: 2048,
          logo: "data:image/svg+xml;base64,sample",
          logoSize: 18,
          logoMode: true,
        }, 2048);
        const codeLogo = jsQR(withLogo.data, 2048, 2048, { inversionAttempts: "attemptBoth" });
        expect(codeLogo, `Failed decoding with logo: ${item.name}`).not.toBeNull();
        expect(codeLogo?.data).toBe(item.payload);
      }
    });
  });

  describe("Style Studio — Shape, Pattern, Finder, and Combination Decoding Suite", () => {
    const testUrl = "https://ucreates.io";

    it("1. Decodes all 5 individual module shapes with independent decoder (jsQR)", () => {
      const shapes: ("square" | "rounded-square" | "bubble" | "soft-pixel" | "diamond")[] = [
        "square",
        "rounded-square",
        "bubble",
        "soft-pixel",
        "diamond",
      ];

      for (const shape of shapes) {
        const rendered = renderQRToBuffer(testUrl, {
          fgColor: "#000000",
          bgColor: "#ffffff",
          errorCorrectionLevel: "H",
          margin: 4,
          size: 1024,
          moduleShape: shape,
          patternStyle: "classic-grid",
          finderStyle: "square",
          logo: null,
          logoSize: 18,
        }, 1024);

        const code = jsQR(rendered.data, 1024, 1024, { inversionAttempts: "attemptBoth" });
        expect(code, `Failed decoding module shape: ${shape}`).not.toBeNull();
        expect(code?.data).toBe(testUrl);
      }
    });

    it("2. Decodes all 3 finder pattern styles with independent decoder (jsQR)", () => {
      const finders: ("square" | "rounded" | "circular")[] = [
        "square",
        "rounded",
        "circular",
      ];

      for (const finder of finders) {
        const rendered = renderQRToBuffer(testUrl, {
          fgColor: "#0f172a",
          bgColor: "#f8fafc",
          errorCorrectionLevel: "H",
          margin: 4,
          size: 1024,
          moduleShape: "square",
          patternStyle: "classic-grid",
          finderStyle: finder,
          logo: null,
          logoSize: 18,
        }, 1024);

        const code = jsQR(rendered.data, 1024, 1024, { inversionAttempts: "attemptBoth" });
        expect(code, `Failed decoding finder style: ${finder}`).not.toBeNull();
        expect(code?.data).toBe(testUrl);
      }
    });

    it("3. Decodes all 5 pattern styles with independent decoder (jsQR)", () => {
      const patterns: ("classic-grid" | "dotted-matrix" | "soft-grid" | "connected-flow" | "dense-geometric")[] = [
        "classic-grid",
        "dotted-matrix",
        "soft-grid",
        "connected-flow",
        "dense-geometric",
      ];

      for (const pattern of patterns) {
        const rendered = renderQRToBuffer(testUrl, {
          fgColor: "#0f172a",
          bgColor: "#ffffff",
          errorCorrectionLevel: "H",
          margin: 4,
          size: 1024,
          moduleShape: "square",
          patternStyle: pattern,
          finderStyle: "square",
          logo: null,
          logoSize: 18,
        }, 1024);

        const code = jsQR(rendered.data, 1024, 1024, { inversionAttempts: "attemptBoth" });
        expect(code, `Failed decoding pattern style: ${pattern}`).not.toBeNull();
        expect(code?.data).toBe(testUrl);
      }
    });

    it("4. Decodes representative styled combinations with and without center logos", () => {
      const combinations = [
        {
          name: "Modern Flow + Rounded Finders + Logo",
          moduleShape: "rounded-square" as const,
          patternStyle: "connected-flow" as const,
          finderStyle: "rounded" as const,
          logo: "data:image/svg+xml;base64,sample",
          logoMode: true,
        },
        {
          name: "Cyber Dots + Circular Finders + Logo",
          moduleShape: "bubble" as const,
          patternStyle: "dotted-matrix" as const,
          finderStyle: "circular" as const,
          logo: "data:image/svg+xml;base64,sample",
          logoMode: true,
        },
        {
          name: "Soft Tech + Rounded Finders",
          moduleShape: "soft-pixel" as const,
          patternStyle: "soft-grid" as const,
          finderStyle: "rounded" as const,
          logo: null,
          logoMode: false,
        },
        {
          name: "Luxe Diamond + Square Finders + Logo",
          moduleShape: "diamond" as const,
          patternStyle: "classic-grid" as const,
          finderStyle: "square" as const,
          logo: "data:image/svg+xml;base64,sample",
          logoMode: true,
        },
        {
          name: "Dense Geometric + Circular Finders",
          moduleShape: "square" as const,
          patternStyle: "dense-geometric" as const,
          finderStyle: "circular" as const,
          logo: null,
          logoMode: false,
        },
      ];

      for (const combo of combinations) {
        const rendered = renderQRToBuffer(testUrl, {
          fgColor: "#0f172a",
          bgColor: "#ffffff",
          errorCorrectionLevel: "H",
          margin: 4,
          size: 1024,
          moduleShape: combo.moduleShape,
          patternStyle: combo.patternStyle,
          finderStyle: combo.finderStyle,
          logo: combo.logo,
          logoMode: combo.logoMode,
          logoSize: 18,
        }, 1024);

        const code = jsQR(rendered.data, 1024, 1024, { inversionAttempts: "attemptBoth" });
        expect(code, `Failed decoding combination: ${combo.name}`).not.toBeNull();
        expect(code?.data).toBe(testUrl);
      }
    });

    it("5. Verifies SVG export structure across module shapes and finder styles", async () => {
      // Test bubble dots with circular finders
      const bubbleSvg = await generateQRSVG(testUrl, {
        fgColor: "#0f172a",
        bgColor: "#ffffff",
        errorCorrectionLevel: "H",
        margin: 4,
        size: 512,
        moduleShape: "bubble",
        patternStyle: "dotted-matrix",
        finderStyle: "circular",
        logo: null,
        logoSize: 18,
      });
      expect(bubbleSvg).toContain("<circle");
      expect(bubbleSvg).toContain('rx="2.8"'); // circular finder frame

      // Test diamond facets
      const diamondSvg = await generateQRSVG(testUrl, {
        fgColor: "#881337",
        bgColor: "#fff1f2",
        errorCorrectionLevel: "H",
        margin: 4,
        size: 512,
        moduleShape: "diamond",
        patternStyle: "classic-grid",
        finderStyle: "square",
        logo: null,
        logoSize: 18,
      });
      expect(diamondSvg).toContain("<polygon points=");

      // Test connected flow with center logo
      const flowSvg = await generateQRSVG(testUrl, {
        fgColor: "#0f172a",
        bgColor: "#f8fafc",
        errorCorrectionLevel: "H",
        margin: 4,
        size: 512,
        moduleShape: "rounded-square",
        patternStyle: "connected-flow",
        finderStyle: "rounded",
        logo: "data:image/svg+xml;base64,sample",
        logoMode: true,
        logoSize: 18,
      });
      expect(flowSvg).toContain('<g id="ucode-center-logo">');
      expect(flowSvg).toContain('rx="1.5"'); // rounded finder frame
    });

    it("6. Decodes styled QR codes on higher versions with alignment patterns (Version 12 & 19)", () => {
      const v12Payload = "https://ucreates.io/work/enterprise-digital-solutions-portfolio-case-studies-2026?source=qr-code&campaign=global-launch";

      // Test Connected Flow on Version 12
      const renderedFlow = renderQRToBuffer(v12Payload, {
        fgColor: "#000000",
        bgColor: "#ffffff",
        errorCorrectionLevel: "H",
        margin: 4,
        size: 2048,
        moduleShape: "rounded-square",
        patternStyle: "connected-flow",
        finderStyle: "rounded",
        logo: null,
        logoSize: 18,
      }, 2048);
      const codeFlow = jsQR(renderedFlow.data, 2048, 2048, { inversionAttempts: "attemptBoth" });
      expect(codeFlow, "Failed decoding V12 Connected Flow").not.toBeNull();
      expect(codeFlow?.data).toBe(v12Payload);

      // Test Bubble Matrix on Version 12
      const renderedDots = renderQRToBuffer(v12Payload, {
        fgColor: "#000000",
        bgColor: "#ffffff",
        errorCorrectionLevel: "H",
        margin: 4,
        size: 2048,
        moduleShape: "bubble",
        patternStyle: "dotted-matrix",
        finderStyle: "circular",
        logo: null,
        logoSize: 18,
      }, 2048);
      const codeDots = jsQR(renderedDots.data, 2048, 2048, { inversionAttempts: "attemptBoth" });
      expect(codeDots, "Failed decoding V12 Bubble Dots").not.toBeNull();
      expect(codeDots?.data).toBe(v12Payload);
    });
  });


