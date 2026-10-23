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
 * Evaluates optical and geometric quality: contrast ratio, quiet zone adherence,
 * error correction suitability, and optional decoder verification status.
 */
export function evaluateScannability(
  options: QRCustomizationOptions,
  decoderStatus?: { tested: boolean; success: boolean }
): ScannabilityReport {
  const recommendations: string[] = [];
  let score = 100;
  let logoWarning: string | null = null;

  // 1. Contrast calculation according to WCAG 2.1
  const fgRgb = hexToRgb(options.fgColor);
  const bgRgb = hexToRgb(options.bgColor);
  const fgLum = getRelativeLuminance(fgRgb);
  const bgLum = getRelativeLuminance(bgRgb);
  const contrastRatio = calculateContrastRatio(options.fgColor, options.bgColor);

  let contrastGrade: "excellent" | "acceptable" | "poor" = "excellent";

  // Check inverted colors (dark background, light foreground)
  if (bgLum < fgLum) {
    score -= 15;
    recommendations.push(
      "Inverted colors detected (light foreground on dark background). Standard optical sensors scan dark-on-light codes faster and more reliably."
    );
  }

  if (contrastRatio >= 7.0) {
    contrastGrade = "excellent";
  } else if (contrastRatio >= 4.0) {
    contrastGrade = "acceptable";
    score -= 15;
    recommendations.push(
      `Moderate contrast ratio (${contrastRatio}:1). Increase foreground darkness or background lightness for outdoor sunlight readability.`
    );
  } else {
    contrastGrade = "poor";
    score -= 40;
    recommendations.push(
      `Critically low contrast ratio (${contrastRatio}:1). Camera sensors will struggle to distinguish modules. Target at least 7.0:1.`
    );
  }

  // 2. Quiet zone evaluation (ISO/IEC 18004 specifies 4 modules)
  const quietZoneSafe = options.margin >= 4;
  if (options.margin === 0) {
    score -= 25;
    recommendations.push(
      "Zero margin selected. ISO/IEC 18004 standard requires a 4-module quiet zone to prevent nearby background graphics from corrupting finder patterns."
    );
  } else if (options.margin < 2) {
    score -= 15;
    recommendations.push(
      "Critically narrow margin (1 module). A minimum margin of 4 modules is recommended for prepress packaging and print."
    );
  } else if (options.margin < 4) {
    score -= 10;
    recommendations.push(
      `Narrow margin (${options.margin} modules). ISO/IEC 18004 recommends 4 modules of quiet zone for reliable camera capture.`
    );
  }

  // 3. Logo vs Reed-Solomon Error Correction evaluation
  let logoSafe = true;
  const hasLogo = Boolean(options.logo && options.logoMode !== false);
  if (hasLogo) {
    const logoSize = options.logoSize || 18;
    if (options.errorCorrectionLevel === "L") {
      logoSafe = false;
      score -= 35;
      logoWarning = "Logo enabled with Level L (7%) error correction. Reed-Solomon recovery is insufficient for center occlusion.";
      recommendations.push(
        "Center logo enabled with Level L (7%) error correction. Upgrade to Level H (30%) immediately to recover occluded modules."
      );
    } else if (options.errorCorrectionLevel === "M") {
      logoSafe = false;
      score -= 25;
      logoWarning = "Logo enabled with Level M (15%) error correction. High risk of scan failure.";
      recommendations.push(
        "Level M (15%) provides limited defect tolerance for center logos. We strongly recommend Level H (30%) error correction."
      );
    } else if (options.errorCorrectionLevel === "Q") {
      if (logoSize > 18) {
        logoSafe = false;
        score -= 15;
        logoWarning = `Logo scale (${logoSize}%) exceeds safe headroom for Level Q (25%). Upgrade to Level H (30%).`;
        recommendations.push(
          `Logo scale (${logoSize}%) leaves minimal Reed-Solomon recovery headroom under Level Q. Switch to Level H (30%) to ensure scan reliability.`
        );
      } else {
        logoSafe = true;
      }
    } else if (options.errorCorrectionLevel === "H") {
      if (logoSize > 25) {
        logoSafe = false;
        score -= 10;
        logoWarning = `Large logo scale (${logoSize}%) covers significant central modules. Test thoroughly under target camera conditions.`;
        recommendations.push(
          `Large logo scale (${logoSize}%) approaches the upper boundary of Level H (30%) error recovery. Keep below 22% for maximum camera angle tolerance.`
        );
      } else {
        logoSafe = true;
      }
    }
  }

  // 4. Style Studio scannability checks
  let styleWarning: string | null = null;
  if (options.moduleShape === "diamond" && options.errorCorrectionLevel === "L") {
    score -= 5;
    styleWarning = "Diamond module shape with Level L error correction. We recommend Level M or H for maximum optical tolerance.";
    recommendations.push(
      "Diamond modules reduce cell fill area. Pair with Error Correction Level M or H to ensure rapid camera recognition."
    );
  }

  // 5. Decoder Verification override
  let decoderVerified = false;
  if (decoderStatus && decoderStatus.tested) {
    if (!decoderStatus.success) {
      // If independent decoder failed to decode rendered output, clamp score to failure level
      score = Math.min(score, 30);
      recommendations.unshift(
        "Software Decoder Validation FAILED: An independent QR decoder could not extract the payload from the rendered visual output. Reduce logo size, adjust style, or increase contrast."
      );
    } else {
      decoderVerified = true;
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    contrastRatio,
    contrastGrade,
    quietZoneSafe,
    logoSafe,
    logoWarning,
    styleWarning,
    decoderVerified,
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
