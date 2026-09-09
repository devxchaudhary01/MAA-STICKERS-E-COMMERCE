import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { emptyPhotoArea } from "@/lib/mockup";
import FrameGallery, { type GalleryTemplate } from "@/components/gallery/FrameGallery";

export const dynamic = "force-dynamic";

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!category || !category.isActive) notFound();

  // Parent categories (e.g. "Acrylic Wall") just show their subcategory tiles.
  if (category.children.length > 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Breadcrumbs category={category} />
        <h1 className="font-display text-3xl font-bold text-gray-800 mt-2 mb-2">{category.name}</h1>
        {category.description && <p className="text-gray-500 mb-8 max-w-2xl">{category.description}</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {category.children.map((sub) => (
            <Link
              key={sub.id}
              href={`/categories/${sub.slug}`}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {sub.imageUrl && (
                <Image src={sub.imageUrl} alt={sub.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="400px" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent flex items-end p-4">
                <h2 className="text-white font-display font-bold text-lg">{sub.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Leaf GALLERY category: upload-once auto-mockup customizer.
  if (category.type === "GALLERY") {
    const rows = await prisma.product.findMany({
      where: { categoryId: category.id, isGalleryTemplate: true, isActive: true },
      orderBy: { createdAt: "asc" },
    });
    const templates: GalleryTemplate[] = rows.map((t) => ({
      id: t.id,
      name: t.name,
      basePrice: t.basePrice,
      comparePrice: t.comparePrice,
      overlayImageUrl: t.overlayImageUrl,
      canvasWidth: t.canvasWidth,
      canvasHeight: t.canvasHeight,
      photoArea: t.photoArea ? JSON.parse(t.photoArea) : emptyPhotoArea(),
      textAreas: JSON.parse(t.textAreas || "[]"),
    }));

    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Breadcrumbs category={category} />
        <h1 className="font-display text-3xl font-bold text-gray-800 mt-2 mb-2">{category.name}</h1>
        {category.description && <p className="text-gray-500 mb-8 max-w-2xl">{category.description}</p>}
        <FrameGallery categoryName={category.name} templates={templates} />
      </div>
    );
  }

  // Leaf STANDARD category: fall back to the regular product grid, filtered.
  const products = await prisma.product.findMany({
    where: { categoryId: category.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Breadcrumbs category={category} />
      <h1 className="font-display text-3xl font-bold text-gray-800 mt-2 mb-6">{category.name}</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.map((p) => (
          <Link key={p.id} href={`/products/${p.slug}`} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-square bg-gray-100">
              <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="300px" />
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
              <p className="text-brand-600 font-bold text-sm mt-1">₹{p.basePrice}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Breadcrumbs({ category }: { category: { name: string; parent: { name: string; slug: string } | null } }) {
  return (
    <nav className="text-xs text-gray-500 flex items-center gap-1.5">
      <Link href="/categories" className="hover:text-brand-600">Categories</Link>
      {category.parent && (
        <>
          <span>/</span>
          <Link href={`/categories/${category.parent.slug}`} className="hover:text-brand-600">{category.parent.name}</Link>
        </>
      )}
      <span>/</span>
      <span className="text-gray-700 font-medium">{category.name}</span>
    </nav>
  );
}
