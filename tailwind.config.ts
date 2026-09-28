import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        marine: {
          950: "#040914",
          900: "#081226",
          850: "#0c1b38",
          800: "#10254c",
          700: "#193870",
        },
        tesoro: {
          gold: "#D4AF37",
          amber: "#FFBF00",
          bronze: "#996515",
          light: "#FFF3CD",
          glow: "rgba(212, 175, 55, 0.35)",
        },
        reverie: {
          crimson: "#C41E3A",
          blood: "#8B0000",
          cardinal: "#A6192E",
        },
      },
      fontFamily: {
        serif: ["Cinzel", "Georgia", "serif"],
        sans: ["Outfit", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "gold-glow": "0 0 25px rgba(212, 175, 55, 0.3)",
        "gold-glow-lg": "0 0 45px rgba(212, 175, 55, 0.45)",
        "crimson-glow": "0 0 30px rgba(196, 30, 58, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
