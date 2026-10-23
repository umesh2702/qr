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

export type QRModuleShape =
  | "square"
  | "rounded-square"
  | "bubble"
  | "soft-pixel"
  | "diamond";

export type QRPatternStyle =
  | "classic-grid"
  | "dotted-matrix"
  | "soft-grid"
  | "connected-flow"
  | "dense-geometric";

export type QRFinderStyle =
  | "square"
  | "rounded"
  | "circular";

export interface QRCustomizationOptions {
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  size: number;
  // Style Studio
  moduleShape?: QRModuleShape;
  patternStyle?: QRPatternStyle;
  finderStyle?: QRFinderStyle;
  // Logo and Branding
  logo: string | null;
  logoSize: number; // percentage 10 - 28
  logoPadding?: number; // internal padding percentage (6 - 24)
  logoRadius?: number; // corner radius percentage (0 = sharp, 20 = rounded, 50 = circle)
  logoMode?: boolean; // toggle center-logo mode
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  moduleShape: QRModuleShape;
  patternStyle: QRPatternStyle;
  finderStyle: QRFinderStyle;
  fgColor: string;
  bgColor: string;
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
  score: number; // Optical / geometric quality score (0 - 100)
  contrastRatio: number;
  contrastGrade: "excellent" | "acceptable" | "poor";
  quietZoneSafe: boolean;
  logoSafe: boolean;
  logoWarning?: string | null;
  styleWarning?: string | null;
  decoderVerified?: boolean;
  recommendations: string[];
}
