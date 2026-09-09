"use client";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { X, ZoomIn, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import {
  loadImage,
  renderComposite,
  DEFAULT_PHOTO_TRANSFORM,
  type PhotoTransform,
  type TextArea,
} from "@/lib/mockup";
import type { GalleryTemplate } from "./FrameGallery";

const FONT_OPTIONS = ["serif", "sans-serif", "'Playfair Display', serif", "cursive", "monospace"];
const PREVIEW_RES = 900;

async function uploadDataUrl(dataUrl: string, filename: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const form = new FormData();
  form.append("file", blob, filename);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url as string;
}

export default function FrameStudio({
  template,
  photoUrl,
  onClose,
}: {
  template: GalleryTemplate;
  photoUrl: string;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const overlayImgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startTransform: PhotoTransform } | null>(null);

  const [ready, setReady] = useState(false);
  const [transform, setTransform] = useState<PhotoTransform>(DEFAULT_PHOTO_TRANSFORM);
  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [textStyles, setTextStyles] = useState<Record<string, Partial<TextArea>>>({});
  const [activeField, setActiveField] = useState<string | null>(template.textAreas[0]?.id ?? null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [photo, overlay] = await Promise.all([
        loadImage(photoUrl),
        template.overlayImageUrl ? loadImage(template.overlayImageUrl).catch(() => null) : Promise.resolve(null),
      ]);
      if (cancelled) return;
      photoImgRef.current = photo;
      overlayImgRef.current = overlay;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [photoUrl, template.overlayImageUrl]);

  const mergedTextAreas: TextArea[] = template.textAreas.map((t) => ({ ...t, ...textStyles[t.id] }));

  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = PREVIEW_RES;
    canvas.height = Math.round((PREVIEW_RES * template.canvasHeight) / template.canvasWidth);
    renderComposite({
      canvas,
      canvasWidth: template.canvasWidth,
      canvasHeight: template.canvasHeight,
      overlayImage: overlayImgRef.current,
      photoImage: photoImgRef.current,
      photoArea: template.photoArea,
      photoTransform: transform,
      textAreas: mergedTextAreas,
      textValues,
    });
  }, [ready, transform, textValues, mergedTextAreas, template]);

  const startPan = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, startTransform: transform };
    const onMove = (ev: PointerEvent) => {
      if (!dragRef.current || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const dx = (ev.clientX - dragRef.current.startX) / rect.width;
      const dy = (ev.clientY - dragRef.current.startY) / rect.height;
      setTransform((t) => ({
        ...t,
        offsetX: Math.min(Math.max(dragRef.current!.startTransform.offsetX + dx * 4, -1), 1),
        offsetY: Math.min(Math.max(dragRef.current!.startTransform.offsetY + dy * 4, -1), 1),
      }));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const updateStyle = (id: string, patch: Partial<TextArea>) =>
    setTextStyles((s) => ({ ...s, [id]: { ...s[id], ...patch } }));

  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = async () => {
    if (!canvasRef.current) return;
    setAdding(true);
    try {
      // Re-render at a higher, print-friendlier resolution for the final export.
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = 1600;
      exportCanvas.height = Math.round((1600 * template.canvasHeight) / template.canvasWidth);
      renderComposite({
        canvas: exportCanvas,
        canvasWidth: template.canvasWidth,
        canvasHeight: template.canvasHeight,
        overlayImage: overlayImgRef.current,
        photoImage: photoImgRef.current,
        photoArea: template.photoArea,
        photoTransform: transform,
        textAreas: mergedTextAreas,
        textValues,
      });
      const finalDataUrl = exportCanvas.toDataURL("image/jpeg", 0.92);
      const finalUrl = await uploadDataUrl(finalDataUrl, `${template.id}-${Date.now()}.jpg`);

      addItem({
        id: uuidv4(),
        productId: template.id,
        name: template.name,
        image: finalUrl,
        price: template.basePrice,
        quantity: 1,
        customization: JSON.stringify({
          textValues,
          textStyles,
          photoTransform: transform,
        }),
        uploadedImage: finalUrl,
      });
      toast.success("Added to cart!");
      onClose();
    } catch {
      toast.error("Couldn't save your customization. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const active = template.textAreas.find((t) => t.id === activeField);
  const activeMerged = active ? mergedTextAreas.find((t) => t.id === active.id) : undefined;

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(96vw,64rem)] max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Dialog.Title className="font-display text-xl font-bold text-gray-800">{template.name}</Dialog.Title>
              <p className="text-sm text-gray-500">
                {formatPrice(template.basePrice)}
                {template.comparePrice && <span className="line-through text-gray-400 ml-2">{formatPrice(template.comparePrice)}</span>}
              </p>
            </div>
            <Dialog.Close asChild>
              <button aria-label="Close" className="text-gray-400 hover:text-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Live preview */}
            <div>
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
                {ready ? (
                  <canvas
                    ref={canvasRef}
                    onPointerDown={startPan}
                    className="w-full h-auto cursor-move touch-none select-none"
                  />
                ) : (
                  <div className="aspect-square flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-3">
                <ZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={2.5}
                  step={0.01}
                  value={transform.scale}
                  onChange={(e) => setTransform((t) => ({ ...t, scale: Number(e.target.value) }))}
                  className="w-full accent-brand-500"
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-1">Drag the photo to reposition it, use the slider to zoom.</p>
            </div>

            {/* Text fields */}
            <div className="space-y-4">
              {template.textAreas.length === 0 ? (
                <p className="text-sm text-gray-500">This design doesn&apos;t have any editable text fields — just position your photo and add it to cart.</p>
              ) : (
                template.textAreas.map((field) => (
                  <div
                    key={field.id}
                    className={cn(
                      "rounded-2xl border p-3.5 transition-colors",
                      activeField === field.id ? "border-brand-400 bg-brand-50/40" : "border-gray-200"
                    )}
                    onFocus={() => setActiveField(field.id)}
                  >
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">{field.placeholder}</label>
                    <input
                      type="text"
                      maxLength={field.maxLength}
                      placeholder={field.placeholder}
                      value={textValues[field.id] ?? ""}
                      onFocus={() => setActiveField(field.id)}
                      onChange={(e) => setTextValues((v) => ({ ...v, [field.id]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
                    />

                    {activeField === field.id && activeMerged && (
                      <div className="flex items-center flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                        <select
                          value={activeMerged.fontFamily}
                          onChange={(e) => updateStyle(field.id, { fontFamily: e.target.value })}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                        >
                          {FONT_OPTIONS.map((f) => (
                            <option key={f} value={f} style={{ fontFamily: f }}>
                              {f.split(",")[0].replace(/'/g, "")}
                            </option>
                          ))}
                        </select>

                        <input
                          type="range"
                          min={16}
                          max={90}
                          value={activeMerged.fontSize}
                          onChange={(e) => updateStyle(field.id, { fontSize: Number(e.target.value) })}
                          className="w-20 accent-brand-500"
                          title="Font size"
                        />

                        <input
                          type="color"
                          value={activeMerged.color}
                          onChange={(e) => updateStyle(field.id, { color: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                          title="Text color"
                        />

                        <button
                          type="button"
                          onClick={() => updateStyle(field.id, { fontWeight: activeMerged.fontWeight === "bold" ? "normal" : "bold" })}
                          className={cn("p-1.5 rounded-lg border", activeMerged.fontWeight === "bold" ? "bg-brand-500 text-white border-brand-500" : "border-gray-200 text-gray-500")}
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStyle(field.id, { fontStyle: activeMerged.fontStyle === "italic" ? "normal" : "italic" })}
                          className={cn("p-1.5 rounded-lg border", activeMerged.fontStyle === "italic" ? "bg-brand-500 text-white border-brand-500" : "border-gray-200 text-gray-500")}
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        {([
                          ["left", AlignLeft],
                          ["center", AlignCenter],
                          ["right", AlignRight],
                        ] as const).map(([align, Icon]) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => updateStyle(field.id, { align })}
                            className={cn("p-1.5 rounded-lg border", activeMerged.align === align ? "bg-brand-500 text-white border-brand-500" : "border-gray-200 text-gray-500")}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}

              <Button className="w-full rounded-2xl mt-2" onClick={handleAddToCart} loading={adding} disabled={!ready}>
                <Check className="w-4 h-4" /> Add to Cart — {formatPrice(template.basePrice)}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
