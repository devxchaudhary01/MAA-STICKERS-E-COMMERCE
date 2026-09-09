"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { Move, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PhotoArea, TextArea } from "@/lib/mockup";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SlotEditorProps {
  overlayImageUrl: string | null;
  canvasWidth: number;
  canvasHeight: number;
  photoArea: PhotoArea;
  onPhotoAreaChange: (a: PhotoArea) => void;
  textAreas: TextArea[];
  selectedTextId: string | null;
  onSelectText: (id: string | null) => void;
  onTextAreaChange: (id: string, box: Box) => void;
  onDeleteText: (id: string) => void;
}

/** A single draggable + resizable normalized-coordinate box, positioned as % over the
 *  parent editor surface. Shared implementation for the photo slot and every text slot. */
function DraggableBox({
  box,
  color,
  label,
  active,
  onChange,
  onSelect,
  onDelete,
}: {
  box: Box;
  color: string;
  label: string;
  active: boolean;
  onChange: (box: Box) => void;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  const dragRef = useRef<{ mode: "move" | "resize"; startX: number; startY: number; startBox: Box } | null>(null);

  const startDrag = (e: React.PointerEvent, mode: "move" | "resize") => {
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, startBox: box };
    const parent = (e.target as HTMLElement).closest("[data-slot-surface]") as HTMLElement | null;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();

    const onMove = (ev: PointerEvent) => {
      if (!dragRef.current) return;
      const dxN = (ev.clientX - dragRef.current.startX) / rect.width;
      const dyN = (ev.clientY - dragRef.current.startY) / rect.height;
      const sb = dragRef.current.startBox;
      if (dragRef.current.mode === "move") {
        onChange({
          ...sb,
          x: Math.min(Math.max(sb.x + dxN, 0), 1 - sb.width),
          y: Math.min(Math.max(sb.y + dyN, 0), 1 - sb.height),
        });
      } else {
        onChange({
          ...sb,
          width: Math.min(Math.max(sb.width + dxN, 0.04), 1 - sb.x),
          height: Math.min(Math.max(sb.height + dyN, 0.04), 1 - sb.y),
        });
      }
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      onPointerDown={(e) => startDrag(e, "move")}
      className={cn(
        "absolute border-2 flex items-start justify-between cursor-move select-none group",
        active ? "z-20 shadow-lg" : "z-10 opacity-80 hover:opacity-100"
      )}
      style={{
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.width * 100}%`,
        height: `${box.height * 100}%`,
        borderColor: color,
        background: `${color}22`,
      }}
    >
      <span
        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-br-md text-white truncate max-w-full"
        style={{ background: color }}
      >
        {label}
      </span>
      <div className="flex items-center gap-1 p-0.5">
        {onDelete && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="bg-white/90 rounded p-0.5 hover:bg-red-100"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
          </button>
        )}
      </div>
      <div
        onPointerDown={(e) => startDrag(e, "resize")}
        className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-white cursor-se-resize"
        style={{ background: color }}
      />
      <Move className="w-3 h-3 text-white/70 absolute bottom-0.5 left-0.5 opacity-0 group-hover:opacity-100" />
    </div>
  );
}

export default function SlotEditor({
  overlayImageUrl,
  canvasWidth,
  canvasHeight,
  photoArea,
  onPhotoAreaChange,
  textAreas,
  selectedTextId,
  onSelectText,
  onTextAreaChange,
  onDeleteText,
}: SlotEditorProps) {
  const aspect = canvasWidth / canvasHeight || 1;

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">
        Drag boxes to reposition, drag the bottom-right dot to resize. The orange box is the customer&apos;s photo window; each blue box is an editable text field.
      </p>
      <div
        data-slot-surface
        onPointerDown={() => onSelectText(null)}
        className="relative w-full max-w-xl mx-auto bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#f9fafb_0%_50%)] bg-[length:20px_20px] rounded-xl overflow-hidden border border-gray-700"
        style={{ aspectRatio: `${aspect}` }}
      >
        {overlayImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={overlayImageUrl} alt="Frame overlay" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
        )}
        <DraggableBox
          box={photoArea}
          color="#f97316"
          label="Photo"
          active={selectedTextId === null}
          onChange={(b) => onPhotoAreaChange({ ...photoArea, ...b })}
          onSelect={() => onSelectText(null)}
        />
        {textAreas.map((t) => (
          <DraggableBox
            key={t.id}
            box={t}
            color="#3b82f6"
            label={t.placeholder || "Text"}
            active={selectedTextId === t.id}
            onChange={(b) => onTextAreaChange(t.id, b)}
            onSelect={() => onSelectText(t.id)}
            onDelete={() => onDeleteText(t.id)}
          />
        ))}
      </div>
    </div>
  );
}
