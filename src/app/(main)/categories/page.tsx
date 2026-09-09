import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Shop by Category",
  description: "Browse Acrylic Wall Frames, Wall Clocks, and all personalised gifts by category.",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: { children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Shop by Category</h1>
      <p className="text-gray-500 mb-8">Pick a category — for Acrylic Wall Frames and Wall Clocks, upload one photo and see it on every design instantly.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
            <Link href={`/categories/${cat.slug}`} className="block relative aspect-[4/3] bg-gray-100">
              {cat.imageUrl && (
                <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" sizes="400px" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                <h2 className="text-white font-display font-bold text-lg">{cat.name}</h2>
              </div>
            </Link>
            {cat.children.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-3">
                {cat.children.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/categories/${sub.slug}`}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-cream-100 text-brand-700 hover:bg-brand-100 transition-colors"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
