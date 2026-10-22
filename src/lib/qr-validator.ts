import {
  QRType,
  QRFormDataMap,
  ValidationResult,
  QRCustomizationOptions,
  ScannabilityReport,
} from "@/types/qr";

/**
 * Validates form data for the active QR type.
 */
export function validateQRFormData<T extends QRType>(
  type: T,
  formData: QRFormDataMap[T]
): ValidationResult {
  const errors: Record<string, string> = {};

  switch (type) {
    case "url": {
      const url = (formData as QRFormDataMap["url"]).url?.trim();
      if (!url) {
        errors.url = "Please enter a website URL";
      } else {
        try {
          const testUrl = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(url)
            ? url
            : `https://${url}`;
          new URL(testUrl);
        } catch {
          errors.url = "Please enter a valid website address (e.g. example.com)";
        }
      }
      break;
    }

    case "text": {
      const text = (formData as QRFormDataMap["text"]).text;
      if (!text || !text.trim()) {
        errors.text = "Please enter some text";
      } else if (text.length > 2000) {
        errors.text = "Text is too long (recommended max 2,000 characters for reliable scanning)";
      }
      break;
    }

    case "wifi": {
      const { ssid, password, encryption } = formData as QRFormDataMap["wifi"];
      if (!ssid || !ssid.trim()) {
        errors.ssid = "Network name (SSID) is required";
      }
      if (encryption !== "nopass") {
        if (!password) {
          errors.password = "Password is required for secured networks";
        } else if (encryption === "WPA" && password.length < 8) {
          errors.password = "WPA/WPA2 passwords must be at least 8 characters";
        }
      }
      break;
    }

    case "whatsapp": {
      const { phone } = formData as QRFormDataMap["whatsapp"];
      const clean = phone?.replace(/\D/g, "");
      if (!clean || clean.length < 7) {
        errors.phone = "Please enter a valid phone number with country code (e.g. +1 555 123 4567)";
      }
      break;
    }

    case "vcard": {
      const { firstName, lastName, email, phone, url } =
        formData as QRFormDataMap["vcard"];
      if (!firstName?.trim() && !lastName?.trim()) {
        errors.firstName = "First or last name is required";
      }
      if (email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = "Please enter a valid email address";
      }
      if (phone?.trim() && phone.replace(/\D/g, "").length < 5) {
        errors.phone = "Please enter a valid telephone number";
      }
      if (url?.trim()) {
        try {
          const testUrl = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(url.trim())
            ? url.trim()
            : `https://${url.trim()}`;
          new URL(testUrl);
        } catch {
          errors.url = "Please enter a valid website URL";
        }
      }
      break;
    }

    case "email": {
      const { email } = formData as QRFormDataMap["email"];
      if (!email || !email.trim()) {
        errors.email = "Recipient email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = "Please enter a valid email address";
      }
      break;
    }

    case "phone": {
      const { phone } = formData as QRFormDataMap["phone"];
      const clean = phone?.replace(/\D/g, "");
      if (!clean || clean.length < 5) {
        errors.phone = "Please enter a valid phone number";
      }
      break;
    }

    case "sms": {
      const { phone } = formData as QRFormDataMap["sms"];
      const clean = phone?.replace(/\D/g, "");
      if (!clean || clean.length < 5) {
        errors.phone = "Please enter a valid recipient phone number";
      }
      break;
    }

    case "geo": {
      const { latitude, longitude, query } = formData as QRFormDataMap["geo"];
      const latTrim = (latitude || "").trim();
      const queryTrim = (query || "").trim();

      // Check if user entered a direct Map URL
      if (/^https?:\/\//i.test(latTrim) || /^https?:\/\//i.test(queryTrim)) {
        try {
          new URL(latTrim || queryTrim);
        } catch {
          errors.latitude = "Please provide a valid map URL";
        }
      } else {
        const lat = parseFloat(latitude || "");
        const lng = parseFloat(longitude || "");
        if (isNaN(lat) || lat < -90 || lat > 90) {
          errors.latitude = "Latitude must be between -90 and 90 (or enter a map URL)";
        }
        if (isNaN(lng) || lng < -180 || lng > 180) {
          errors.longitude = "Longitude must be between -180 and 180";
        }
      }
      break;
    }

    case "event": {
      const { title, startDate, endDate } = formData as QRFormDataMap["event"];
      if (!title || !title.trim()) {
        errors.title = "Event title is required";
      }
      if (!startDate) {
        errors.startDate = "Start date is required";
      } else {
        const start = new Date(startDate).getTime();
        if (isNaN(start)) {
          errors.startDate = "Invalid start date";
        } else if (endDate) {
          const end = new Date(endDate).getTime();
          if (isNaN(end)) {
            errors.endDate = "Invalid end date";
          } else if (end < start) {
            errors.endDate = "End date cannot be earlier than start date";
          }
        }
      }
      break;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Converts hex color (#rrggbb or #rgb) to RGB tuple.
 */
function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  if (c.length !== 6) return [0, 0, 0];
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Calculates relative luminance according to WCAG 2.1 specs.
 */
function getRelativeLuminance([r, g, b]: [number, number, number]): number {
  const [sR, sG, sB] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

/**
 * Calculates contrast ratio between two colors (1:1 to 21:1).
 */
export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  const fgRgb = hexToRgb(fgHex);
  const bgRgb = hexToRgb(bgHex);
  const lum1 = getRelativeLuminance(fgRgb);
  const lum2 = getRelativeLuminance(bgRgb);
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return Number(((brighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Evaluates scannability, contrast, quiet zone, and error-correction suitability.
 */
export function evaluateScannability(
  options: QRCustomizationOptions
): ScannabilityReport {
  const recommendations: string[] = [];
  let score = 100;

  // 1. Contrast calculation
  const fgRgb = hexToRgb(options.fgColor);
  const bgRgb = hexToRgb(options.bgColor);
  const fgLum = getRelativeLuminance(fgRgb);
  const bgLum = getRelativeLuminance(bgRgb);
  const contrastRatio = calculateContrastRatio(options.fgColor, options.bgColor);

  let contrastGrade: "excellent" | "acceptable" | "poor" = "excellent";

  // Check inverted colors (dark background, light foreground)
  if (bgLum < fgLum) {
    score -= 20;
    recommendations.push(
      "Inverted colors detected (light on dark). Standard barcode readers scan dark-on-light codes faster and more reliably."
    );
  }

  if (contrastRatio >= 7.0) {
    contrastGrade = "excellent";
  } else if (contrastRatio >= 4.0) {
    contrastGrade = "acceptable";
    score -= 10;
    recommendations.push(
      "Moderate contrast detected. Consider darkening foreground or lightening background for reliable outdoor scanning."
    );
  } else {
    contrastGrade = "poor";
    score -= 40;
    recommendations.push(
      `Low contrast ratio (${contrastRatio}:1). Many camera scanners will struggle to read this code. Increase contrast.`
    );
  }

  // 2. Quiet zone evaluation
  const quietZoneSafe = options.margin >= 2;
  if (options.margin === 0) {
    score -= 25;
    recommendations.push(
      "Zero margin selected. QR codes require a quiet zone around modules to separate from surrounding background graphics."
    );
  } else if (options.margin < 2) {
    score -= 10;
    recommendations.push(
      "Narrow margin (1 module). A minimum margin of 2–4 modules is recommended for print."
    );
  }

  // 3. Logo vs Error Correction evaluation
  let logoSafe = true;
  if (options.logo) {
    if (options.errorCorrectionLevel === "L") {
      logoSafe = false;
      score -= 30;
      recommendations.push(
        "Logo is enabled with 'L' (Low 7%) error correction. Change error correction to 'Q' (25%) or 'H' (30%) so the code can recover occluded modules."
      );
    } else if (options.errorCorrectionLevel === "M") {
      if (options.logoSize > 20) {
        logoSafe = false;
        score -= 15;
        recommendations.push(
          "Large logo with 'M' error correction may exceed recovery threshold. We recommend 'H' (High 30%) error correction."
        );
      }
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    contrastRatio,
    contrastGrade,
    quietZoneSafe,
    logoSafe,
    recommendations,
  };
}

/**
 * Calculates recommended minimum print size based on viewing distance.
 * Rule: Minimum Size = Distance / 10
 */
export function calculatePrintSize(distanceMeters: number): {
  sizeCm: number;
  sizeInches: number;
  description: string;
} {
  const sizeMeters = distanceMeters / 10;
  const sizeCm = Number((sizeMeters * 100).toFixed(1));
  const sizeInches = Number((sizeCm / 2.54).toFixed(1));

  let description = "Standard handheld scanning (e.g. flyers, business cards)";
  if (distanceMeters >= 2) {
    description = "Poster / window display scanning";
  } else if (distanceMeters >= 0.5) {
    description = "Table tent, menu, or desktop display";
  }

  return {
    sizeCm: Math.max(2, sizeCm),
    sizeInches: Math.max(0.8, sizeInches),
    description,
  };
}
