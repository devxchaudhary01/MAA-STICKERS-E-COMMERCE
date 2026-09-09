"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

interface Category {
  id: string; name: string; slug: string; type: string; parentId: string | null; parent?: { name: string } | null;
}
interface Template {
  id: string; name: string; basePrice: number; overlayImageUrl: string | null; isActive: boolean;
  category?: { id: string; name: string };
}

export default function FrameTemplatesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then((all: Category[]) =>
      setCategories(all.filter((c) => c.type === "GALLERY"))
    );
  }, []);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/frame-templates${filter ? `?categoryId=${filter}` : ""}`)
      .then((r) => r.json())
      .then(setTemplates)
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const toggleActive = async (t: Template) => {
    await fetch(`/api/admin/frame-templates/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !t.isActive }),
    });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold text-white">Frame / Clock Designs</h1>
          <p className="text-sm text-gray-500">Each design here is a template inside a &quot;Gallery&quot; subcategory (Acrylic Wall → Birth, Wall Clock → Love, etc.). Customers upload one photo and see it auto-applied to every design.</p>
        </div>
        <Link href="/admin/frame-templates/new" className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl">
          <Plus className="w-4 h-4" /> Add Design
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-sm text-gray-400">
          No &quot;Gallery&quot; subcategories yet. Go to <Link href="/admin/categories" className="text-brand-400 underline">Categories</Link> and mark a subcategory (e.g. Acrylic Wall → Birth) as Gallery type first.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setFilter("")} className={cn("text-xs font-semibold px-3 py-1.5 rounded-full", !filter ? "bg-brand-500 text-white" : "bg-gray-800 text-gray-400")}>All</button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={cn("text-xs font-semibold px-3 py-1.5 rounded-full", filter === c.id ? "bg-brand-500 text-white" : "bg-gray-800 text-gray-400")}
              >
                {c.parent ? `${c.parent.name} → ` : ""}{c.name}
              </button>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : templates.length === 0 ? (
              <p className="text-center text-gray-500 py-14 text-sm">No designs yet — click &quot;Add Design&quot; to create one.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-800">
                {templates.map((t) => (
                  <div key={t.id} className="bg-gray-900 p-3">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 mb-2">
                      {t.overlayImageUrl && <Image src={t.overlayImageUrl} alt={t.name} fill className="object-contain" sizes="200px" />}
                    </div>
                    <p className="text-sm font-medium text-white truncate">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.category?.name} · {formatPrice(t.basePrice)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Link href={`/admin/frame-templates/${t.id}`} className="flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button onClick={() => toggleActive(t)} className="text-gray-400 hover:text-white">
                        {t.isActive ? <ToggleRight className="w-5 h-5 text-brand-400" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
