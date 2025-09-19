import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#d1fae5",       // xanh nhạt viền
        input: "#d1fae5",
        ring: "#34d399",         // xanh ngọc sáng
        background: "#ffffff",
        foreground: "#111827",

        primary: {
          DEFAULT: "#34d399",    // xanh ngọc chính (emerald-400)
          foreground: "#ffffff", // chữ trắng
          glow: "#6ee7b7",       // xanh sáng hơn để làm hiệu ứng glow
        },
        secondary: {
          DEFAULT: "#a7f3d0",    // xanh bạc hà nhạt
          foreground: "#065f46", // xanh ngọc đậm cho chữ
        },
        destructive: {
          DEFAULT: "#ef4444",    // đỏ
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#d1fae5",    // xanh nhạt
          foreground: "#065f46", // chữ xanh đậm
        },
        accent: {
          DEFAULT: "#10b981",    // emerald-500 (xanh đậm hơn primary)
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#111827",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#111827",
        },
        sidebar: {
          DEFAULT: "#34d399",           
          foreground: "#ffffff",
          primary: "#10b981",           
          "primary-foreground": "#ffffff",
          accent: "#6ee7b7",            
          "accent-foreground": "#065f46",
          border: "#a7f3d0",            // viền xanh nhạt
          ring: "#6ee7b7",              // ring xanh sáng
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "electric-gradient": "linear-gradient(to bottom, #5EFCE8, #39F387)", // xanh ngọc → xanh lá
        "energy-gradient": "linear-gradient(to right, #39F387, #2ecc71)",
      },
      boxShadow: {
        electric: "0 8px 30px rgba(94, 252, 232, 0.25)", // xanh ngọc sáng
        energy: "0 8px 30px rgba(57, 243, 135, 0.25)",   // xanh lá
        card: "0 4px 15px rgba(0, 0, 0, 0.08)",          // nhẹ cho card
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
