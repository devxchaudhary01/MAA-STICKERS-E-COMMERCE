import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fff8f1",
          100: "#ffeedd",
          200: "#ffd9b3",
          300: "#ffbc80",
          400: "#ff964d",
          500: "#f97316",
          600: "#ea6a0a",
          700: "#c2550a",
          800: "#9a4510",
          900: "#7c3a10",
        },
        maroon: {
          50:  "#fdf2f2",
          100: "#fde8e8",
          200: "#fbd5d5",
          300: "#f8b4b4",
          400: "#f17272",
          500: "#e53e3e",
          600: "#c53030",
          700: "#9b1c1c",
          800: "#771d1d",
          900: "#5a1010",
        },
        gold: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        cream: {
          50:  "#fffbf5",
          100: "#fff7ed",
          200: "#fef3e2",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #f97316 0%, #e53e3e 100%)",
        "gradient-warm":  "linear-gradient(180deg, #fff8f1 0%, #fff7ed 100%)",
      },
      boxShadow: {
        card: "0 2px 16px 0 rgba(249,115,22,0.08)",
        "card-hover": "0 8px 32px 0 rgba(249,115,22,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
