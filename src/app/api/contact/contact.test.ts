import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import {
  DEFAULT_RESEND_FROM,
  DEFAULT_LEAD_RECIPIENT,
  resolveResendSender,
  resolveLeadRecipient,
  maskEmail,
  buildResendEmailPayload,
  POST,
  LeadSubmission,
} from "./route";

describe("Contact API - Sender & Recipient Configuration", () => {
  describe("resolveResendSender", () => {
    it("defaults to verified domain sender when env var is undefined", () => {
      const res = resolveResendSender(undefined);
      expect(res.sender).toBe(DEFAULT_RESEND_FROM);
      expect(res.sender).toBe("UCode Leads <leads@ucodeqr.in>");
      expect(res.isSandboxFallback).toBe(false);
      expect(res.warning).toBeUndefined();
    });

    it("defaults to verified domain sender when env var is empty or whitespace", () => {
      const res = resolveResendSender("   ");
      expect(res.sender).toBe("UCode Leads <leads@ucodeqr.in>");
      expect(res.isSandboxFallback).toBe(false);
    });

    it("intercepts stale onboarding@resend.dev and upgrades to verified domain sender", () => {
      const res = resolveResendSender("UCode Leads <onboarding@resend.dev>");
      expect(res.sender).toBe("UCode Leads <leads@ucodeqr.in>");
      expect(res.isSandboxFallback).toBe(true);
      expect(res.warning).toContain("resend.dev");
      expect(res.warning).toContain("HTTP 403");
    });

    it("intercepts raw onboarding@resend.dev without display name", () => {
      const res = resolveResendSender("onboarding@resend.dev");
      expect(res.sender).toBe("UCode Leads <leads@ucodeqr.in>");
      expect(res.isSandboxFallback).toBe(true);
    });

    it("preserves explicit verified domain sender", () => {
      const res = resolveResendSender("UCode Inquiries <leads@ucodeqr.in>");
      expect(res.sender).toBe("UCode Inquiries <leads@ucodeqr.in>");
      expect(res.isSandboxFallback).toBe(false);
      expect(res.warning).toBeUndefined();
    });

    it("preserves custom sender on verified domain without display name", () => {
      const res = resolveResendSender("contact@ucodeqr.in");
      expect(res.sender).toBe("contact@ucodeqr.in");
      expect(res.isSandboxFallback).toBe(false);
    });
  });

  describe("resolveLeadRecipient", () => {
    it("returns configured LEAD_NOTIFICATION_EMAIL", () => {
      const recipient = resolveLeadRecipient("umeshmedisetty@gmail.com");
      expect(recipient).toBe("umeshmedisetty@gmail.com");
    });

    it("trims whitespace from LEAD_NOTIFICATION_EMAIL", () => {
      const recipient = resolveLeadRecipient("  leads@ucodeqr.in  ");
      expect(recipient).toBe("leads@ucodeqr.in");
    });

    it("falls back to default recipient if env var is empty or undefined", () => {
      expect(resolveLeadRecipient(undefined)).toBe(DEFAULT_LEAD_RECIPIENT);
      expect(resolveLeadRecipient("")).toBe(DEFAULT_LEAD_RECIPIENT);
      expect(resolveLeadRecipient(DEFAULT_LEAD_RECIPIENT)).toBe("umesh@ucreates.online");
    });
  });

  describe("maskEmail (Safe Diagnostic Logging)", () => {
    it("safely masks email address without leaking username PII", () => {
      expect(maskEmail("visitor@example.com")).toBe("vi***@example.com");
      expect(maskEmail("admin@ucodeqr.in")).toBe("ad***@ucodeqr.in");
    });

    it("handles short or malformed email strings gracefully", () => {
      expect(maskEmail("a@b.com")).toBe("a***@b.com");
      expect(maskEmail("invalid-email")).toBe("***@***");
    });
  });

  describe("buildResendEmailPayload", () => {
    const lead: LeadSubmission = {
      name: "Jane Doe",
      email: "jane@company.com",
      phone: "+1-555-0199",
      company: "Acme Corp",
      serviceType: "Web Application Development",
      timeline: "1–2 Months",
      budget: "$5,000 – $10,000",
      message: "We need a custom QR portal with API integration.",
    };

    it("correctly maps from, to, and reply_to with no cc or bcc", () => {
      const payload = buildResendEmailPayload({
        from: "UCode Leads <leads@ucodeqr.in>",
        to: "leads@ucodeqr.in",
        replyTo: lead.email,
        lead,
      });

      // Sender MUST be on verified domain
      expect(payload.from).toBe("UCode Leads <leads@ucodeqr.in>");

      // Recipient MUST be wrapped in array as LEAD_NOTIFICATION_EMAIL
      expect(payload.to).toEqual(["leads@ucodeqr.in"]);

      // Reply-To MUST be the visitor's email, NOT the verified sender
      expect(payload.reply_to).toBe("jane@company.com");

      // Verify no cc or bcc recipients are accidentally injected
      expect((payload as Record<string, unknown>).cc).toBeUndefined();
      expect((payload as Record<string, unknown>).bcc).toBeUndefined();

      // Subject line
      expect(payload.subject).toBe("[New UCode Lead] Web Application Development from Jane Doe");

      // Body contains lead content
      expect(payload.text).toContain("Jane Doe");
      expect(payload.text).toContain("jane@company.com");
      expect(payload.text).toContain("Acme Corp");
      expect(payload.html).toContain("Jane Doe");
      expect(payload.html).toContain("mailto:jane@company.com");
    });

    it("escapes HTML in visitor input to prevent injection in email body", () => {
      const maliciousLead: LeadSubmission = {
        name: "<script>alert('xss')</script>",
        email: "attacker@test.com",
        serviceType: "Security Audit",
        timeline: "Immediate",
        budget: "N/A",
        message: "Hello <img src=x onerror=alert(1)> & test 'quotes'",
      };

      const payload = buildResendEmailPayload({
        from: "UCode Leads <leads@ucodeqr.in>",
        to: "leads@ucodeqr.in",
        replyTo: maliciousLead.email,
        lead: maliciousLead,
      });

      expect(payload.html).not.toContain("<script>");
      expect(payload.html).toContain("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
      expect(payload.html).toContain("&amp; test &#039;quotes&#039;");
    });
  });
});

describe("Contact API Route Handler (POST)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns 503 if neither RESEND_API_KEY nor LEAD_WEBHOOK_URL is configured", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.LEAD_WEBHOOK_URL;

    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        message: "This is a valid test message with sufficient length.",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.notConfigured).toBe(true);
  });

  it("returns 400 when form validation fails (e.g., empty name)", async () => {
    process.env.RESEND_API_KEY = "re_test_dummy_key";

    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "",
        email: "test@example.com",
        message: "Valid test message for validation test.",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.errors.name).toBeDefined();
  });

  it("silently rejects spam when honeypot trap field is filled", async () => {
    process.env.RESEND_API_KEY = "re_test_dummy_key";

    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Spam Bot",
        email: "spambot@example.com",
        message: "Buy cheap products now with this spam message.",
        honeypot: "I am a malicious bot filling hidden fields",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe("Spam submission rejected.");
  });

  it("dispatches successfully via Resend when provider returns 200 OK", async () => {
    process.env.RESEND_API_KEY = "re_test_dummy_key";
    process.env.RESEND_FROM_EMAIL = "UCode Leads <leads@ucodeqr.in>";
    process.env.LEAD_NOTIFICATION_EMAIL = "leads@ucodeqr.in";

    let interceptedBody: Record<string, unknown> | null = null;
    let interceptedHeaders: Headers | null = null;

    global.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (url === "https://api.resend.com/emails") {
        interceptedBody = JSON.parse(init?.body as string);
        interceptedHeaders = new Headers(init?.headers);
        return new Response(JSON.stringify({ id: "resend_msg_test123" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("Not Found", { status: 404 });
    });

    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alex Smith",
        email: "alex@company.com",
        serviceType: "QR Design System",
        message: "We need custom styled QR codes for packaging.",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    // Validate that Resend received verified sender and visitor reply-to
    const sentBody = interceptedBody as { from?: string; to?: string[]; reply_to?: string } | null;
    const sentHeaders = interceptedHeaders as Headers | null;
    expect(sentBody?.from).toBe("UCode Leads <leads@ucodeqr.in>");
    expect(sentBody?.to).toEqual(["leads@ucodeqr.in"]);
    expect(sentBody?.reply_to).toBe("alex@company.com");
    expect(sentHeaders?.get("Authorization")).toBe("Bearer re_test_dummy_key");
  });

  it("handles Resend HTTP 403 provider error gracefully without crashing", async () => {
    process.env.RESEND_API_KEY = "re_test_dummy_key";

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url === "https://api.resend.com/emails") {
        return new Response(
          JSON.stringify({
            statusCode: 403,
            message:
              "You can only send testing emails to your own email address. To send emails to other recipients, please verify a domain and change the from address to an email using this domain.",
            name: "validation_error",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      return new Response("Not Found", { status: 404 });
    });

    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alex Smith",
        email: "alex@company.com",
        message: "We need custom styled QR codes for packaging.",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain("Resend HTTP 403");
    expect(data.message).toContain("umesh@ucreates.online");
  });
});
