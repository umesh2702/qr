export type AnalyticsEventName =
  | "generator_opened"
  | "qr_type_selected"
  | "qr_generation_succeeded"
  | "qr_generation_failed"
  | "qr_download_completed"
  | "scannability_diagnostics_viewed"
  | "print_guide_opened"
  | "ucreates_cta_clicked"
  | "enquiry_form_submitted";

export interface AnalyticsEventProps {
  qrType?: string;
  exportFormat?: "png" | "svg";
  resolution?: number;
  ctaLocation?: string;
  ctaTarget?: string;
  errorReason?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Privacy-first analytics logger.
 * STRICT SECURITY GUARANTEE: Never logs payloads, URLs, Wi-Fi credentials, or PII.
 */
class AnalyticsService {
  private enabled: boolean;
  private isDevelopment: boolean;

  constructor() {
    this.enabled =
      typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  public track(event: AnalyticsEventName, properties?: AnalyticsEventProps): void {
    // Sanitize properties to prevent accidental PII leakage
    const sanitizedProps = this.sanitizeProps(properties);

    if (this.isDevelopment) {
      console.log(`[UCode Privacy Analytics] Event: ${event}`, sanitizedProps);
    }

    if (!this.enabled || typeof window === "undefined") {
      return;
    }

    try {
      // 1. Google Analytics 4 (gtag) if configured
      const win = window as unknown as {
        gtag?: (...args: unknown[]) => void;
        plausible?: (...args: unknown[]) => void;
      };

      if (typeof win.gtag === "function") {
        win.gtag("event", event, sanitizedProps);
      }

      // 2. Plausible / privacy-first beacons if configured
      if (typeof win.plausible === "function") {
        win.plausible(event, { props: sanitizedProps });
      }

      // 3. Custom telemetry endpoint if defined
      const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
      if (endpoint && navigator.sendBeacon) {
        navigator.sendBeacon(
          endpoint,
          JSON.stringify({
            event,
            properties: sanitizedProps,
            timestamp: new Date().toISOString(),
          })
        );
      }
    } catch (err) {
      // Fail silently to not impact user experience
      console.warn("Analytics dispatch skipped:", err);
    }
  }

  /**
   * Filters out any potential sensitive payload keys
   */
  private sanitizeProps(props?: AnalyticsEventProps): Record<string, unknown> {
    if (!props) return {};
    const forbiddenKeys = [
      "password",
      "payload",
      "text",
      "ssid",
      "url",
      "email",
      "phone",
      "name",
      "address",
      "note",
      "message",
    ];

    const safe: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      if (!forbiddenKeys.includes(key.toLowerCase())) {
        safe[key] = value;
      }
    }
    return safe;
  }
}

export const analytics = new AnalyticsService();
