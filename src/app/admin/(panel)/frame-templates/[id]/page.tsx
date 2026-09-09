"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Plus, Save } from "lucide-react";
import toast from "react-hot-toast";
import SlotEditor from "@/components/admin/SlotEditor";
import { emptyPhotoArea, newTextArea, type PhotoArea, type TextArea } from "@/lib/mockup";

interface Category { id: string; name: string; type: string; parent?: { name: string } | null }

export default function FrameTemplateEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState("499");
  const [canvasWidth, setCanvasWidth] = useState(1000);
  const [canvasHeight, setCanvasHeight] = useState(1000);
  const [overlayImageUrl, setOverlayImageUrl] = useState<string | null>(null);
  const [photoArea, setPhotoArea] = useState<PhotoArea>(emptyPhotoArea());
  const [textAreas, setTextAreas] = useState<TextArea[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then((all: Category[]) =>
      setCategories(all.filter((c) => c.type === "GALLERY"))
    );
  }, []);

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/admin/frame-templates/${params.id}`)
      .then((r) => r.json())
      .then((t) => {
        setName(t.name);
        setDescription(t.description ?? "");
        setCategoryId(t.categoryId);
        setBasePrice(String(t.basePrice));
        setCanvasWidth(t.canvasWidth);
        setCanvasHeight(t.canvasHeight);
        setOverlayImageUrl(t.overlayImageUrl);
        setPhotoArea(t.photoArea);
        setTextAreas(t.textAreas);
      })
      .finally(() => setLoading(false));
  }, [isNew, params.id]);

  const handleUploadOverlay = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOverlayImageUrl(data.url);
      // Pick up the artwork's real pixel dimensions as the reference canvas size.
      const img = new Image();
      img.onload = () => {
        setCanvasWidth(img.naturalWidth);
        setCanvasHeight(img.naturalHeight);
      };
      img.src = data.url;
      toast.success("Overlay image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const addTextArea = () => {
    const t = newTextArea(`text-${Date.now()}`);
    setTextAreas((prev) => [...prev, t]);
    setSelectedTextId(t.id);
  };

  const selected = textAreas.find((t) => t.id === selectedTextId) ?? null;
  const updateSelected = (patch: Partial<TextArea>) => {
    if (!selectedTextId) return;
    setTextAreas((prev) => prev.map((t) => (t.id === selectedTextId ? { ...t, ...patch } : t)));
  };

  const save = async () => {
    if (!name || !categoryId) return toast.error("Name and category are required");
    if (!overlayImageUrl) return toast.error("Please upload the frame/clock artwork first");
    setSaving(true);
    try {
      const payload = { name, description, categoryId, basePrice, overlayImageUrl, canvasWidth, canvasHeight, photoArea, textAreas };
      const res = isNew
        ? await fetch("/api/admin/frame-templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch(`/api/admin/frame-templates/${params.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(isNew ? "Design created" : "Design saved");
      if (isNew) router.replace(`/admin/frame-templates/${data.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-60"><div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/frame-templates" className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-lg font-semibold text-white">{isNew ? "New Design" : `Edit: ${name}`}</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Design Details</h2>
          <LabeledInput label="Design Name *" value={name} onChange={setName} placeholder="e.g. Golden Heart Birth Frame" />
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Subcategory *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500">
              <option value="">Select a Gallery subcategory</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.parent ? `${c.parent.name} → ` : ""}{c.name}</option>)}
            </select>
          </div>
          <LabeledInput label="Price (₹) *" value={basePrice} onChange={setBasePrice} type="number" />
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white resize-none focus:outline-none focus:border-brand-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Frame / Clock Artwork (PNG, transparent photo window) *</label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-700 rounded-xl py-6 cursor-pointer hover:border-brand-500 transition-colors text-gray-400 hover:text-brand-400">
              <input type="file" accept="image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && handleUploadOverlay(e.target.files[0])} />
              <UploadCloud className="w-5 h-5" /> {uploading ? "Uploading…" : overlayImageUrl ? "Replace artwork" : "Upload artwork"}
            </label>
          </div>

          {selected && (
            <div className="border-t border-gray-800 pt-4">
              <h3 className="text-sm font-semibold text-white mb-3">Selected Text Field</h3>
              <LabeledInput label="Label / Placeholder" value={selected.placeholder} onChange={(v) => updateSelected({ placeholder: v })} />
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Default font size</label>
                  <input type="number" value={selected.fontSize} onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Default color</label>
                  <input type="color" value={selected.color} onChange={(e) => updateSelected({ color: e.target.value })} className="w-full h-9 rounded-xl border border-gray-700 bg-gray-800" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slot editor */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Photo &amp; Text Placement</h2>
            <button onClick={addTextArea} className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300">
              <Plus className="w-3.5 h-3.5" /> Add Text Field
            </button>
          </div>
          {overlayImageUrl ? (
            <SlotEditor
              overlayImageUrl={overlayImageUrl}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              photoArea={photoArea}
              onPhotoAreaChange={setPhotoArea}
              textAreas={textAreas}
              selectedTextId={selectedTextId}
              onSelectText={setSelectedTextId}
              onTextAreaChange={(id, box) => setTextAreas((prev) => prev.map((t) => (t.id === id ? { ...t, ...box } : t)))}
              onDeleteText={(id) => {
                setTextAreas((prev) => prev.filter((t) => t.id !== id));
                if (selectedTextId === id) setSelectedTextId(null);
              }}
            />
          ) : (
            <p className="text-sm text-gray-500 py-10 text-center">Upload the artwork on the left to place the photo window and text fields.</p>
          )}
        </div>
      </div>

      <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
        <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Design"}
      </button>
    </div>
  );
}

function LabeledInput({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500" />
    </div>
  );
}
