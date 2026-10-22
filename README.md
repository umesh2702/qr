# UCode — The Free, Privacy-First QR Platform

> **"Create. Customize. Scan. Done."**  
> Engineered by **UCreates**, a digital solutions studio.

UCode is a fast, privacy-first, client-side QR code generator and practical QR toolkit. It generates permanent, high-resolution static QR codes directly in the browser—with zero registration, zero subscription paywalls, no trial expiration dates, and no data harvesting.

---

## Key Features

1. **Unified Single-Screen Generator**:
   - 10 supported QR types through one cohesive interface:
     - **Website URL**: Direct protocol normalization without third-party redirect middlemen.
     - **Wi-Fi Network**: Standard ZXing `WIFI:` format with automatic character escaping and hidden network flag.
     - **vCard 3.0 Contact**: Digital business card pre-populating smartphone address books.
     - **WhatsApp**: Direct chat links with optional prefilled text.
     - **Plain Text**: Raw alphanumeric strings, notes, and serial numbers.
     - **Email Link**: Mailto URI with recipient, subject, and body.
     - **Phone Call**: Direct tel URI for mobile dialers.
     - **SMS**: Direct SMS link with prefilled message.
     - **Geographic Location**: Universal Google Maps navigation link.
     - **Calendar Event**: iCalendar RFC 5545 `VEVENT` invitation.

2. **100% In-Browser Privacy**:
   - All QR matrix generation runs client-side using HTML5 Canvas and SVG.
   - Wi-Fi credentials, contact names, and URLs never touch remote servers.
   - No tracking or storing of sensitive payloads in application logs.

3. **Built-in Scannability Diagnostics & Print Sizing Math**:
   - **Automated Decoder Test**: Round-trips canvas pixel data through `jsqr` to verify 100% optical readability.
   - **WCAG Contrast Ratio Calculation**: Warns if foreground/background contrast drops below safe thresholds.
   - **Quiet Zone Verification**: Validates module margin against ISO/IEC 18004 standards.
   - **Optical Print Size Calculator**: Applies the $10:1$ scanning distance-to-size formula.

4. **Professional Prepress & Digital Downloads**:
   - Pure Vector SVG download for Adobe Illustrator, InDesign, and print shops.
   - High-Resolution PNG download selectable at 512px, 1024px, 2048px (Print), and 4096px (Ultra-HD).
   - Custom center brand logo composite with protective background quiet-zone pills.

5. **Integrated Organic SEO & UCreates Lead Growth**:
   - Semantic HTML, dynamic XML sitemap (`/sitemap.xml`), and `robots.txt`.
   - Comprehensive educational research library (`/blog`).
   - Non-intrusive, contextual agency pathways for UCreates digital solutions (`/services`).
   - Server-validated contact form with honeypot bot defense (`/contact`).

---

## Tech Stack & Architecture

- **Framework**: Next.js (App Router, React 19)
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS v4
- **QR Core**: `qrcode` (SVG string & Canvas rendering)
- **Verification**: `jsqr` (Canvas pixel decoding)
- **Testing**: `vitest` unit test suite
- **Icons**: `lucide-react`

---

## Local Development Setup

### 1. Prerequisites
- Node.js v20+ or v22+
- npm v10+

### 2. Installation
```bash
# Clone or navigate to the project directory
cd qr

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Automated Testing & Verification

Execute the complete Vitest unit test suite covering all 10 encoders, international characters, contrast ratios, and validation logic:

```bash
npm test
```

Run TypeScript compilation and production build validation:

```bash
npm run build
```

---

## Deployment Instructions

### Vercel (Recommended)
1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the project into [Vercel](https://vercel.com).
3. Set environment variables from `.env.example` if analytics or lead forwarding are desired.
4. Deploy with standard Next.js presets.

### Docker / Standalone Node.js
1. Set `output: "standalone"` in `next.config.ts` if containerizing.
2. Run `npm run build`.
3. Start the production server with `npm start` on port 3000.

---

## Production Readiness Checklist

- [x] 10 QR Types supported in unified workspace
- [x] Client-side SVG & Canvas generation verified
- [x] Round-trip scan decoding tested with `jsqr`
- [x] 25 automated unit tests passing in Vitest
- [x] Dynamic XML Sitemap & robots.txt generated
- [x] Contact API route server-validated with honeypot spam protection
- [x] Display advertising pre-reserved and disabled by default
- [x] Privacy policy explicitly disclosing zero payload retention
- [x] Next.js production build passing with zero errors

---

## License

Created by **UCreates**. Generated static QR codes are 100% free for unrestricted personal and commercial use.
