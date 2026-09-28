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
          950: "#030810",
          900: "#060c1c",
          850: "#081226",
          800: "#0c1b38",
          700: "#10254c",
          600: "#193870",
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
        serif: ["Cinzel", "Cinzel Decorative", "Georgia", "serif"],
        sans: ["Outfit", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "gold-glow": "0 0 25px rgba(212, 175, 55, 0.35), 0 0 8px rgba(212, 175, 55, 0.2)",
        "gold-glow-lg": "0 0 50px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3)",
        "crimson-glow": "0 0 30px rgba(196, 30, 58, 0.45), 0 0 10px rgba(196, 30, 58, 0.25)",
        "inner-gold": "inset 0 0 20px rgba(212, 175, 55, 0.1)",
      },
      animation: {
        "spin-slow": "spin 12s linear infinite",
        "spin-slower": "spin 20s linear infinite",
        "ocean-drift": "oceanDrift 8s ease-in-out infinite",
        "ship-bob": "shipBob 6s ease-in-out infinite",
        "water-swell": "waterSwell 5s ease-in-out infinite",
        "float-up": "floatUp 4s ease-out infinite",
        "gold-pulse": "goldPulseRing 2s ease-out infinite",
        "scan": "scanLine 4s linear infinite",
        "flag-wave": "flagWave 3s ease-in-out infinite",
        "rope-sway": "ropeSway 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

