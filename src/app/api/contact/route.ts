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

    const body: ContactRequestBody = await req.json();

    // 2. Honeypot check: If the hidden honeypot field is filled, silently reject
    if (body.honeypot && body.honeypot.trim() !== "") {
      return NextResponse.json(
        { success: false, message: "Spam submission rejected." },
        { status: 400 }
      );
    }

    // 3. Server-side validation with field length bounds
    const errors: Record<string, string> = {};

    if (!body.name || body.name.trim().length < 2) {
      errors.name = "Full name is required (minimum 2 characters).";
    } else if (body.name.trim().length > 100) {
      errors.name = "Full name must be under 100 characters.";
    }

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      errors.email = "A valid business email address is required.";
    } else if (body.email.trim().length > 150) {
      errors.email = "Email address must be under 150 characters.";
    }

    if (body.phone && body.phone.trim().length > 50) {
      errors.phone = "Phone number must be under 50 characters.";
    }

    if (body.company && body.company.trim().length > 100) {
      errors.company = "Company name must be under 100 characters.";
    }

    if (!body.message || body.message.trim().length < 10) {
      errors.message = "Please describe your project or requirements in at least 10 characters.";
    } else if (body.message.trim().length > 5000) {
      errors.message = "Project message must be under 5,000 characters.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors, message: "Please correct the highlighted fields." },
        { status: 400 }
      );
    }

    const name = body.name!.trim();
    const email = body.email!.trim();
    const message = body.message!.trim();

    // 4. Verify external destination configuration
    const webhookUrl = process.env.LEAD_WEBHOOK_URL;
    const resendApiKey = process.env.RESEND_API_KEY;
    const leadEmailRecipient = process.env.LEAD_NOTIFICATION_EMAIL || "hello@ucreates.io";

    // Strictly ensure success is NEVER reported if no delivery provider is configured
    if (!webhookUrl && !resendApiKey) {
      console.warn(
        `[UCreates Lead Gateway] Received enquiry from ${name} (${email}), but neither LEAD_WEBHOOK_URL nor RESEND_API_KEY is configured.`
      );
      return NextResponse.json(
        {
          success: false,
          notConfigured: true,
          message:
            "The lead gateway has no active external email or webhook destination configured in this environment. To discuss your project directly with our team, please email hello@ucreates.io.",
        },
        { status: 503 }
      );
    }

    let externalDispatched = false;

    // Dispatch via Webhook
    if (webhookUrl) {
      try {
        const webhookRes = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "UCode Lead Gateway",
            lead: {
              name,
              email,
              phone: body.phone?.trim() || "Not provided",
              company: body.company?.trim() || "Not specified",
              serviceType: body.serviceType || "General Web Inquiry",
              timeline: body.timeline || "Not specified",
              budget: body.budget || "Not specified",
              message,
              receivedAt: new Date().toISOString(),
            },
          }),
        });
        if (webhookRes.ok) {
          externalDispatched = true;
        }
      } catch (webhookErr) {
        console.error("Lead webhook delivery failed:", webhookErr);
      }
    }

    // Dispatch via Resend
    if (resendApiKey) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "UCode Leads <leads@ucreates.io>",
            to: [leadEmailRecipient],
            subject: `[New UCreates Lead] ${body.serviceType || "Project Inquiry"} from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${body.phone || "N/A"}\nCompany: ${body.company || "N/A"}\nService: ${body.serviceType}\nBudget: ${body.budget}\nTimeline: ${body.timeline}\n\nMessage:\n${message}`,
          }),
        });
        if (emailRes.ok) {
          externalDispatched = true;
        }
      } catch (emailErr) {
        console.error("Resend delivery failed:", emailErr);
      }
    }

    if (!externalDispatched) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Enquiry could not be dispatched to external destination. Please reach out directly to hello@ucreates.io.",
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
    console.error("Contact API error:", err);
    return NextResponse.json(
      { success: false, message: "An unexpected server error occurred. Please try again or email us directly." },
      { status: 500 }
    );
  }
}
