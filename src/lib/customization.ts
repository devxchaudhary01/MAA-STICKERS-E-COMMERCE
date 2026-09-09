import { getFrame } from "./frames";

export interface ParsedCustomization {
  frameName?: string;
  note?: string;
}

/** Reads the `customization` field. Supports two shapes:
 *  - Legacy customizer items: `{ frame, note }`
 *  - Frame/Clock Gallery items: `{ textValues: Record<string,string>, ... }`
 *  Anything else (or invalid JSON) falls back to treating it as a freeform note. */
export function parseCustomization(raw?: string | null): ParsedCustomization {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      if (parsed.textValues && typeof parsed.textValues === "object") {
        const entries = Object.values(parsed.textValues as Record<string, string>).filter(Boolean);
        return { note: entries.length ? entries.join(" · ") : undefined };
      }
      return {
        frameName: parsed.frame ? getFrame(parsed.frame).name : undefined,
        note: parsed.note || undefined,
      };
    }
  } catch {
    return { note: raw };
  }
  return {};
}
