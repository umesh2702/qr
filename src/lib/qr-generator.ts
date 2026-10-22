import QRCode from "qrcode";
import jsQR from "jsqr";
import { QRCustomizationOptions } from "@/types/qr";

export interface GenerateCanvasOptions extends QRCustomizationOptions {
  renderSize?: number;
}

/**
 * Draws QR code onto an HTML5 Canvas element with pixel-perfect module alignment
 * and a protective, aspect-ratio-preserved center logo overlay.
 */
export async function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  payload: string,
  options: GenerateCanvasOptions
): Promise<void> {
  const targetSize = options.renderSize || options.size || 512;

  // 1. Calculate underlying QR matrix
  const qr = QRCode.create(payload, {
    errorCorrectionLevel: options.errorCorrectionLevel,
  });
  const moduleCount = qr.modules.size;
  const margin = Math.max(0, options.margin);
  const totalModules = moduleCount + margin * 2;

  // 2. Compute exact integer module pixel size to prevent sub-pixel blurring
  const modulePx = Math.max(1, Math.floor(targetSize / totalModules));
  const matrixSize = totalModules * modulePx;

  // Canvas dimensions set to targetSize
  canvas.width = targetSize;
  canvas.height = targetSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 3. Uniform background fill
  ctx.fillStyle = options.bgColor;
  ctx.fillRect(0, 0, targetSize, targetSize);

  // Offset to center the integer-pixel matrix precisely on the canvas
  const offset = Math.floor((targetSize - matrixSize) / 2);

  // 4. Render modules with integer alignment
  ctx.fillStyle = options.fgColor;
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (qr.modules.get(r, c)) {
        const x = offset + (margin + c) * modulePx;
        const y = offset + (margin + r) * modulePx;
        ctx.fillRect(x, y, modulePx, modulePx);
      }
    }
  }

  // 5. Composite protective center logo
  if (options.logo) {
    try {
      const img = await loadImage(options.logo);
      const logoPercent = (options.logoSize || 22) / 100;

      // Base backing size relative to matrix
      const rawBoxSize = matrixSize * logoPercent;
      const totalBoxSize = Math.max(24, Math.round(rawBoxSize));

      // Ensure backing box is centered on the canvas
      const boxX = Math.round((targetSize - totalBoxSize) / 2);
      const boxY = Math.round((targetSize - totalBoxSize) / 2);

      // Backing internal padding and corner radius
      const padPercent = (options.logoPadding ?? 12) / 100;
      const padding = Math.max(3, Math.round(totalBoxSize * padPercent));
      const radiusPercent = (options.logoRadius ?? 20) / 100;
      const borderRadius = Math.round(totalBoxSize * radiusPercent);

      // A. Protective backing plate (matches QR background)
      ctx.save();
      ctx.fillStyle = options.bgColor;
      ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
      ctx.shadowBlur = Math.round(totalBoxSize * 0.08);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = Math.max(1, Math.round(totalBoxSize * 0.02));

      drawRoundedRect(ctx, boxX, boxY, totalBoxSize, totalBoxSize, borderRadius);
      ctx.fill();
      ctx.restore();

      // B. Subtle neutral backing border
      ctx.save();
      ctx.strokeStyle = options.fgColor;
      ctx.globalAlpha = 0.12;
      ctx.lineWidth = Math.max(1, Math.round(targetSize * 0.002));
      drawRoundedRect(ctx, boxX, boxY, totalBoxSize, totalBoxSize, borderRadius);
      ctx.stroke();
      ctx.restore();

      // C. Proportional image rendering (contain mode — never stretch or crop)
      const maxImgW = totalBoxSize - padding * 2;
      const maxImgH = totalBoxSize - padding * 2;
      const naturalW = img.naturalWidth || img.width || 1;
      const naturalH = img.naturalHeight || img.height || 1;
      const aspect = naturalW / naturalH;

      let drawW = maxImgW;
      let drawH = maxImgH;
      if (aspect > 1) {
        drawH = maxImgW / aspect;
      } else {
        drawW = maxImgH * aspect;
      }

      const drawX = boxX + (totalBoxSize - drawW) / 2;
      const drawY = boxY + (totalBoxSize - drawH) / 2;

      // Draw image inside protective plate
      ctx.save();
      const innerRadius = Math.max(0, borderRadius - padding / 2);
      drawRoundedRect(ctx, boxX + 1, boxY + 1, totalBoxSize - 2, totalBoxSize - 2, innerRadius);
      ctx.clip();
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    } catch (err) {
      console.warn("Failed to composite center logo onto QR canvas:", err);
    }
  }
}

/**
 * Generates an SVG string representation of the QR code with true coordinate alignment.
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
    // Parse viewBox to get exact SVG module coordinate space
    const qr = QRCode.create(payload, {
      errorCorrectionLevel: options.errorCorrectionLevel,
    });
    const qrcodesize = qr.modules.size + Math.max(0, options.margin) * 2;

    const logoPercent = (options.logoSize || 22) / 100;
    const totalBox = Number((qrcodesize * logoPercent).toFixed(3));
    const x = Number(((qrcodesize - totalBox) / 2).toFixed(3));
    const y = Number(((qrcodesize - totalBox) / 2).toFixed(3));

    const padPercent = (options.logoPadding ?? 12) / 100;
    const padding = Number((totalBox * padPercent).toFixed(3));
    const radiusPercent = (options.logoRadius ?? 20) / 100;
    const rx = Number((totalBox * radiusPercent).toFixed(3));

    const imgBox = Number((totalBox - padding * 2).toFixed(3));
    const imgX = Number((x + padding).toFixed(3));
    const imgY = Number((y + padding).toFixed(3));

    // Escape any quotes in the logo attribute for XML validity
    const safeLogoAttr = options.logo.replace(/"/g, "&quot;");

    const logoSvgElements = `
      <g id="ucode-center-logo">
        <rect x="${x}" y="${y}" width="${totalBox}" height="${totalBox}" rx="${rx}" fill="${options.bgColor}" stroke="${options.fgColor}" stroke-opacity="0.12" stroke-width="0.05" />
        <image x="${imgX}" y="${imgY}" width="${imgBox}" height="${imgBox}" href="${safeLogoAttr}" xlink:href="${safeLogoAttr}" preserveAspectRatio="xMidYMid meet" />
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
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
