"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, Search, Phone, Truck } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Acrylic Wall Frames", href: "/categories/acrylic-wall" },
  { label: "Wall Clocks", href: "/categories/wall-clock" },
  { label: "All Categories", href: "/categories" },
  { label: "Track Order", href: "/track-order" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-gradient-brand text-white text-center py-2 px-4 text-xs font-medium flex items-center justify-center flex-wrap gap-1">
        <Truck className="w-3.5 h-3.5 inline" /> Free shipping on orders above ₹499 | Made in India
        <span className="mx-3">|</span>
        <a href="tel:+919876543210" className="underline hover:no-underline inline-flex items-center gap-1">
          <Phone className="w-3 h-3" /> +91 98765 43210
        </a>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 bg-white transition-shadow duration-300",
          scrolled ? "shadow-md" : "shadow-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-lg shadow-md">
                M
              </div>
              <div className="leading-tight">
                <span className="font-display font-bold text-xl text-gray-800">Maa</span>
                <span className="text-brand-500 font-bold text-xl"> Stickers</span>
                <div className="text-[9px] text-gray-400 font-medium tracking-wider uppercase -mt-0.5">
                  Personalized Gifts
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                aria-label="Search"
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg hover:bg-brand-50 text-gray-500 hover:text-brand-600 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                href="/cart"
                className="relative flex w-9 h-9 items-center justify-center rounded-lg hover:bg-brand-50 text-gray-600 hover:text-brand-600 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>

              <button
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-brand-50 text-gray-600 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
