import QRCode from "qrcode";
import jsQR from "jsqr";
import { QRCustomizationOptions } from "@/types/qr";

export interface GenerateCanvasOptions extends QRCustomizationOptions {
  renderSize?: number;
}

/**
 * Draws QR code onto an HTML5 Canvas element with optional center logo.
 */
export async function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  payload: string,
  options: GenerateCanvasOptions
): Promise<void> {
  const size = options.renderSize || options.size || 512;
  canvas.width = size;
  canvas.height = size;

  // Render base QR code onto canvas
  await QRCode.toCanvas(canvas, payload, {
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin,
    width: size,
    color: {
      dark: options.fgColor,
      light: options.bgColor,
    },
  });

  // If a logo is specified, render the logo at center with a protective background
  if (options.logo) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const img = await loadImage(options.logo);
      const logoPercent = (options.logoSize || 22) / 100;
      const logoSize = Math.round(size * logoPercent);
      const logoPadding = Math.round(logoSize * 0.12);
      const totalBoxSize = logoSize + logoPadding * 2;
      const x = Math.round((size - totalBoxSize) / 2);
      const y = Math.round((size - totalBoxSize) / 2);

      // Draw background pill/square in background color to protect quiet zone around logo
      ctx.save();
      ctx.fillStyle = options.bgColor;
      ctx.shadowColor = "rgba(0,0,0,0.15)";
      ctx.shadowBlur = Math.round(size * 0.015);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = Math.round(size * 0.005);

      const borderRadius = Math.round(totalBoxSize * 0.2);
      drawRoundedRect(ctx, x, y, totalBoxSize, totalBoxSize, borderRadius);
      ctx.fill();
      ctx.restore();

      // Draw border around the logo cutout
      ctx.save();
      ctx.strokeStyle = options.fgColor;
      ctx.lineWidth = Math.max(1, Math.round(size * 0.003));
      ctx.globalAlpha = 0.2;
      drawRoundedRect(ctx, x, y, totalBoxSize, totalBoxSize, borderRadius);
      ctx.stroke();
      ctx.restore();

      // Clip and draw image
      ctx.save();
      const imgX = x + logoPadding;
      const imgY = y + logoPadding;
      const imgBorderRadius = Math.round(logoSize * 0.16);
      drawRoundedRect(ctx, imgX, imgY, logoSize, logoSize, imgBorderRadius);
      ctx.clip();
      ctx.drawImage(img, imgX, imgY, logoSize, logoSize);
      ctx.restore();
    } catch (err) {
      console.warn("Failed to composite logo onto QR canvas:", err);
    }
  }
}

/**
 * Generates an SVG string representation of the QR code.
 */
export async function generateQRSVG(
  payload: string,
  options: QRCustomizationOptions
): Promise<string> {
  const svgString = await QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin,
    width: options.size || 512,
    color: {
      dark: options.fgColor,
      light: options.bgColor,
    },
  });

  // If logo is present, insert an SVG image tag into the center
  if (options.logo) {
    const size = options.size || 512;
    const logoPercent = (options.logoSize || 22) / 100;
    const logoSize = Math.round(size * logoPercent);
    const logoPadding = Math.round(logoSize * 0.12);
    const totalBox = logoSize + logoPadding * 2;
    const x = Math.round((size - totalBox) / 2);
    const y = Math.round((size - totalBox) / 2);
    const rx = Math.round(totalBox * 0.2);

    // Escape any quotes in the logo attribute for XML validity
    const safeLogoAttr = options.logo.replace(/"/g, "&quot;");

    const logoSvgElements = `
      <g id="ucode-center-logo">
        <rect x="${x}" y="${y}" width="${totalBox}" height="${totalBox}" rx="${rx}" fill="${options.bgColor}" stroke="${options.fgColor}" stroke-opacity="0.2" stroke-width="1.5" />
        <image x="${x + logoPadding}" y="${y + logoPadding}" width="${logoSize}" height="${logoSize}" href="${safeLogoAttr}" xlink:href="${safeLogoAttr}" preserveAspectRatio="xMidYMid slice" />
      </g>
    </svg>`;

    let resultSvg = svgString.replace("</svg>", logoSvgElements);
    if (!resultSvg.includes("xmlns:xlink=")) {
      resultSvg = resultSvg.replace(
        "<svg ",
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink" '
      );
    }
    return resultSvg;
  }

  return svgString;
}

/**
 * Decodes QR code from canvas pixel data using jsQR to verify 100% scannability.
 */
export function verifyCanvasScan(
  canvas: HTMLCanvasElement
): { success: boolean; decodedPayload: string | null; error?: string } {
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) return { success: false, decodedPayload: null, error: "Canvas context unavailable" };

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    if (code && code.data) {
      return { success: true, decodedPayload: code.data };
    }
    return { success: false, decodedPayload: null, error: "No QR code detected" };
  } catch (err: unknown) {
    return {
      success: false,
      decodedPayload: null,
      error: err instanceof Error ? err.message : "Decoding error",
    };
  }
}

/**
 * Generates high-res PNG export using an off-screen canvas.
 */
export async function exportHighResPNG(
  payload: string,
  options: QRCustomizationOptions,
  targetWidth: number
): Promise<string> {
  const offscreen = document.createElement("canvas");
  await renderQRToCanvas(offscreen, payload, {
    ...options,
    renderSize: targetWidth,
  });
  return offscreen.toDataURL("image/png");
}

/**
 * Triggers browser download for a DataURL.
 */
export function triggerDataURLDownload(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers browser download for an SVG text string.
 */
export function triggerSVGDownload(svgContent: string, filename: string): void {
  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Helper to load an image safely into an HTMLImageElement.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Helper to draw rounded rectangle path in 2D context.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
