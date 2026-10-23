import QRCode from "qrcode";
import jsQR from "jsqr";
import {
  QRCustomizationOptions,
  QRModuleShape,
  QRPatternStyle,
  QRFinderStyle,
} from "@/types/qr";

export interface GenerateCanvasOptions extends QRCustomizationOptions {
  renderSize?: number;
}

export interface LogoModuleDimensions {
  boxModules: number;
  startModule: number;
  maxSafeModules: number;
  isSafe: boolean;
}

/**
 * Calculates standards-compliant, module-grid-aligned dimensions for a center logo.
 * All QR matrices have an odd module count (4*V + 17). Sizing is calculated strictly
 * relative to the data symbol grid (excluding quiet zones) and snapped to an odd integer
 * of modules centered symmetrically on the middle module.
 *
 * Guaranteed boundaries:
 * Finder patterns occupy rows/cols 0..7 and (M-8)..(M-1).
 * Timing patterns occupy row 6 and col 6.
 * The center logo is strictly clamped within rows/cols 8..(M-9) to guarantee finder
 * and timing modules are NEVER occluded.
 */
export function calculateLogoModuleDimensions(
  moduleCount: number,
  logoSizePercent: number
): LogoModuleDimensions {
  const maxSafeModules = Math.max(3, moduleCount - 16);
  const rawModules = moduleCount * (Math.max(10, Math.min(30, logoSizePercent)) / 100);

  // Snap to nearest odd integer of modules for symmetrical centering on (moduleCount - 1) / 2
  let boxModules = Math.round((rawModules - 1) / 2) * 2 + 1;
  boxModules = Math.max(3, Math.min(maxSafeModules, boxModules));

  const centerModule = (moduleCount - 1) / 2;
  const startModule = centerModule - (boxModules - 1) / 2;

  // A logo is considered safe if box module count occludes <= 24% linear dimension of the symbol
  const isSafe = boxModules <= maxSafeModules && (boxModules / moduleCount) <= 0.24;

  return {
    boxModules,
    startModule,
    maxSafeModules,
    isSafe,
  };
}

/**
 * Converts hex color (#rrggbb or #rgb) to RGB tuple.
 */
export function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  if (c.length !== 6) return [0, 0, 0];
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Determines whether a module coordinate falls inside one of the three 7x7 Finder Patterns.
 */
function isFinderModule(r: number, c: number, moduleCount: number): boolean {
  if (r < 7 && c < 7) return true; // Top-left
  if (r < 7 && c >= moduleCount - 7) return true; // Top-right
  if (r >= moduleCount - 7 && c < 7) return true; // Bottom-left
  return false;
}

/**
 * Draws QR code onto an HTML5 Canvas element with pixel-perfect module alignment,
 * custom module shapes, pattern flow styling, finder patterns, and center logo backing.
 */
export async function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  payload: string,
  options: GenerateCanvasOptions
): Promise<void> {
  const targetSize = options.renderSize || options.size || 512;
  const moduleShape: QRModuleShape = options.moduleShape || "square";
  const patternStyle: QRPatternStyle = options.patternStyle || "classic-grid";
  const finderStyle: QRFinderStyle = options.finderStyle || "square";
  const hasLogo = Boolean(options.logo && options.logoMode !== false);

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
  const offset = Math.floor((targetSize - matrixSize) / 2);

  canvas.width = targetSize;
  canvas.height = targetSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 3. Uniform background fill
  ctx.fillStyle = options.bgColor;
  ctx.fillRect(0, 0, targetSize, targetSize);

  // 4. Determine logo exclusion area
  let logoStart = -1;
  let logoEnd = -1;
  if (hasLogo) {
    const { boxModules, startModule } = calculateLogoModuleDimensions(
      moduleCount,
      options.logoSize || 18
    );
    logoStart = startModule;
    logoEnd = startModule + boxModules;
  }

  const inLogo = (r: number, c: number) => {
    return hasLogo && r >= logoStart && r < logoEnd && c >= logoStart && c < logoEnd;
  };

  // 5. Render Data & Functional Modules
  ctx.fillStyle = options.fgColor;

  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (isFinderModule(r, c, moduleCount)) continue; // Handled in finder pass
      if (inLogo(r, c)) continue; // Hidden behind logo plate

      if (qr.modules.get(r, c)) {
        const x = offset + (margin + c) * modulePx;
        const y = offset + (margin + r) * modulePx;

        // Functional patterns (timing patterns, alignment patterns) MUST retain solid square modules
        // to preserve decoder clock synchronization and pitch calibration
        const isReserved = qr.modules.isReserved(r, c);

        if (isReserved) {
          ctx.fillRect(x, y, modulePx, modulePx);
        } else {
          // Styled Data Modules
          if (patternStyle === "dotted-matrix" || (patternStyle === "classic-grid" && moduleShape === "bubble")) {
            const radius = (modulePx * 0.88) / 2;
            ctx.beginPath();
            ctx.arc(x + modulePx / 2, y + modulePx / 2, radius, 0, Math.PI * 2);
            ctx.fill();
          } else if (patternStyle === "soft-grid") {
            const pad = Math.max(1, Math.round(modulePx * 0.05));
            drawRoundedRect(
              ctx,
              x + pad,
              y + pad,
              modulePx - pad * 2,
              modulePx - pad * 2,
              modulePx * 0.22
            );
            ctx.fill();
          } else if (patternStyle === "connected-flow") {
            const up = r > 0 && qr.modules.get(r - 1, c) && !isFinderModule(r - 1, c, moduleCount) && !inLogo(r - 1, c);
            const down = r < moduleCount - 1 && qr.modules.get(r + 1, c) && !isFinderModule(r + 1, c, moduleCount) && !inLogo(r + 1, c);
            const left = c > 0 && qr.modules.get(r, c - 1) && !isFinderModule(r, c - 1, moduleCount) && !inLogo(r, c - 1);
            const right = c < moduleCount - 1 && qr.modules.get(r, c + 1) && !isFinderModule(r, c + 1, moduleCount) && !inLogo(r, c + 1);

            drawConnectedModuleCanvas(ctx, x, y, modulePx, Boolean(up), Boolean(down), Boolean(left), Boolean(right));
          } else {
            // Module shapes for classic-grid and dense-geometric
            if (moduleShape === "square" || patternStyle === "dense-geometric") {
              ctx.fillRect(x, y, modulePx, modulePx);
            } else if (moduleShape === "rounded-square") {
              drawRoundedRect(ctx, x, y, modulePx, modulePx, modulePx * 0.28);
              ctx.fill();
            } else if (moduleShape === "bubble") {
              const radius = (modulePx * 0.88) / 2;
              ctx.beginPath();
              ctx.arc(x + modulePx / 2, y + modulePx / 2, radius, 0, Math.PI * 2);
              ctx.fill();
            } else if (moduleShape === "soft-pixel") {
              drawRoundedRect(ctx, x, y, modulePx, modulePx, modulePx * 0.16);
              ctx.fill();
            } else if (moduleShape === "diamond") {
              drawDiamondCanvas(ctx, x, y, modulePx, modulePx, 0.95);
            }
          }
        }
      }
    }
  }

  // 6. Render Finder Patterns
  const finderPositions = [
    { r: 0, c: 0 },
    { r: 0, c: moduleCount - 7 },
    { r: moduleCount - 7, c: 0 },
  ];

  for (const pos of finderPositions) {
    const fx = offset + (margin + pos.c) * modulePx;
    const fy = offset + (margin + pos.r) * modulePx;
    const fSize = 7 * modulePx;

    if (finderStyle === "square") {
      ctx.fillStyle = options.fgColor;
      ctx.fillRect(fx, fy, fSize, fSize);
      ctx.fillStyle = options.bgColor;
      ctx.fillRect(fx + modulePx, fy + modulePx, 5 * modulePx, 5 * modulePx);
      ctx.fillStyle = options.fgColor;
      ctx.fillRect(fx + 2 * modulePx, fy + 2 * modulePx, 3 * modulePx, 3 * modulePx);
    } else if (finderStyle === "rounded") {
      ctx.fillStyle = options.fgColor;
      drawRoundedRect(ctx, fx, fy, fSize, fSize, modulePx * 1.5);
      ctx.fill();

      ctx.fillStyle = options.bgColor;
      drawRoundedRect(ctx, fx + modulePx, fy + modulePx, 5 * modulePx, 5 * modulePx, modulePx * 0.5);
      ctx.fill();

      ctx.fillStyle = options.fgColor;
      drawRoundedRect(ctx, fx + 2 * modulePx, fy + 2 * modulePx, 3 * modulePx, 3 * modulePx, modulePx * 0.8);
      ctx.fill();
    } else if (finderStyle === "circular") {
      ctx.fillStyle = options.fgColor;
      drawRoundedRect(ctx, fx, fy, fSize, fSize, modulePx * 2.8);
      ctx.fill();

      ctx.fillStyle = options.bgColor;
      drawRoundedRect(ctx, fx + modulePx, fy + modulePx, 5 * modulePx, 5 * modulePx, modulePx * 1.8);
      ctx.fill();

      ctx.fillStyle = options.fgColor;
      ctx.beginPath();
      ctx.arc(fx + 3.5 * modulePx, fy + 3.5 * modulePx, modulePx * 1.48, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 7. Composite center logo with protective backing plate
  if (hasLogo && options.logo) {
    try {
      const img = await loadImage(options.logo);
      const { boxModules, startModule } = calculateLogoModuleDimensions(
        moduleCount,
        options.logoSize || 18
      );

      const boxX = offset + (margin + startModule) * modulePx;
      const boxY = offset + (margin + startModule) * modulePx;
      const boxSize = boxModules * modulePx;

      const radiusPercent = (options.logoRadius ?? 20) / 100;
      const maxAllowedRadius = (boxModules / 2 - 0.5) * modulePx;
      const borderRadius = Math.round(Math.min(boxSize * radiusPercent, maxAllowedRadius));

      // A. Opaque protective backing plate
      ctx.save();
      ctx.fillStyle = options.bgColor;
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      drawRoundedRect(ctx, boxX, boxY, boxSize, boxSize, borderRadius);
      ctx.fill();
      ctx.restore();

      // B. Subtle neutral backing border
      ctx.save();
      ctx.strokeStyle = options.fgColor;
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = Math.max(1, Math.round(modulePx * 0.06));
      drawRoundedRect(
        ctx,
        boxX + 0.5,
        boxY + 0.5,
        boxSize - 1,
        boxSize - 1,
        borderRadius
      );
      ctx.stroke();
      ctx.restore();

      // C. Proportional image rendering
      const padPercent = (options.logoPadding ?? 12) / 100;
      const padding = Math.max(
        Math.round(modulePx * 0.5),
        Math.round(boxSize * padPercent)
      );
      const maxImgW = boxSize - padding * 2;
      const maxImgH = boxSize - padding * 2;
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

      const drawX = boxX + (boxSize - drawW) / 2;
      const drawY = boxY + (boxSize - drawH) / 2;

      ctx.save();
      const innerRadius = Math.max(0, borderRadius - padding / 2);
      drawRoundedRect(ctx, boxX + 1, boxY + 1, boxSize - 2, boxSize - 2, innerRadius);
      ctx.clip();
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    } catch (err) {
      console.warn("Failed to composite center logo onto QR canvas:", err);
    }
  }
}

/**
 * Pure RGBA buffer rasterizer that renders QR code with full style support (module shapes,
 * patterns, finders, center logo) into a Uint8ClampedArray for automated tests and node environments.
 */
export function renderQRToBuffer(
  payload: string,
  options: QRCustomizationOptions,
  targetSize: number = 512
): {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  moduleCount: number;
  modulePx: number;
  boxModules?: number;
} {
  const moduleShape: QRModuleShape = options.moduleShape || "square";
  const patternStyle: QRPatternStyle = options.patternStyle || "classic-grid";
  const finderStyle: QRFinderStyle = options.finderStyle || "square";
  const hasLogo = Boolean(options.logo && options.logoMode !== false);

  const qr = QRCode.create(payload, {
    errorCorrectionLevel: options.errorCorrectionLevel,
  });
  const moduleCount = qr.modules.size;
  const margin = Math.max(0, options.margin);
  const totalModules = moduleCount + margin * 2;

  const modulePx = Math.max(1, Math.floor(targetSize / totalModules));
  const matrixSize = totalModules * modulePx;
  const offset = Math.floor((targetSize - matrixSize) / 2);

  const buf = new Uint8ClampedArray(targetSize * targetSize * 4);
  const [bgR, bgG, bgB] = hexToRgb(options.bgColor);
  const [fgR, fgG, fgB] = hexToRgb(options.fgColor);

  // Fill background
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = bgR;
    buf[i + 1] = bgG;
    buf[i + 2] = bgB;
    buf[i + 3] = 255;
  }

  let logoStart = -1;
  let logoEnd = -1;
  let boxModulesUsed: number | undefined;

  if (hasLogo) {
    const { boxModules, startModule } = calculateLogoModuleDimensions(
      moduleCount,
      options.logoSize || 18
    );
    boxModulesUsed = boxModules;
    logoStart = startModule;
    logoEnd = startModule + boxModules;
  }

  const inLogo = (r: number, c: number) => {
    return hasLogo && r >= logoStart && r < logoEnd && c >= logoStart && c < logoEnd;
  };

  // Render modules
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (isFinderModule(r, c, moduleCount)) continue;
      if (inLogo(r, c)) continue;

      if (qr.modules.get(r, c)) {
        const x = offset + (margin + c) * modulePx;
        const y = offset + (margin + r) * modulePx;

        const isReserved = qr.modules.isReserved(r, c);

        if (isReserved) {
          drawBufRect(buf, targetSize, x, y, modulePx, modulePx, fgR, fgG, fgB);
        } else {
          if (patternStyle === "dotted-matrix" || (patternStyle === "classic-grid" && moduleShape === "bubble")) {
            drawBufCircle(buf, targetSize, x + modulePx / 2, y + modulePx / 2, (modulePx * 0.88) / 2, fgR, fgG, fgB);
          } else if (patternStyle === "soft-grid") {
            const pad = Math.max(1, Math.round(modulePx * 0.05));
            drawBufRoundedRect(buf, targetSize, x + pad, y + pad, modulePx - pad * 2, modulePx - pad * 2, modulePx * 0.22, fgR, fgG, fgB);
          } else if (patternStyle === "connected-flow") {
            const up = r > 0 && qr.modules.get(r - 1, c) && !isFinderModule(r - 1, c, moduleCount) && !inLogo(r - 1, c);
            const down = r < moduleCount - 1 && qr.modules.get(r + 1, c) && !isFinderModule(r + 1, c, moduleCount) && !inLogo(r + 1, c);
            const left = c > 0 && qr.modules.get(r, c - 1) && !isFinderModule(r, c - 1, moduleCount) && !inLogo(r, c - 1);
            const right = c < moduleCount - 1 && qr.modules.get(r, c + 1) && !isFinderModule(r, c + 1, moduleCount) && !inLogo(r, c + 1);

            drawBufConnectedModule(buf, targetSize, x, y, modulePx, Boolean(up), Boolean(down), Boolean(left), Boolean(right), fgR, fgG, fgB);
          } else {
            if (moduleShape === "square" || patternStyle === "dense-geometric") {
              drawBufRect(buf, targetSize, x, y, modulePx, modulePx, fgR, fgG, fgB);
            } else if (moduleShape === "rounded-square") {
              drawBufRoundedRect(buf, targetSize, x, y, modulePx, modulePx, modulePx * 0.28, fgR, fgG, fgB);
            } else if (moduleShape === "bubble") {
              drawBufCircle(buf, targetSize, x + modulePx / 2, y + modulePx / 2, (modulePx * 0.88) / 2, fgR, fgG, fgB);
            } else if (moduleShape === "soft-pixel") {
              drawBufRoundedRect(buf, targetSize, x, y, modulePx, modulePx, modulePx * 0.16, fgR, fgG, fgB);
            } else if (moduleShape === "diamond") {
              drawBufDiamond(buf, targetSize, x, y, modulePx, modulePx, 0.95, fgR, fgG, fgB);
            }
          }
        }
      }
    }
  }

  // Render finders
  const finderPositions = [
    { r: 0, c: 0 },
    { r: 0, c: moduleCount - 7 },
    { r: moduleCount - 7, c: 0 },
  ];

  for (const pos of finderPositions) {
    const fx = offset + (margin + pos.c) * modulePx;
    const fy = offset + (margin + pos.r) * modulePx;
    const fSize = 7 * modulePx;

    if (finderStyle === "square") {
      drawBufRect(buf, targetSize, fx, fy, fSize, fSize, fgR, fgG, fgB);
      drawBufRect(buf, targetSize, fx + modulePx, fy + modulePx, 5 * modulePx, 5 * modulePx, bgR, bgG, bgB);
      drawBufRect(buf, targetSize, fx + 2 * modulePx, fy + 2 * modulePx, 3 * modulePx, 3 * modulePx, fgR, fgG, fgB);
    } else if (finderStyle === "rounded") {
      drawBufRoundedRect(buf, targetSize, fx, fy, fSize, fSize, modulePx * 1.5, fgR, fgG, fgB);
      drawBufRoundedRect(buf, targetSize, fx + modulePx, fy + modulePx, 5 * modulePx, 5 * modulePx, modulePx * 0.5, bgR, bgG, bgB);
      drawBufRoundedRect(buf, targetSize, fx + 2 * modulePx, fy + 2 * modulePx, 3 * modulePx, 3 * modulePx, modulePx * 0.8, fgR, fgG, fgB);
    } else if (finderStyle === "circular") {
      drawBufRoundedRect(buf, targetSize, fx, fy, fSize, fSize, modulePx * 2.8, fgR, fgG, fgB);
      drawBufRoundedRect(buf, targetSize, fx + modulePx, fy + modulePx, 5 * modulePx, 5 * modulePx, modulePx * 1.8, bgR, bgG, bgB);
      drawBufCircle(buf, targetSize, fx + 3.5 * modulePx, fy + 3.5 * modulePx, modulePx * 1.48, fgR, fgG, fgB);
    }
  }

  // Render logo backing plate and inner test glyph in buffer
  if (hasLogo) {
    const boxX = offset + (margin + logoStart) * modulePx;
    const boxY = offset + (margin + logoStart) * modulePx;
    const boxPx = (logoEnd - logoStart) * modulePx;

    drawBufRoundedRect(buf, targetSize, boxX, boxY, boxPx, boxPx, modulePx * 0.8, bgR, bgG, bgB);

    // Inner glyph inside backing
    const pad = Math.max(2, Math.round(boxPx * 0.15));
    drawBufRoundedRect(
      buf,
      targetSize,
      boxX + pad,
      boxY + pad,
      boxPx - pad * 2,
      boxPx - pad * 2,
      modulePx * 0.4,
      fgR,
      fgG,
      fgB
    );
  }

  return {
    data: buf,
    width: targetSize,
    height: targetSize,
    moduleCount,
    modulePx,
    boxModules: boxModulesUsed,
  };
}

/**
 * Generates standards-compliant SVG markup with full module shape, pattern style,
 * and finder styling fidelity, matching canvas exports 1:1.
 */
export async function generateQRSVG(
  payload: string,
  options: QRCustomizationOptions
): Promise<string> {
  const moduleShape: QRModuleShape = options.moduleShape || "square";
  const patternStyle: QRPatternStyle = options.patternStyle || "classic-grid";
  const finderStyle: QRFinderStyle = options.finderStyle || "square";
  const hasLogo = Boolean(options.logo && options.logoMode !== false);

  const qr = QRCode.create(payload, {
    errorCorrectionLevel: options.errorCorrectionLevel,
  });
  const moduleCount = qr.modules.size;
  const margin = Math.max(0, options.margin);
  const totalModules = moduleCount + margin * 2;
  const targetWidth = options.size || 512;

  let logoStart = -1;
  let logoEnd = -1;
  let boxModules = 0;

  if (hasLogo) {
    const dim = calculateLogoModuleDimensions(moduleCount, options.logoSize || 18);
    boxModules = dim.boxModules;
    logoStart = dim.startModule;
    logoEnd = dim.startModule + dim.boxModules;
  }

  const inLogo = (r: number, c: number) => {
    return hasLogo && r >= logoStart && r < logoEnd && c >= logoStart && c < logoEnd;
  };

  const svgElements: string[] = [];

  // Background rect
  svgElements.push(
    `<rect width="${totalModules}" height="${totalModules}" fill="${options.bgColor}"/>`
  );

  // Render data and functional modules
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (isFinderModule(r, c, moduleCount)) continue;
      if (inLogo(r, c)) continue;

      if (qr.modules.get(r, c)) {
        const x = margin + c;
        const y = margin + r;
        const isReserved = qr.modules.isReserved(r, c);

        if (isReserved) {
          svgElements.push(
            `<rect x="${x}" y="${y}" width="1" height="1" fill="${options.fgColor}"/>`
          );
        } else {
          if (patternStyle === "dotted-matrix" || (patternStyle === "classic-grid" && moduleShape === "bubble")) {
            svgElements.push(
              `<circle cx="${(x + 0.5).toFixed(3)}" cy="${(y + 0.5).toFixed(3)}" r="0.44" fill="${options.fgColor}"/>`
            );
          } else if (patternStyle === "soft-grid") {
            svgElements.push(
              `<rect x="${(x + 0.05).toFixed(3)}" y="${(y + 0.05).toFixed(3)}" width="0.9" height="0.9" rx="0.22" fill="${options.fgColor}"/>`
            );
          } else if (patternStyle === "connected-flow") {
            const up = r > 0 && qr.modules.get(r - 1, c) && !isFinderModule(r - 1, c, moduleCount) && !inLogo(r - 1, c);
            const down = r < moduleCount - 1 && qr.modules.get(r + 1, c) && !isFinderModule(r + 1, c, moduleCount) && !inLogo(r + 1, c);
            const left = c > 0 && qr.modules.get(r, c - 1) && !isFinderModule(r, c - 1, moduleCount) && !inLogo(r, c - 1);
            const right = c < moduleCount - 1 && qr.modules.get(r, c + 1) && !isFinderModule(r, c + 1, moduleCount) && !inLogo(r, c + 1);

            svgElements.push(
              `<rect x="${x}" y="${y}" width="1" height="1" rx="0.28" fill="${options.fgColor}"/>`
            );
            if (up) svgElements.push(`<rect x="${x}" y="${y}" width="1" height="0.32" fill="${options.fgColor}"/>`);
            if (down) svgElements.push(`<rect x="${x}" y="${(y + 0.68).toFixed(3)}" width="1" height="0.32" fill="${options.fgColor}"/>`);
            if (left) svgElements.push(`<rect x="${x}" y="${y}" width="0.32" height="1" fill="${options.fgColor}"/>`);
            if (right) svgElements.push(`<rect x="${(x + 0.68).toFixed(3)}" y="${y}" width="0.32" height="1" fill="${options.fgColor}"/>`);
          } else {
            if (moduleShape === "square" || patternStyle === "dense-geometric") {
              svgElements.push(
                `<rect x="${x}" y="${y}" width="1" height="1" fill="${options.fgColor}"/>`
              );
            } else if (moduleShape === "rounded-square") {
              svgElements.push(
                `<rect x="${x}" y="${y}" width="1" height="1" rx="0.28" fill="${options.fgColor}"/>`
              );
            } else if (moduleShape === "bubble") {
              svgElements.push(
                `<circle cx="${(x + 0.5).toFixed(3)}" cy="${(y + 0.5).toFixed(3)}" r="0.44" fill="${options.fgColor}"/>`
              );
            } else if (moduleShape === "soft-pixel") {
              svgElements.push(
                `<rect x="${x}" y="${y}" width="1" height="1" rx="0.16" fill="${options.fgColor}"/>`
              );
            } else if (moduleShape === "diamond") {
              svgElements.push(
                `<polygon points="${(x + 0.5).toFixed(3)},${(y + 0.025).toFixed(3)} ${(x + 0.975).toFixed(3)},${(y + 0.5).toFixed(3)} ${(x + 0.5).toFixed(3)},${(y + 0.975).toFixed(3)} ${(x + 0.025).toFixed(3)},${(y + 0.5).toFixed(3)}" fill="${options.fgColor}"/>`
              );
            }
          }
        }
      }
    }
  }

  // Render finders
  const finderPositions = [
    { r: 0, c: 0 },
    { r: 0, c: moduleCount - 7 },
    { r: moduleCount - 7, c: 0 },
  ];

  for (const pos of finderPositions) {
    const fx = margin + pos.c;
    const fy = margin + pos.r;

    if (finderStyle === "square") {
      svgElements.push(`<rect x="${fx}" y="${fy}" width="7" height="7" fill="${options.fgColor}"/>`);
      svgElements.push(`<rect x="${fx + 1}" y="${fy + 1}" width="5" height="5" fill="${options.bgColor}"/>`);
      svgElements.push(`<rect x="${fx + 2}" y="${fy + 2}" width="3" height="3" fill="${options.fgColor}"/>`);
    } else if (finderStyle === "rounded") {
      svgElements.push(`<rect x="${fx}" y="${fy}" width="7" height="7" rx="1.5" fill="${options.fgColor}"/>`);
      svgElements.push(`<rect x="${fx + 1}" y="${fy + 1}" width="5" height="5" rx="0.5" fill="${options.bgColor}"/>`);
      svgElements.push(`<rect x="${fx + 2}" y="${fy + 2}" width="3" height="3" rx="0.8" fill="${options.fgColor}"/>`);
    } else if (finderStyle === "circular") {
      svgElements.push(`<rect x="${fx}" y="${fy}" width="7" height="7" rx="2.8" fill="${options.fgColor}"/>`);
      svgElements.push(`<rect x="${fx + 1}" y="${fy + 1}" width="5" height="5" rx="1.8" fill="${options.bgColor}"/>`);
      svgElements.push(`<circle cx="${(fx + 3.5).toFixed(3)}" cy="${(fy + 3.5).toFixed(3)}" r="1.48" fill="${options.fgColor}"/>`);
    }
  }

  // Render logo if active
  if (hasLogo && options.logo) {
    const boxX = margin + logoStart;
    const boxY = margin + logoStart;
    const boxSize = boxModules;

    const padPercent = (options.logoPadding ?? 12) / 100;
    const pad = Number((boxSize * padPercent).toFixed(3));
    const radiusPercent = (options.logoRadius ?? 20) / 100;
    const rx = Number((boxSize * radiusPercent).toFixed(3));

    const imgX = Number((boxX + pad).toFixed(3));
    const imgY = Number((boxY + pad).toFixed(3));
    const imgBox = Number((boxSize - pad * 2).toFixed(3));

    const safeLogoAttr = options.logo.replace(/"/g, "&quot;");

    svgElements.push(`
      <g id="ucode-center-logo">
        <rect x="${boxX}" y="${boxY}" width="${boxSize}" height="${boxSize}" rx="${rx}" fill="${options.bgColor}" stroke="${options.fgColor}" stroke-opacity="0.15" stroke-width="0.06" />
        <image x="${imgX}" y="${imgY}" width="${imgBox}" height="${imgBox}" href="${safeLogoAttr}" xlink:href="${safeLogoAttr}" preserveAspectRatio="xMidYMid meet" />
      </g>
    `);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${totalModules} ${totalModules}" width="${targetWidth}" height="${targetWidth}">
    ${svgElements.join("\n    ")}
  </svg>`;
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

function drawDiamondCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  ratio: number = 0.95
): void {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const hw = (width / 2) * ratio;
  const hh = (height / 2) * ratio;

  ctx.beginPath();
  ctx.moveTo(cx, cy - hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hh);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();
  ctx.fill();
}

function drawConnectedModuleCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  up: boolean,
  down: boolean,
  left: boolean,
  right: boolean
): void {
  const r = s * 0.28;
  drawRoundedRect(ctx, x, y, s, s, r);
  ctx.fill();

  // Extend orthogonal connector bridges
  if (up) ctx.fillRect(x, y, s, r + 1);
  if (down) ctx.fillRect(x, y + s - r - 1, s, r + 1);
  if (left) ctx.fillRect(x, y, r + 1, s);
  if (right) ctx.fillRect(x + s - r - 1, y, r + 1, s);
}

// Buffer drawing primitives
function drawBufRect(
  buf: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  g: number,
  b: number
): void {
  const startY = Math.floor(y);
  const endY = Math.floor(y + h);
  const startX = Math.floor(x);
  const endX = Math.floor(x + w);
  for (let py = startY; py < endY; py++) {
    for (let px = startX; px < endX; px++) {
      const idx = (py * width + px) * 4;
      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = 255;
    }
  }
}

function drawBufCircle(
  buf: Uint8ClampedArray,
  width: number,
  cx: number,
  cy: number,
  radius: number,
  r: number,
  g: number,
  b: number
): void {
  const r2 = radius * radius;
  const minX = Math.floor(cx - radius);
  const maxX = Math.ceil(cx + radius);
  const minY = Math.floor(cy - radius);
  const maxY = Math.ceil(cy + radius);
  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const dx = px - cx;
      const dy = py - cy;
      if (dx * dx + dy * dy <= r2) {
        const idx = (py * width + px) * 4;
        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = 255;
      }
    }
  }
}

function drawBufRoundedRect(
  buf: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  rCol: number,
  gCol: number,
  bCol: number
): void {
  const rad = Math.min(radius, w / 2, h / 2);
  const r2 = rad * rad;
  const startY = Math.floor(y);
  const endY = Math.floor(y + h);
  const startX = Math.floor(x);
  const endX = Math.floor(x + w);

  for (let py = startY; py < endY; py++) {
    for (let px = startX; px < endX; px++) {
      let inside = true;
      if (px < x + rad && py < y + rad) {
        const dx = px - (x + rad);
        const dy = py - (y + rad);
        inside = dx * dx + dy * dy <= r2;
      } else if (px > x + w - rad && py < y + rad) {
        const dx = px - (x + w - rad);
        const dy = py - (y + rad);
        inside = dx * dx + dy * dy <= r2;
      } else if (px < x + rad && py > y + h - rad) {
        const dx = px - (x + rad);
        const dy = py - (y + h - rad);
        inside = dx * dx + dy * dy <= r2;
      } else if (px > x + w - rad && py > y + h - rad) {
        const dx = px - (x + w - rad);
        const dy = py - (y + h - rad);
        inside = dx * dx + dy * dy <= r2;
      }
      if (inside) {
        const idx = (py * width + px) * 4;
        buf[idx] = rCol;
        buf[idx + 1] = gCol;
        buf[idx + 2] = bCol;
        buf[idx + 3] = 255;
      }
    }
  }
}

function drawBufDiamond(
  buf: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
  w: number,
  h: number,
  ratio: number,
  rCol: number,
  gCol: number,
  bCol: number
): void {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const hw = (w / 2) * ratio;
  const hh = (h / 2) * ratio;
  const startY = Math.floor(y);
  const endY = Math.floor(y + h);
  const startX = Math.floor(x);
  const endX = Math.floor(x + w);

  for (let py = startY; py < endY; py++) {
    for (let px = startX; px < endX; px++) {
      const dx = Math.abs(px - cx) / hw;
      const dy = Math.abs(py - cy) / hh;
      if (dx + dy <= 1.0) {
        const idx = (py * width + px) * 4;
        buf[idx] = rCol;
        buf[idx + 1] = gCol;
        buf[idx + 2] = bCol;
        buf[idx + 3] = 255;
      }
    }
  }
}

function drawBufConnectedModule(
  buf: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
  s: number,
  up: boolean,
  down: boolean,
  left: boolean,
  right: boolean,
  rCol: number,
  gCol: number,
  bCol: number
): void {
  const r = s * 0.28;
  drawBufRoundedRect(buf, width, x, y, s, s, r, rCol, gCol, bCol);
  if (up) drawBufRect(buf, width, x, y, s, r + 1, rCol, gCol, bCol);
  if (down) drawBufRect(buf, width, x, y + s - r - 1, s, r + 1, rCol, gCol, bCol);
  if (left) drawBufRect(buf, width, x, y, r + 1, s, rCol, gCol, bCol);
  if (right) drawBufRect(buf, width, x + s - r - 1, y, r + 1, s, rCol, gCol, bCol);
}
