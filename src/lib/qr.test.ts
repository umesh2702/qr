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
import { generateQRSVG } from "./qr-generator";
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
      expect(encodeURL({ url: "ucode.app/generator" })).toBe("https://ucode.app/generator");
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
      logo: "data:image/svg+xml;utf8,<svg viewBox=\"0 0 10 10\"></svg>",
      logoSize: 20,
    });

    expect(svg).toContain('<g id="ucode-center-logo">');
    expect(svg).toContain("xlink:href=");
    expect(svg).not.toContain('href="data:image/svg+xml;utf8,<svg viewBox="0'); // quotes properly escaped
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
