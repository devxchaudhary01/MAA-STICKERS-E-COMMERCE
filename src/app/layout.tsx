import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Maa Stickers — Personalized Gifts & Custom Stickers",
    template: "%s | Maa Stickers",
  },
  description:
    "Shop custom stickers, personalized gifts, fridge magnets, keychains, and more. Made with love, delivered across India.",
  keywords: ["custom stickers", "personalized gifts", "photo stickers", "fridge magnets", "keychains", "India"],
  openGraph: {
    siteName: "Maa Stickers",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
