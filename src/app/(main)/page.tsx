import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Star, Package, Truck, Shield, Palette,
  Heart, Gift, Sparkles, ChevronRight, Sticker, Magnet, Key,
  Frame, Album, Signpost, Check, Camera,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

const CATEGORIES = [
  { name: "Custom Stickers", slug: "stickers", icon: Sticker, color: "from-brand-400 to-brand-600", count: "50+ designs" },
  { name: "Fridge Magnets", slug: "magnets", icon: Magnet, color: "from-maroon-400 to-maroon-600", count: "30+ designs" },
  { name: "Keychains", slug: "keychains", icon: Key, color: "from-gold-400 to-gold-600", count: "25+ designs" },
  { name: "Wall Decor", slug: "wall-decor", icon: Frame, color: "from-brand-500 to-maroon-600", count: "40+ designs" },
  { name: "Photo Albums", slug: "albums", icon: Album, color: "from-gold-300 to-brand-500", count: "20+ designs" },
  { name: "Name Plates", slug: "nameplates", icon: Signpost, color: "from-maroon-300 to-maroon-500", count: "15+ designs" },
];

const FEATURED_PRODUCTS = [
  { id: "1", name: "Custom Photo Sticker Sheet", slug: "custom-photo-sticker-sheet", description: "12 die-cut stickers from your photos", basePrice: 249, comparePrice: 399, imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop", isFeatured: true, isCustomizable: true },
  { id: "2", name: "Personalised Fridge Magnet", slug: "personalised-fridge-magnet", description: "High-quality printed magnet with your photo", basePrice: 199, comparePrice: 299, imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop", isFeatured: false, isCustomizable: true },
  { id: "3", name: "Acrylic Photo Keychain", slug: "acrylic-photo-keychain", description: "Crystal clear acrylic with your favourite photo", basePrice: 149, comparePrice: 249, imageUrl: "https://images.unsplash.com/photo-1583394293214-41cb213e2e55?w=400&h=400&fit=crop", isFeatured: true, isCustomizable: true },
  { id: "4", name: "Wall Photo Collage", slug: "wall-photo-collage", description: "Beautiful 6-photo collage printed on premium paper", basePrice: 449, comparePrice: 699, imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop", isFeatured: false, isCustomizable: true },
];

const FEATURES = [
  { icon: Palette, title: "Easy Customization", desc: "Upload your photo, choose your design — done in minutes" },
  { icon: Package, title: "Premium Quality", desc: "Professional print quality that lasts for years" },
  { icon: Truck, title: "Fast Delivery", desc: "Delivered across India within 3–7 business days" },
  { icon: Shield, title: "Happiness Guarantee", desc: "Not happy? We'll reprint or refund — no questions asked" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", city: "Mumbai", rating: 5, text: "The stickers came out amazing! Perfect gift for my sister's birthday. The quality is top-notch and delivery was super fast!", product: "Custom Photo Stickers" },
  { name: "Rahul Verma", city: "Delhi", rating: 5, text: "Ordered a personalized keychain for my mom on Mother's Day. She absolutely loved it! Will definitely order again.", product: "Acrylic Keychain" },
  { name: "Sneha Patel", city: "Ahmedabad", rating: 5, text: "Beautiful fridge magnet with our family photo. The print quality is excellent and the colors are so vibrant!", product: "Fridge Magnet" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-warm min-h-[92vh] flex items-center">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-200 rounded-full opacity-30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-maroon-200 rounded-full opacity-20 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gold-300 rounded-full opacity-10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Personalized Gifts Made with Love
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-800 leading-tight mb-6">
                Gifts that{" "}
                <span className="text-gradient">tell your story</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
                Custom stickers, magnets, keychains & more — all personalised with your photos and memories.
                Delivered across India with love.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/products">
                  <Button size="lg" className="rounded-2xl">
                    Shop Now <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/products?category=stickers">
                  <Button size="lg" variant="secondary" className="rounded-2xl">
                    Custom Stickers
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8">
                {[
                  { value: "10,000+", label: "Happy Customers" },
                  { value: "4.9/5", label: "Average Rating" },
                  { value: "3-7 Days", label: "Delivery" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hero visual */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main hero image placeholder */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-brand-100 to-maroon-100 aspect-square max-w-md mx-auto">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <Gift className="w-20 h-20 text-brand-500 mx-auto mb-4" strokeWidth={1.5} />
                      <p className="text-brand-700 font-display font-bold text-2xl">Your Photo</p>
                      <p className="text-brand-600 text-sm mt-1">on everything you love</p>
                    </div>
                  </div>
                </div>
                {/* Floating cards */}
                <div className="absolute -top-6 -left-8 card p-3 flex items-center gap-2 shadow-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Check className="w-4 h-4" /></div>
                  <div className="text-xs">
                    <div className="font-semibold text-gray-800">Order Delivered!</div>
                    <div className="text-gray-500">Just now</div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-8 card p-3 flex items-center gap-2 shadow-lg">
                  <Star className="w-6 h-6 fill-gold-400 text-gold-400" />
                  <div className="text-xs">
                    <div className="font-semibold text-gray-800">4.9 / 5 Rating</div>
                    <div className="text-gray-500">10,000+ reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-500 font-medium text-sm uppercase tracking-widest mb-2">Browse by Category</p>
            <h2 className="section-title">What would you like to create?</h2>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm text-brand-600 font-medium hover:text-brand-700">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group card p-5 text-center hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-shadow`}>
                <cat.icon className="w-7 h-7 text-white" strokeWidth={1.75} />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-0.5 group-hover:text-brand-600 transition-colors">{cat.name}</h3>
              <p className="text-xs text-gray-400">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-cream-100">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-brand-500 font-medium text-sm uppercase tracking-widest mb-2">Handpicked for you</p>
              <h2 className="section-title">Bestselling Products</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm text-brand-600 font-medium hover:text-brand-700">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PRODUCTS.map((product) => {
              const discount = product.comparePrice
                ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
                : 0;
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="card group overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="relative aspect-square bg-cream-100 overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {discount}% OFF
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="absolute top-3 right-3 bg-gold-400 text-maroon-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Popular
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-0.5 mb-1">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-gold-400 text-gold-400" />)}
                      <span className="text-xs text-gray-400 ml-1">(48)</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-brand-600 transition-colors mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 flex-1">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-lg font-bold text-brand-600">{formatPrice(product.basePrice)}</span>
                        {product.comparePrice && (
                          <span className="text-sm text-gray-400 line-through ml-2">{formatPrice(product.comparePrice)}</span>
                        )}
                      </div>
                      <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full font-medium">Customize</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-brand-500 font-medium text-sm uppercase tracking-widest mb-2">Simple Process</p>
          <h2 className="section-title">How it works</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Create your personalised gift in just 3 easy steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-brand opacity-30" />

          {[
            { step: "01", icon: Package, title: "Choose Your Product", desc: "Pick from our wide range of customizable products" },
            { step: "02", icon: Camera, title: "Upload Your Photo", desc: "Add your favourite photo or design to the product" },
            { step: "03", icon: Truck, title: "We Deliver", desc: "Sit back and relax — your gift arrives in 3-7 days" },
          ].map((item) => (
            <div key={item.step} className="text-center relative">
              <div className="relative inline-block">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-cream-100 flex items-center justify-center mb-4 shadow-card">
                  <item.icon className="w-10 h-10 text-brand-500" strokeWidth={1.5} />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-brand text-white text-xs font-bold flex items-center justify-center">
                  {item.step}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features / Trust */}
      <section className="py-14 bg-gradient-brand">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4 text-white">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-1">{f.title}</h4>
                  <p className="text-sm text-white/75">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-brand-500 font-medium text-sm uppercase tracking-widest mb-2">Real Reviews</p>
          <h2 className="section-title">What our customers say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card p-6">
              <div className="flex items-center gap-0.5 mb-3">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-gold-400 text-gold-400" />)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.city} · {t.product}</div>
                </div>
                <Heart className="w-4 h-4 text-red-400 fill-red-400 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-4 sm:mx-6 lg:mx-8 mb-16 rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <Gift className="absolute top-0 left-0 w-32 h-32 text-white" />
            <Star className="absolute bottom-0 right-0 w-32 h-32 text-white" />
            <Heart className="absolute top-1/2 right-1/4 w-24 h-24 text-white" />
          </div>
          <div className="relative">
            <p className="text-brand-400 font-medium text-sm uppercase tracking-widest mb-3">Limited Time Offer</p>
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Get 20% off your first order
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Use code <span className="text-brand-400 font-mono font-bold">MAA20</span> at checkout.
              Free shipping on orders above ₹499.
            </p>
            <Link href="/products">
              <Button size="lg" className="rounded-2xl">
                Start Customizing <Gift className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
