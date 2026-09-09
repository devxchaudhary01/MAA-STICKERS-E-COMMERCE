"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, RefreshCcw, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { loadImage, renderComposite, type PhotoArea, type TextArea } from "@/lib/mockup";
import FrameStudio from "./FrameStudio";

export interface GalleryTemplate {
  id: string;
  name: string;
  basePrice: number;
  comparePrice?: number | null;
  overlayImageUrl: string | null;
  canvasWidth: number;
  canvasHeight: number;
  photoArea: PhotoArea;
  textAreas: TextArea[];
}

interface FrameGalleryProps {
  categoryName: string;
  templates: GalleryTemplate[];
}

const THUMB_SIZE = 480;

export default function FrameGallery({ categoryName, templates }: FrameGalleryProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [rendering, setRendering] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<GalleryTemplate | null>(null);
  const overlayCache = useRef<Map<string, HTMLImageElement>>(new Map());

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
  });

  // Auto-apply the uploaded photo to every template in this subcategory the moment it's uploaded.
  useEffect(() => {
    let cancelled = false;
    if (!photoUrl || templates.length === 0) return;

    (async () => {
      setRendering(true);
      try {
        const photoImg = await loadImage(photoUrl);
        const next: Record<string, string> = {};
        for (const t of templates) {
          if (cancelled) return;
          let overlayImg: HTMLImageElement | undefined;
          if (t.overlayImageUrl) {
            overlayImg = overlayCache.current.get(t.overlayImageUrl);
            if (!overlayImg) {
              try {
                overlayImg = await loadImage(t.overlayImageUrl);
                overlayCache.current.set(t.overlayImageUrl, overlayImg);
              } catch {
                overlayImg = undefined;
              }
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = THUMB_SIZE;
          canvas.height = Math.round((THUMB_SIZE * t.canvasHeight) / t.canvasWidth);
          renderComposite({
            canvas,
            canvasWidth: t.canvasWidth,
            canvasHeight: t.canvasHeight,
            overlayImage: overlayImg ?? null,
            photoImage: photoImg,
            photoArea: t.photoArea,
            textAreas: t.textAreas,
            textValues: {},
          });
          next[t.id] = canvas.toDataURL("image/jpeg", 0.85);
        }
        if (!cancelled) setThumbs(next);
      } catch {
        toast.error("Couldn't process that photo. Try another image.");
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [photoUrl, templates]);

  if (templates.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        No designs have been added to <strong>{categoryName}</strong> yet. Check back soon!
      </div>
    );
  }

  return (
    <div>
      {!photoUrl ? (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-3xl py-16 px-6 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-brand-500 bg-brand-50" : "border-gray-300 hover:border-brand-400 hover:bg-cream-50"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-10 h-10 text-brand-500" />
          <p className="font-display text-lg font-bold text-gray-800">Upload one photo to preview it on every {categoryName} design</p>
          <p className="text-sm text-gray-500 max-w-md">
            We&apos;ll automatically fit your photo into all {templates.length} designs below — pick your favourite, then fine-tune the crop and add names, dates or a message.
          </p>
          <Button className="mt-2 rounded-2xl">Choose Photo</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6 bg-cream-50 border border-cream-200 rounded-2xl px-5 py-3">
            <div className="flex items-center gap-3">
              <img src={photoUrl} alt="Your upload" className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Your photo is applied to all {templates.length} designs</p>
                <p className="text-xs text-gray-500">Tap a design below to fine-tune the crop and add text.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setPhotoUrl(null);
                setThumbs({});
              }}
              className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <RefreshCcw className="w-4 h-4" /> Use a different photo
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t)}
                className="group text-left bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-brand-300 transition-all"
              >
                <div className="relative aspect-square bg-gray-100">
                  {thumbs[t.id] ? (
                    <img src={thumbs[t.id]} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 bg-white/95 text-brand-600 text-xs font-bold px-3 py-1.5 rounded-full">
                      <Wand2 className="w-3.5 h-3.5" /> Customize
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800 truncate">{t.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-brand-600 font-bold text-sm">{formatPrice(t.basePrice)}</span>
                    {t.comparePrice && (
                      <span className="text-gray-400 text-xs line-through">{formatPrice(t.comparePrice)}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {rendering && (
            <p className="text-center text-xs text-gray-400 mt-4">Rendering remaining previews…</p>
          )}
        </>
      )}

      {activeTemplate && photoUrl && (
        <FrameStudio
          template={activeTemplate}
          photoUrl={photoUrl}
          onClose={() => setActiveTemplate(null)}
        />
      )}
    </div>
  );
}
