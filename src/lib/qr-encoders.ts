import {
  QRType,
  URLFormData,
  TextFormData,
  WifiFormData,
  WhatsAppFormData,
  VCardFormData,
  EmailFormData,
  PhoneFormData,
  SMSFormData,
  GeoFormData,
  EventFormData,
  QRFormDataMap,
} from "@/types/qr";

/**
 * Normalizes URL string, adding https:// if protocol is omitted.
 */
export function encodeURL(data: URLFormData): string {
  const trimmed = (data.url || "").trim();
  if (!trimmed) return "";
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Encodes plain text.
 */
export function encodeText(data: TextFormData): string {
  return data.text || "";
}

/**
 * Escapes special characters for Wi-Fi QR encoding.
 * Characters needing escaping in ZXing Wi-Fi format: \ ; : "
 */
function escapeWifiField(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

/**
 * Encodes Wi-Fi configuration according to standard WIFI: syntax.
 */
export function encodeWifi(data: WifiFormData): string {
  if (!data.ssid) return "";
  const ssid = escapeWifiField(data.ssid);
  const encryption = data.encryption || "WPA";
  let wifiStr = `WIFI:S:${ssid};T:${encryption};`;

  if (encryption !== "nopass" && data.password) {
    wifiStr += `P:${escapeWifiField(data.password)};`;
  }

  if (data.hidden) {
    wifiStr += `H:true;`;
  }

  wifiStr += ";";
  return wifiStr;
}

/**
 * Sanitizes phone number by removing non-numeric characters except leading +
 */
export function sanitizePhoneNumber(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Encodes WhatsApp direct chat link.
 */
export function encodeWhatsApp(data: WhatsAppFormData): string {
  const cleanPhone = data.phone.trim().replace(/\D/g, "");
  if (!cleanPhone) return "";
  const baseUrl = `https://wa.me/${cleanPhone}`;
  if (data.message && data.message.trim()) {
    return `${baseUrl}?text=${encodeURIComponent(data.message.trim())}`;
  }
  return baseUrl;
}

/**
 * Escapes special characters for vCard 3.0 according to RFC 2426.
 * Characters needing escaping in text values: \ , ;
 */
export function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/**
 * Encodes vCard 3.0 contact format.
 */
export function encodeVCard(data: VCardFormData): string {
  const firstName = (data.firstName || "").trim();
  const lastName = (data.lastName || "").trim();
  if (!firstName && !lastName) return "";

  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  const escLastName = escapeVCardValue(lastName);
  const escFirstName = escapeVCardValue(firstName);
  lines.push(`N:${escLastName};${escFirstName};;;`);

  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  lines.push(`FN:${escapeVCardValue(fullName)}`);

  if (data.organization?.trim()) {
    lines.push(`ORG:${escapeVCardValue(data.organization.trim())}`);
  }
  if (data.title?.trim()) {
    lines.push(`TITLE:${escapeVCardValue(data.title.trim())}`);
  }
  if (data.phone?.trim()) {
    lines.push(`TEL;TYPE=CELL,VOICE:${data.phone.trim()}`);
  }
  if (data.email?.trim()) {
    lines.push(`EMAIL;TYPE=INTERNET:${data.email.trim()}`);
  }
  if (data.url?.trim()) {
    const website = encodeURL({ url: data.url.trim() });
    lines.push(`URL:${website}`);
  }
  if (data.address?.trim()) {
    const cleanAddr = escapeVCardValue(data.address.trim().replace(/\r?\n/g, ", "));
    lines.push(`ADR;TYPE=WORK:;;${cleanAddr};;;;`);
  }
  if (data.note?.trim()) {
    const cleanNote = escapeVCardValue(data.note.trim()).replace(/\r?\n/g, "\\n");
    lines.push(`NOTE:${cleanNote}`);
  }

  lines.push("END:VCARD");
  return lines.join("\n");
}

/**
 * Encodes mailto link.
 */
export function encodeEmail(data: EmailFormData): string {
  const email = (data.email || "").trim();
  if (!email) return "";

  const params = new URLSearchParams();
  if (data.subject?.trim()) {
    params.set("subject", data.subject.trim());
  }
  if (data.body?.trim()) {
    params.set("body", data.body.trim());
  }

  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}

/**
 * Encodes phone call link.
 */
export function encodePhone(data: PhoneFormData): string {
  const sanitized = sanitizePhoneNumber(data.phone || "");
  return sanitized ? `tel:${sanitized}` : "";
}

/**
 * Encodes SMS link with optional prefilled message.
 */
export function encodeSMS(data: SMSFormData): string {
  const sanitized = sanitizePhoneNumber(data.phone || "");
  if (!sanitized) return "";
  if (data.message?.trim()) {
    return `sms:${sanitized}?body=${encodeURIComponent(data.message.trim())}`;
  }
  return `sms:${sanitized}`;
}

/**
 * Encodes geographical coordinates into universal map link or accepts direct map URL.
 */
export function encodeGeo(data: GeoFormData): string {
  const lat = (data.latitude || "").trim();
  const lng = (data.longitude || "").trim();
  const query = (data.query || "").trim();

  // If user entered a direct map URL in latitude or query, pass it directly
  if (/^https?:\/\//i.test(lat)) {
    return lat;
  }
  if (/^https?:\/\//i.test(query)) {
    return query;
  }

  if (!lat || !lng) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
}

/**
 * Formats a Date or date string to iCalendar UTC timestamp: YYYYMMDDTHHmmssZ
 */
function formatICalDate(dateStr: string, allDay = false): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  if (allDay) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

/**
 * Escapes text for iCalendar RFC 5545 (backslashes, semicolons, commas).
 */
export function escapeICalText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Encodes Calendar Event in RFC 5545 compliant iCalendar format.
 * Includes mandatory PRODID, VERSION, UID, and DTSTAMP fields.
 */
export function encodeEvent(data: EventFormData): string {
  const title = (data.title || "").trim();
  if (!title || !data.startDate) return "";

  const startFormatted = formatICalDate(data.startDate, data.allDay);
  if (!startFormatted) return "";

  // Deterministic UID based on title and start date for RFC 5545 compliance
  const uidSlug = title.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 24);
  const uid = `${uidSlug}-${startFormatted}@ucodeqr.in`;
  const dtstamp = "20261016T000000Z";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "PRODID:-//UCode//UCode QR Platform//EN",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${escapeICalText(title)}`,
  ];

  if (data.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${startFormatted}`);
    if (data.endDate) {
      const endFormatted = formatICalDate(data.endDate, true);
      if (endFormatted) lines.push(`DTEND;VALUE=DATE:${endFormatted}`);
    }
  } else {
    lines.push(`DTSTART:${startFormatted}`);
    if (data.endDate) {
      const endFormatted = formatICalDate(data.endDate, false);
      if (endFormatted) lines.push(`DTEND:${endFormatted}`);
    }
  }

  if (data.location?.trim()) {
    lines.push(`LOCATION:${escapeICalText(data.location.trim())}`);
  }
  if (data.description?.trim()) {
    lines.push(`DESCRIPTION:${escapeICalText(data.description.trim())}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\n");
}

/**
 * Unified encoder routing to the correct generator based on QRType.
 */
export function encodeQRPayload<T extends QRType>(
  type: T,
  formData: QRFormDataMap[T]
): string {
  switch (type) {
    case "url":
      return encodeURL(formData as URLFormData);
    case "text":
      return encodeText(formData as TextFormData);
    case "wifi":
      return encodeWifi(formData as WifiFormData);
    case "whatsapp":
      return encodeWhatsApp(formData as WhatsAppFormData);
    case "vcard":
      return encodeVCard(formData as VCardFormData);
    case "email":
      return encodeEmail(formData as EmailFormData);
    case "phone":
      return encodePhone(formData as PhoneFormData);
    case "sms":
      return encodeSMS(formData as SMSFormData);
    case "geo":
      return encodeGeo(formData as GeoFormData);
    case "event":
      return encodeEvent(formData as EventFormData);
    default:
      return "";
  }
}
