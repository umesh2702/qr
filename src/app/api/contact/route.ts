import { NextRequest, NextResponse } from "next/server";

interface ContactRequestBody {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  serviceType?: string;
  timeline?: string;
  budget?: string;
  message?: string;
  honeypot?: string; // Hidden spam bot trap
}

// In-memory sliding-window rate limiter per client IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, recent);
    return false;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);

  // Periodic pruning of stale IPs to prevent memory leaks
  if (rateLimitMap.size > 1000) {
    for (const [key, times] of rateLimitMap.entries()) {
      const valid = times.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (valid.length === 0) rateLimitMap.delete(key);
      else rateLimitMap.set(key, valid);
    }
  }

  return true;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

function sanitizeString(str: string): string {
  return str
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  try {
    // 1. Guard against oversized request bodies (max 64KB)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 64 * 1024) {
      return NextResponse.json(
        { success: false, message: "Request payload exceeds maximum allowed size (64KB)." },
        { status: 413 }
      );
    }

    // 2. IP Rate limiting
    const clientIp = getClientIp(req);
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many submissions from this connection. Please wait 15 minutes before submitting again.",
        },
        { status: 429 }
      );
    }

    const body: ContactRequestBody = await req.json();

    // 3. Honeypot check: If the hidden honeypot field is filled, reject spam silently
    if (body.honeypot && body.honeypot.trim() !== "") {
      return NextResponse.json(
        { success: false, message: "Spam submission rejected." },
        { status: 400 }
      );
    }

    // 4. Server-side validation with field bounds & sanitization
    const rawName = body.name ? sanitizeString(body.name) : "";
    const rawEmail = body.email ? sanitizeString(body.email) : "";
    const rawMessage = body.message ? sanitizeString(body.message) : "";
    const rawPhone = body.phone ? sanitizeString(body.phone) : "";
    const rawCompany = body.company ? sanitizeString(body.company) : "";
    const rawService = body.serviceType ? sanitizeString(body.serviceType) : "General Inquiry";
    const rawTimeline = body.timeline ? sanitizeString(body.timeline) : "Flexible";
    const rawBudget = body.budget ? sanitizeString(body.budget) : "Not specified";

    const errors: Record<string, string> = {};

    if (!rawName || rawName.length < 2) {
      errors.name = "Full name is required (minimum 2 characters).";
    } else if (rawName.length > 100) {
      errors.name = "Full name must be under 100 characters.";
    }

    if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      errors.email = "A valid business email address is required.";
    } else if (rawEmail.length > 150) {
      errors.email = "Email address must be under 150 characters.";
    }

    if (rawPhone && rawPhone.length > 50) {
      errors.phone = "Phone number must be under 50 characters.";
    }

    if (rawCompany && rawCompany.length > 100) {
      errors.company = "Company name must be under 100 characters.";
    }

    if (!rawMessage || rawMessage.length < 10) {
      errors.message = "Please describe your project or requirements in at least 10 characters.";
    } else if (rawMessage.length > 5000) {
      errors.message = "Project message must be under 5,000 characters.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors, message: "Please correct the highlighted fields." },
        { status: 400 }
      );
    }

    // 5. Verify external destination configuration
    const webhookUrl = process.env.LEAD_WEBHOOK_URL?.trim();
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const leadEmailRecipient = (process.env.LEAD_NOTIFICATION_EMAIL || "hello@ucreates.io").trim();
    const resendFromEmail = (process.env.RESEND_FROM_EMAIL || "UCode Leads <onboarding@resend.dev>").trim();

    // Strictly ensure success is NEVER reported if no delivery provider is configured
    if (!webhookUrl && !resendApiKey) {
      console.warn(
        `[UCreates Lead Gateway] Received enquiry from ${rawName} (${rawEmail}), but neither LEAD_WEBHOOK_URL nor RESEND_API_KEY is configured in this environment.`
      );
      return NextResponse.json(
        {
          success: false,
          notConfigured: true,
          message:
            "The lead gateway has no active external email or webhook destination configured in this deployment. To discuss your project directly with our team, please email hello@ucreates.io.",
        },
        { status: 503 }
      );
    }

    let externalDispatched = false;
    let providerErrorDetails = "";

    // Dispatch via Webhook (Slack, Discord, Zapier, Make, CRM)
    if (webhookUrl) {
      try {
        const webhookRes = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "UCode Lead Gateway",
            lead: {
              name: rawName,
              email: rawEmail,
              phone: rawPhone || "Not provided",
              company: rawCompany || "Not specified",
              serviceType: rawService,
              timeline: rawTimeline,
              budget: rawBudget,
              message: rawMessage,
              receivedAt: new Date().toISOString(),
              ip: clientIp,
            },
          }),
        });
        if (webhookRes.ok) {
          externalDispatched = true;
          console.log("[Contact API] Lead webhook successfully delivered.");
        } else {
          const errText = await webhookRes.text().catch(() => "");
          console.error(`[Contact API] Webhook delivery failed (HTTP ${webhookRes.status}):`, errText);
          providerErrorDetails = `Webhook returned HTTP ${webhookRes.status}`;
        }
      } catch (webhookErr: unknown) {
        const msg = webhookErr instanceof Error ? webhookErr.message : String(webhookErr);
        console.error("[Contact API] Webhook fetch error:", msg);
        providerErrorDetails = `Webhook fetch error: ${msg}`;
      }
    }

    // Dispatch via Resend Email API
    if (resendApiKey) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: resendFromEmail,
            to: [leadEmailRecipient],
            reply_to: rawEmail,
            subject: `[New UCode Lead] ${rawService} from ${rawName}`,
            text: `New Lead Inquiry from UCode\n\nName: ${rawName}\nEmail: ${rawEmail}\nPhone: ${rawPhone || "Not provided"}\nCompany: ${rawCompany || "Not specified"}\nService: ${rawService}\nBudget: ${rawBudget}\nTimeline: ${rawTimeline}\n\nMessage:\n${rawMessage}\n\nSubmitted at: ${new Date().toISOString()}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; border-bottom: 2px solid #4f46e5; padding-bottom: 8px;">New UCode / UCreates Lead Inquiry</h2>
                <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
                  <tr><td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Name:</strong></td><td style="padding: 8px 0; color: #0f172a;">${escapeHtml(rawName)}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td><td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${escapeHtml(rawEmail)}" style="color: #4f46e5;">${escapeHtml(rawEmail)}</a></td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td><td style="padding: 8px 0; color: #0f172a;">${escapeHtml(rawPhone || "Not provided")}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;"><strong>Company:</strong></td><td style="padding: 8px 0; color: #0f172a;">${escapeHtml(rawCompany || "Not specified")}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;"><strong>Service Need:</strong></td><td style="padding: 8px 0; color: #0f172a;">${escapeHtml(rawService)}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;"><strong>Target Budget:</strong></td><td style="padding: 8px 0; color: #0f172a;">${escapeHtml(rawBudget)}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;"><strong>Timeline:</strong></td><td style="padding: 8px 0; color: #0f172a;">${escapeHtml(rawTimeline)}</td></tr>
                </table>
                <div style="margin-top: 20px; padding: 16px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 14px; color: #334155;">Project Description:</h3>
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0f172a; white-space: pre-wrap;">${escapeHtml(rawMessage)}</p>
                </div>
                <p style="margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center;">Transmitted securely via UCode Lead Gateway &bull; Direct Reply-To: ${escapeHtml(rawEmail)}</p>
              </div>
            `,
          }),
        });

        if (emailRes.ok) {
          externalDispatched = true;
          console.log(`[Contact API] Resend email successfully delivered to ${leadEmailRecipient}`);
        } else {
          const errData = await emailRes.json().catch(() => ({}));
          console.error(`[Contact API] Resend delivery failed (HTTP ${emailRes.status}):`, JSON.stringify(errData));
          providerErrorDetails = `Resend HTTP ${emailRes.status}: ${errData?.message || "Delivery rejected"}`;
        }
      } catch (emailErr: unknown) {
        const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
        console.error("[Contact API] Resend fetch exception:", msg);
        providerErrorDetails = `Resend network error: ${msg}`;
      }
    }

    if (!externalDispatched) {
      return NextResponse.json(
        {
          success: false,
          message: `Enquiry could not be delivered to the notification service (${providerErrorDetails || "delivery failed"}). Please reach out directly to hello@ucreates.io.`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you! Your enquiry has been received. A senior member of the UCreates team will review your requirements and respond within one business day.",
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[Contact API] Unexpected error:", err);
    return NextResponse.json(
      { success: false, message: "An unexpected server error occurred. Please try again or email us directly at hello@ucreates.io." },
      { status: 500 }
    );
  }
}
