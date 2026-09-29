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
          950: "#071e2b",
          900: "#101a35",
          850: "#11283d",
          800: "#153746",
          700: "#1d5260",
          600: "#007c83",
        },
        tesoro: {
          gold: "#E9B949",
          amber: "#F6E7C1",
          bronze: "#A57A2D",
          light: "#FFF5DC",
          glow: "rgba(233, 185, 73, 0.35)",
        },
        reverie: {
          crimson: "#E45756",
          blood: "#701F2D",
          cardinal: "#A63342",
        },
        sea: {
          teal: "#007C83",
          foam: "#83C5BE",
        },
      },
      fontFamily: {
        serif: ["Cinzel", "Cinzel Decorative", "Georgia", "serif"],
        sans: ["Outfit", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "gold-glow": "0 0 25px rgba(233, 185, 73, 0.35), 0 0 8px rgba(233, 185, 73, 0.2)",
        "gold-glow-lg": "0 0 50px rgba(233, 185, 73, 0.5), 0 0 20px rgba(233, 185, 73, 0.3)",
        "crimson-glow": "0 0 30px rgba(228, 87, 86, 0.45), 0 0 10px rgba(228, 87, 86, 0.25)",
        "inner-gold": "inset 0 0 20px rgba(233, 185, 73, 0.1)",
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

