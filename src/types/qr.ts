export type QRType =
  | "url"
  | "text"
  | "wifi"
  | "whatsapp"
  | "vcard"
  | "email"
  | "phone"
  | "sms"
  | "geo"
  | "event";

export interface URLFormData {
  url: string;
}

export interface TextFormData {
  text: string;
}

export type WifiEncryption = "WPA" | "WEP" | "nopass";

export interface WifiFormData {
  ssid: string;
  password?: string;
  encryption: WifiEncryption;
  hidden?: boolean;
}

export interface WhatsAppFormData {
  phone: string;
  message?: string;
}

export interface VCardFormData {
  firstName: string;
  lastName?: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
  address?: string;
  note?: string;
}

export interface EmailFormData {
  email: string;
  subject?: string;
  body?: string;
}

export interface PhoneFormData {
  phone: string;
}

export interface SMSFormData {
  phone: string;
  message?: string;
}

export interface GeoFormData {
  latitude: string;
  longitude?: string;
  query?: string;
}

export interface EventFormData {
  title: string;
  location?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
}

export type QRFormDataMap = {
  url: URLFormData;
  text: TextFormData;
  wifi: WifiFormData;
  whatsapp: WhatsAppFormData;
  vcard: VCardFormData;
  email: EmailFormData;
  phone: PhoneFormData;
  sms: SMSFormData;
  geo: GeoFormData;
  event: EventFormData;
};

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QRCustomizationOptions {
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  size: number;
  logo: string | null;
  logoSize: number; // percentage 10 - 28
  logoPadding?: number; // internal padding percentage (6 - 24)
  logoRadius?: number; // corner radius percentage (0 = sharp, 20 = rounded, 50 = circle)
}

export interface ColorPreset {
  id: string;
  name: string;
  fgColor: string;
  bgColor: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ScannabilityReport {
  score: number; // 0 - 100
  contrastRatio: number;
  contrastGrade: "excellent" | "acceptable" | "poor";
  quietZoneSafe: boolean;
  logoSafe: boolean;
  recommendations: string[];
}
