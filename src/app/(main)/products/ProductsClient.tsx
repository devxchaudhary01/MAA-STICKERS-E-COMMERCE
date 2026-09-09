"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, Star, ShoppingCart, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";
import type { Product } from "@/types";
import { v4 as uuidv4 } from "uuid";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Stickers", value: "stickers" },
  { label: "Magnets", value: "magnets" },
  { label: "Keychains", value: "keychains" },
  { label: "Wall Decor", value: "wall-decor" },
  { label: "Albums", value: "albums" },
  { label: "Name Plates", value: "nameplates" },
];

const SORT_OPTIONS = [
  { label: "Popular", value: "popular" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
];

// Static products for now — will be replaced by API once DB is seeded
const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Custom Photo Sticker Sheet", slug: "custom-photo-sticker-sheet", description: "12 premium die-cut stickers printed from your favourite photos. Perfect for laptops, bottles & more!", basePrice: 249, comparePrice: 399, imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop", images: [], categoryId: "stickers", isCustomizable: true, isFeatured: true, tags: ["stickers", "popular"] },
  { id: "2", name: "Round Sticker Pack (30 pcs)", slug: "round-sticker-pack", description: "Set of 30 circular stickers with your design or photo. Waterproof & UV-resistant.", basePrice: 199, comparePrice: 299, imageUrl: "https://images.unsplash.com/photo-1571935300617-d81a4c37a573?w=400&h=400&fit=crop", images: [], categoryId: "stickers", isCustomizable: true, isFeatured: false, tags: ["stickers"] },
  { id: "3", name: "Personalised Fridge Magnet", slug: "personalised-fridge-magnet", description: "High-resolution fridge magnet with your photo. Available in multiple sizes.", basePrice: 179, comparePrice: 279, imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop", images: [], categoryId: "magnets", isCustomizable: true, isFeatured: true, tags: ["magnets", "popular"] },
  { id: "4", name: "Magnetic Photo Collage", slug: "magnetic-photo-collage", description: "Beautiful 4-in-1 magnetic collage for your fridge. Tell your story in photos.", basePrice: 349, comparePrice: 499, imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=400&fit=crop", images: [], categoryId: "magnets", isCustomizable: true, isFeatured: false, tags: ["magnets"] },
  { id: "5", name: "Acrylic Photo Keychain", slug: "acrylic-photo-keychain", description: "Crystal-clear acrylic keychain with your favourite photo. Lightweight & durable.", basePrice: 149, comparePrice: 249, imageUrl: "https://images.unsplash.com/photo-1583394293214-41cb213e2e55?w=400&h=400&fit=crop", images: [], categoryId: "keychains", isCustomizable: true, isFeatured: true, tags: ["keychains", "popular"] },
  { id: "6", name: "Metal Heart Keychain", slug: "metal-heart-keychain", description: "Engraved metal keychain in a heart shape. Perfect for couples & best friends.", basePrice: 299, comparePrice: 449, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop", images: [], categoryId: "keychains", isCustomizable: true, isFeatured: false, tags: ["keychains"] },
  { id: "7", name: "Wall Photo Collage (6 photos)", slug: "wall-photo-collage", description: "6-photo premium wall collage. Great for birthdays, anniversaries, and housewarming gifts.", basePrice: 449, comparePrice: 699, imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop", images: [], categoryId: "wall-decor", isCustomizable: true, isFeatured: true, tags: ["wall-decor", "popular"] },
  { id: "8", name: "Acrylic Name Plate", slug: "acrylic-name-plate", description: "Elegant acrylic name plate for homes and offices. Customise with your family name.", basePrice: 599, comparePrice: 899, imageUrl: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=400&fit=crop", images: [], categoryId: "nameplates", isCustomizable: true, isFeatured: false, tags: ["nameplates"] },
];

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchesCategory = !selectedCategory || p.tags.includes(selectedCategory);
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sort === "price_asc") return a.basePrice - b.basePrice;
    if (sort === "price_desc") return b.basePrice - a.basePrice;
    return 0;
  });

  const handleQuickAdd = (product: Product) => {
    if (product.isCustomizable) {
      window.location.href = `/products/${product.slug}`;
      return;
    }
    addItem({
      id: uuidv4(),
      productId: product.id,
      name: product.name,
      image: product.imageUrl,
      price: product.basePrice,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-cream-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">All Products</h1>
          <p className="text-gray-500">Personalised gifts crafted with love — {filtered.length} products found</p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input w-auto min-w-[180px] bg-white"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-2 btn-secondary"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className={cn(
            "w-56 flex-shrink-0",
            showFilters ? "block" : "hidden sm:block"
          )}>
            <div className="card p-5 sticky top-24">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Categories</h3>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedCategory === cat.value
                        ? "bg-brand-500 text-white font-medium"
                        : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4" strokeWidth={1.5} />
                <p className="font-medium">No products found</p>
                <p className="text-sm mt-1">Try a different search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((product) => {
                  const discount = product.comparePrice
                    ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
                    : 0;
                  return (
                    <div key={product.id} className="card group overflow-hidden flex flex-col">
                      <Link href={`/products/${product.slug}`} className="relative block">
                        <div className="relative aspect-square bg-cream-100 overflow-hidden">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, 25vw"
                          />
                        </div>
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {discount}% OFF
                          </span>
                        )}
                        {product.isFeatured && (
                          <span className="absolute top-2 right-2 bg-gold-400 text-maroon-900 text-xs font-bold p-1 rounded-full">
                            <Star className="w-3 h-3 fill-current" />
                          </span>
                        )}
                      </Link>
                      <div className="p-3 flex flex-col flex-1">
                        <div className="flex items-center gap-0.5 mb-1">
                          {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-gold-400 text-gold-400" />)}
                          <span className="text-xs text-gray-400 ml-1">(24)</span>
                        </div>
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="font-semibold text-sm text-gray-800 hover:text-brand-600 transition-colors line-clamp-2 mb-1">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-brand-600">{formatPrice(product.basePrice)}</span>
                            {product.comparePrice && (
                              <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.comparePrice)}</span>
                            )}
                          </div>
                          <Button size="sm" onClick={() => handleQuickAdd(product)} className="text-xs px-3 py-1.5 rounded-lg">
                            <ShoppingCart className="w-3.5 h-3.5" />
                            {product.isCustomizable ? "Customize" : "Add"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
