"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import {
  Star, ShoppingCart, Heart, Share2, Upload, CheckCircle,
  Truck, Shield, RotateCcw, ChevronLeft, Plus, Minus, Pencil, X
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import PhotoCustomizer, { CustomizerResult } from "@/components/customizer/PhotoCustomizer";
import Rotate3DPreview from "@/components/customizer/Rotate3DPreview";
import { getFrame } from "@/lib/frames";

// Mock product data — replace with API call
const MOCK_PRODUCTS: Record<string, {
  id: string; name: string; slug: string; description: string;
  basePrice: number; comparePrice?: number; imageUrl: string;
  images: string[]; isCustomizable: boolean; isFeatured: boolean;
  category: string; details: string[]; variants: Array<{ name: string; options: string[] }>;
}> = {
  "custom-photo-sticker-sheet": {
    id: "1", name: "Custom Photo Sticker Sheet", slug: "custom-photo-sticker-sheet",
    category: "Stickers",
    description: "Create your own sticker sheet with 12 premium die-cut stickers from your favourite photos. Waterproof, UV-resistant, and perfect for laptops, bottles, notebooks, and more! Each sticker is individually die-cut to the shape of your photo.",
    basePrice: 249, comparePrice: 399,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571935300617-d81a4c37a573?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop",
    ],
    isCustomizable: true, isFeatured: true,
    details: [
      "12 individually die-cut stickers per sheet",
      "Premium vinyl — waterproof & UV-resistant",
      "Dimensions: ~4cm × 4cm each (customizable)",
      "Vibrant full-color printing",
      "Ships within 2-3 business days",
    ],
    variants: [
      { name: "Size", options: ["Small (3×3 cm)", "Medium (4×4 cm)", "Large (5×5 cm)"] },
      { name: "Finish", options: ["Glossy", "Matte", "Transparent"] },
    ],
  },
  "personalised-fridge-magnet": {
    id: "3", name: "Personalised Fridge Magnet", slug: "personalised-fridge-magnet",
    category: "Magnets",
    description: "A high-quality fridge magnet printed with your favourite photo or design. Available in multiple sizes and shapes. Made with strong neodymium magnets — holds firmly on any metal surface.",
    basePrice: 179, comparePrice: 279,
    imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=600&fit=crop",
    ],
    isCustomizable: true, isFeatured: true,
    details: [
      "Strong magnetic backing",
      "High-resolution photo printing",
      "Available in square, round & heart shapes",
      "Size: 3\" × 3\" (standard)",
      "Water-resistant coating",
    ],
    variants: [
      { name: "Shape", options: ["Square", "Round", "Heart"] },
      { name: "Size", options: ["2\" × 2\"", "3\" × 3\"", "4\" × 4\""] },
    ],
  },
  "acrylic-photo-keychain": {
    id: "5", name: "Acrylic Photo Keychain", slug: "acrylic-photo-keychain",
    category: "Keychains",
    description: "Crystal-clear acrylic keychain with your favourite photo. Lightweight, durable, and the perfect gift for every occasion. Comes with a silver key ring.",
    basePrice: 149, comparePrice: 249,
    imageUrl: "https://images.unsplash.com/photo-1583394293214-41cb213e2e55?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1583394293214-41cb213e2e55?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
    ],
    isCustomizable: true, isFeatured: true,
    details: [
      "Premium clear acrylic — 3mm thick",
      "Vibrant UV printing",
      "Size: 5cm × 5cm (approx.)",
      "Silver stainless steel key ring",
      "Scratch-resistant surface",
    ],
    variants: [
      { name: "Shape", options: ["Square", "Round", "Heart", "Custom shape"] },
    ],
  },
};

function getFallbackProduct(slug: string) {
  return MOCK_PRODUCTS[slug] || {
    id: slug, name: "Custom Product", slug,
    category: "Products",
    description: "A beautiful personalised product, crafted just for you.",
    basePrice: 299, comparePrice: 499,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"],
    isCustomizable: true, isFeatured: false,
    details: ["Premium quality", "Customizable", "Fast delivery"],
    variants: [],
  };
}

export default function ProductDetailClient({ slug }: { slug: string }) {
  const product = getFallbackProduct(slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showCustomPreview, setShowCustomPreview] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [customization, setCustomization] = useState<CustomizerResult | null>(null);
  const [specialNote, setSpecialNote] = useState("");
  const [wishlist, setWishlist] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setRawImageSrc(e.target?.result as string);
      setCustomization(null);
      setCustomizerOpen(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleCustomizerConfirm = (result: CustomizerResult) => {
    setCustomization(result);
    setCustomizerOpen(false);
    setShowCustomPreview(true); // jump the gallery straight to their design
    toast.success("Photo customized!");
  };

  const removePhoto = () => {
    setRawImageSrc(null);
    setCustomization(null);
    setShowCustomPreview(false);
  };

  const handleAddToCart = () => {
    if (product.isCustomizable && !customization) {
      toast.error("Please upload and customize your photo first!");
      return;
    }
    const variantText = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    const customizationPayload = customization || specialNote
      ? JSON.stringify({
          frame: customization?.frameId,
          note: specialNote || undefined,
        })
      : undefined;

    addItem({
      id: uuidv4(),
      productId: product.id,
      name: product.name,
      image: product.imageUrl,
      price: product.basePrice,
      quantity,
      variantInfo: variantText || undefined,
      customization: customizationPayload,
      uploadedImage: customization?.imageDataUrl || undefined,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const discount = product.comparePrice
    ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-cream-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-600">Products</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream-100 mb-3 shadow-card">
              {showCustomPreview && customization ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cream-50 to-cream-200 p-4">
                  <Rotate3DPreview
                    src={customization.imageDataUrl}
                    alt="Your customized photo"
                    size={340}
                    autoSpin
                    showControls={false}
                    className="w-full"
                  />
                  <span className="absolute inset-x-0 bottom-4 text-center text-xs font-medium text-gray-500">
                    Drag to rotate your design · double-tap to reset
                  </span>
                </div>
              ) : (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {discount}% OFF
                </span>
              )}
            </div>
            {(customization || product.images.length > 1) && (
              <div className="flex gap-2">
                {customization && (
                  <button
                    onClick={() => setShowCustomPreview(true)}
                    title="Your customized photo"
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 bg-white transition-all ${
                      showCustomPreview ? "border-brand-500 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={customization.imageDataUrl} alt="Your photo" fill className="object-contain p-1.5" sizes="80px" />
                    <span className="absolute inset-x-0 bottom-0 bg-brand-500/90 text-white text-[10px] font-semibold py-0.5 text-center">
                      Your photo
                    </span>
                  </button>
                )}
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedImage(i);
                      setShowCustomPreview(false);
                    }}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i && !showCustomPreview
                        ? "border-brand-500 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <Badge variant="orange" className="mb-3">{product.category}</Badge>
            <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-gold-400 text-gold-400" />)}
              </div>
              <span className="text-sm text-gray-500">4.9 (48 reviews)</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-brand-600">{formatPrice(product.basePrice)}</span>
              {product.comparePrice && (
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
              )}
              {discount > 0 && (
                <Badge variant="red">Save {formatPrice(product.comparePrice! - product.basePrice)}</Badge>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Variants */}
            {product.variants.map((variant) => (
              <div key={variant.name} className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {variant.name}
                  {selectedVariants[variant.name] && (
                    <span className="text-brand-500 font-normal ml-2">— {selectedVariants[variant.name]}</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: opt }))}
                      className={`px-4 py-2 rounded-xl text-sm border-2 font-medium transition-all ${
                        selectedVariants[variant.name] === opt
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-gray-200 text-gray-600 hover:border-brand-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Photo Upload */}
            {product.isCustomizable && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Your Photo <span className="text-red-500">*</span>
                </label>
                {customization ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-brand-300 bg-brand-50 p-3 flex items-center gap-4">
                    <Rotate3DPreview
                      src={customization.imageDataUrl}
                      alt="Customized photo"
                      size={84}
                      autoSpin
                      showControls={false}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-green-600 font-medium mb-1">
                        <CheckCircle className="w-4 h-4" /> Photo customized!
                      </div>
                      <p className="text-sm text-gray-500 truncate">Frame: {getFrame(customization.frameId).name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Drag the preview to rotate it in 3D</p>
                    </div>
                    <button
                      onClick={() => setCustomizerOpen(true)}
                      className="text-gray-400 hover:text-brand-600 transition-colors"
                      aria-label="Edit photo"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={removePhoto}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-300 hover:border-brand-400 hover:bg-cream-100"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 text-brand-400 mx-auto mb-3" />
                    <p className="font-medium text-gray-700 mb-1">
                      {isDragActive ? "Drop your photo here!" : "Drag & drop your photo"}
                    </p>
                    <p className="text-sm text-gray-400">or click to browse · JPG, PNG, WEBP · Max 10MB</p>
                  </div>
                )}
              </div>
            )}

            {/* Special note */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions (optional)</label>
              <textarea
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                placeholder="E.g. 'Add text: Happy Birthday Maa' or 'Remove background'…"
                rows={2}
                className="input resize-none"
              />
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button size="lg" onClick={handleAddToCart} className="flex-1 rounded-2xl">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart — {formatPrice(product.basePrice * quantity)}
              </Button>

              <button
                onClick={() => setWishlist(!wishlist)}
                className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-xl hover:border-red-300 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlist ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              </button>
            </div>

            {/* Delivery info */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-cream-100 rounded-2xl">
              {[
                { icon: Truck, label: "Free delivery", sub: "Orders ₹499+" },
                { icon: Shield, label: "Quality guaranteed", sub: "Or we reprint" },
                { icon: RotateCcw, label: "Easy returns", sub: "7-day policy" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <item.icon className="w-5 h-5 text-brand-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Product details */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Product Details</h3>
              <ul className="space-y-2">
                {product.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {rawImageSrc && (
        <PhotoCustomizer
          open={customizerOpen}
          imageSrc={rawImageSrc}
          initial={customization ?? undefined}
          onClose={() => setCustomizerOpen(false)}
          onConfirm={handleCustomizerConfirm}
        />
      )}
    </div>
  );
}
