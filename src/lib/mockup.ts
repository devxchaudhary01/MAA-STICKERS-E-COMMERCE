import { HEART_POINTS } from "./frames";

/** Normalized (0–1, relative to the template's canvasWidth/canvasHeight) rectangle
 *  describing where the customer's photo is composited into a frame/clock template. */
export interface PhotoArea {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "rect" | "circle" | "heart";
  rotation?: number;
}

export type TextAlign = "left" | "center" | "right";

/** One editable text field defined by the admin on a template (e.g. "Baby's Name", "Date of Birth"). */
export interface TextArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  align: TextAlign;
  fontFamily: string;
  fontSize: number; // px, relative to a canvasWidth-reference resolution
  color: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  placeholder: string;
  maxLength?: number;
}

/** How the user's uploaded photo is panned/zoomed inside its photoArea. offsetX/Y are
 *  normalized -1..1 nudges away from centered, scale is a multiplier on the cover-fit size. */
export interface PhotoTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export const DEFAULT_PHOTO_TRANSFORM: PhotoTransform = { scale: 1, offsetX: 0, offsetY: 0 };

export function emptyPhotoArea(): PhotoArea {
  return { x: 0.15, y: 0.15, width: 0.7, height: 0.7, shape: "rect", rotation: 0 };
}

export function newTextArea(id: string): TextArea {
  return {
    id,
    x: 0.15,
    y: 0.82,
    width: 0.7,
    height: 0.12,
    align: "center",
    fontFamily: "serif",
    fontSize: 42,
    color: "#3b2414",
    fontWeight: "normal",
    fontStyle: "normal",
    placeholder: "Your text",
  };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function shapePath(ctx: CanvasRenderingContext2D, shape: PhotoArea["shape"], x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  if (shape === "circle") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (shape === "heart") {
    HEART_POINTS.forEach(([px, py], i) => {
      const cx = x + px * w;
      const cy = y + py * h;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.closePath();
  } else {
    ctx.rect(x, y, w, h);
  }
}

/** Draws `photo` cover-fit + clipped into the normalized `area`, nudged by `transform`. */
export function drawPhotoIntoArea(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  area: PhotoArea,
  canvasW: number,
  canvasH: number,
  transform: PhotoTransform = DEFAULT_PHOTO_TRANSFORM
) {
  const ax = area.x * canvasW;
  const ay = area.y * canvasH;
  const aw = area.width * canvasW;
  const ah = area.height * canvasH;

  ctx.save();
  shapePath(ctx, area.shape, ax, ay, aw, ah);
  ctx.clip();

  // Cover-fit the photo inside the area, then apply the user's zoom/pan.
  const areaAspect = aw / ah;
  const imgAspect = photo.width / photo.height;
  let drawW: number, drawH: number;
  if (imgAspect > areaAspect) {
    drawH = ah * transform.scale;
    drawW = drawH * imgAspect;
  } else {
    drawW = aw * transform.scale;
    drawH = drawW / imgAspect;
  }
  const maxOffsetX = Math.max(0, (drawW - aw) / 2);
  const maxOffsetY = Math.max(0, (drawH - ah) / 2);
  const dx = ax + (aw - drawW) / 2 + transform.offsetX * maxOffsetX;
  const dy = ay + (ah - drawH) / 2 + transform.offsetY * maxOffsetY;

  ctx.drawImage(photo, dx, dy, drawW, drawH);
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export function drawTextIntoArea(
  ctx: CanvasRenderingContext2D,
  text: string,
  area: TextArea,
  canvasW: number,
  canvasH: number,
  scale = canvasW / 1000
) {
  if (!text) return;
  const x = area.x * canvasW;
  const y = area.y * canvasH;
  const w = area.width * canvasW;
  const h = area.height * canvasH;
  const fontSize = area.fontSize * scale;

  ctx.save();
  ctx.font = `${area.fontStyle} ${area.fontWeight} ${fontSize}px ${area.fontFamily}`;
  ctx.fillStyle = area.color;
  ctx.textBaseline = "middle";
  ctx.textAlign = area.align;

  const lines = wrapText(ctx, text, w);
  const lineHeight = fontSize * 1.2;
  const totalHeight = lineHeight * lines.length;
  let startY = y + h / 2 - totalHeight / 2 + lineHeight / 2;

  const tx = area.align === "center" ? x + w / 2 : area.align === "right" ? x + w : x;
  for (const line of lines) {
    ctx.fillText(line, tx, startY);
    startY += lineHeight;
  }
  ctx.restore();
}

export interface CompositeOptions {
  canvas: HTMLCanvasElement;
  canvasWidth: number; // reference design resolution (Product.canvasWidth)
  canvasHeight: number;
  overlayImage?: HTMLImageElement | null;
  photoImage?: HTMLImageElement | null;
  photoArea?: PhotoArea | null;
  photoTransform?: PhotoTransform;
  textAreas: TextArea[];
  textValues: Record<string, string>;
  background?: string;
}

/** Renders photo (clipped into its slot) + frame overlay + editable text onto the given canvas.
 *  Resolution-independent: pass any canvas.width/height, all placement is normalized. */
export function renderComposite(opts: CompositeOptions) {
  const { canvas, photoImage, photoArea, overlayImage, textAreas, textValues } = opts;
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = opts.background ?? "#ffffff";
  ctx.fillRect(0, 0, w, h);

  if (photoImage && photoArea) {
    drawPhotoIntoArea(ctx, photoImage, photoArea, w, h, opts.photoTransform ?? DEFAULT_PHOTO_TRANSFORM);
  }
  if (overlayImage) {
    ctx.drawImage(overlayImage, 0, 0, w, h);
  }
  const scale = w / (opts.canvasWidth || 1000);
  for (const area of textAreas) {
    drawTextIntoArea(ctx, textValues[area.id] ?? "", area, w, h, scale);
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png", quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), type, quality);
  });
}
