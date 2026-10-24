import path from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";

async function generateOgImage() {
  const qrSvgString = await QRCode.toString("https://ucodeqr.in", {
    type: "svg",
    margin: 1,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });

  // Extract inner svg content or strip xml header
  const cleanQrSvg = qrSvgString.replace(/<\?xml.*?\?>/i, "").trim();

  const svgBanner = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="24" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect x="0" y="0" width="1200" height="630" fill="none" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Left Column: Branding & Features -->
  <g transform="translate(80, 80)">
    <!-- Brand Badge -->
    <g transform="translate(0, 0)">
      <rect width="130" height="34" rx="17" fill="#e0e7ff" />
      <text x="65" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#4338ca" text-anchor="middle" letter-spacing="0.05em">UCREATES</text>
    </g>

    <!-- Main Title -->
    <text x="0" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="58" font-weight="800" fill="#0f172a" letter-spacing="-0.02em">
      UCode
    </text>

    <!-- Subtitle -->
    <text x="0" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="600" fill="#334155" letter-spacing="-0.01em">
      Free, Privacy-First QR Code Generator
    </text>

    <!-- Description -->
    <text x="0" y="205" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#64748b" line-height="28">
      Permanent static codes generated client-side directly in your browser.
    </text>
    <text x="0" y="235" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#64748b">
      No signups, no expiring trial links, and zero watermarks.
    </text>

    <!-- Feature Pills -->
    <g transform="translate(0, 280)">
      <!-- Pill 1 -->
      <g transform="translate(0, 0)">
        <rect width="195" height="42" rx="10" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <text x="97" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#1e293b" text-anchor="middle">✓ Vector SVG Export</text>
      </g>
      <!-- Pill 2 -->
      <g transform="translate(210, 0)">
        <rect width="205" height="42" rx="10" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <text x="102" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#1e293b" text-anchor="middle">✓ 4096px Ultra-HD PNG</text>
      </g>
      <!-- Pill 3 -->
      <g transform="translate(430, 0)">
        <rect width="190" height="42" rx="10" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <text x="95" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#1e293b" text-anchor="middle">✓ 10 Standard Types</text>
      </g>
    </g>

    <!-- Canonical Domain Badge -->
    <g transform="translate(0, 390)">
      <rect width="250" height="44" rx="10" fill="url(#accentGrad)" />
      <text x="125" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="0.02em">
        https://ucodeqr.in
      </text>
    </g>
  </g>

  <!-- Right Column: Card Preview with Live QR Code -->
  <g transform="translate(770, 95)" filter="url(#cardShadow)">
    <rect width="350" height="440" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    
    <!-- Top Pill -->
    <g transform="translate(30, 28)">
      <rect width="130" height="26" rx="13" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="65" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">LIVE PREVIEW</text>
    </g>

    <!-- QR Code Box -->
    <g transform="translate(35, 75)">
      <rect width="280" height="280" rx="16" fill="#f8fafc" stroke="#f1f5f9" stroke-width="1"/>
      <g transform="translate(20, 20)">
        <svg width="240" height="240" viewBox="0 0 240 240">
          ${cleanQrSvg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "")}
        </svg>
      </g>
    </g>

    <!-- Bottom Caption -->
    <text x="175" y="395" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#0f172a" text-anchor="middle">
      Scan to open ucodeqr.in
    </text>
    <text x="175" y="415" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="400" fill="#64748b" text-anchor="middle">
      100% In-Browser &amp; Zero Paywall
    </text>
  </g>
</svg>
  `.trim();

  const outPath = path.resolve(process.cwd(), "public/og-image.png");
  await sharp(Buffer.from(svgBanner))
    .png({ quality: 95 })
    .toFile(outPath);

  console.log("Successfully generated OG image:", outPath);
}

generateOgImage().catch(console.error);
