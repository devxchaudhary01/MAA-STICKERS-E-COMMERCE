"use client";
import { useEffect, useState } from "react";
import { Plus, X, Check, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  parent?: Category | null;
  type: "STANDARD" | "GALLERY";
  sortOrder: number;
  isActive: boolean;
  children: Category[];
  _count?: { products: number };
}

const emptyForm: { name: string; description: string; imageUrl: string; parentId: string; type: "STANDARD" | "GALLERY"; sortOrder: string } = { name: "", description: "", imageUrl: "", parentId: "", type: "STANDARD", sortOrder: "0" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const roots = categories.filter((c) => !c.parentId);
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id);

  const submit = async () => {
    if (!form.name) return toast.error("Name is required");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, parentId: form.parentId || null }),
      });
      if (!res.ok) throw new Error();
      toast.success("Category created");
      setForm(emptyForm);
      setShowAdd(false);
      load();
    } catch {
      toast.error("Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const toggleType = async (c: Category) => {
    await fetch(`/api/admin/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: c.type === "GALLERY" ? "STANDARD" : "GALLERY" }),
    });
    load();
    toast.success(c.type === "GALLERY" ? "Switched to standard grid" : "Switched to photo-gallery customizer");
  };

  const toggleActive = async (c: Category) => {
    await fetch(`/api/admin/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Categories</h1>
          <p className="text-sm text-gray-500">Create parent categories (e.g. Acrylic Wall) and subcategories (e.g. Birth, Love, Dual). Mark a subcategory as &quot;Gallery&quot; to enable the upload-once auto-mockup customizer.</p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showAdd && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">New Category</h3>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name *" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g. Birth" />
            <Field label="Cover Image URL" value={form.imageUrl} onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))} placeholder="https://…" />
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Parent Category</label>
              <select
                value={form.parentId}
                onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="">— None (top-level) —</option>
                {roots.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "STANDARD" | "GALLERY" }))}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="STANDARD">Standard product grid</option>
                <option value="GALLERY">Photo-gallery customizer (frames / clocks)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white resize-none focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={submit} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
              {saving ? "Saving…" : <><Check className="w-4 h-4" /> Create</>}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 border border-gray-700 text-gray-400 hover:text-white text-sm font-medium rounded-xl">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          roots.map((root) => (
            <div key={root.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <span className={cn("font-semibold", root.isActive ? "text-white" : "text-gray-500 line-through")}>{root.name}</span>
                  <span className="text-xs text-gray-500">/{root.slug}</span>
                </div>
                <button onClick={() => toggleActive(root)} className="text-gray-400 hover:text-white">
                  {root.isActive ? <ToggleRight className="w-6 h-6 text-brand-400" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              <div className="divide-y divide-gray-800">
                {childrenOf(root.id).length === 0 ? (
                  <p className="text-sm text-gray-500 px-5 py-3">No subcategories yet — add one above with this as the parent.</p>
                ) : (
                  childrenOf(root.id).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className={cn("text-sm font-medium", sub.isActive ? "text-white" : "text-gray-500 line-through")}>{sub.name}</p>
                        <p className="text-xs text-gray-500">{sub._count?.products ?? 0} designs</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleType(sub)}
                          className={cn(
                            "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
                            sub.type === "GALLERY" ? "bg-brand-500/20 text-brand-400" : "bg-gray-800 text-gray-400"
                          )}
                        >
                          <Sparkles className="w-3 h-3" /> {sub.type === "GALLERY" ? "Gallery" : "Standard"}
                        </button>
                        <button onClick={() => toggleActive(sub)} className="text-gray-400 hover:text-white">
                          {sub.isActive ? <ToggleRight className="w-5 h-5 text-brand-400" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
      />
    </div>
  );
}
