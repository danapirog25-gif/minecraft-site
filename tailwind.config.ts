import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bunker: "#07110A",
        obsidian: "#0B0F0B",
        ash: "#111A13",
        block: "#172016",
        moss: "#22C55E",
        acid: "#39FF14",
        blood: "#ef4444",
        lava: "#F97316",
        rust: "#f59e0b",
        gold: "#FACC15",
        fog: "#F5F5F5",
        muted: "#A3A3A3",
        ward: "#2DD4BF"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34, 197, 94, 0.28), 0 18px 60px rgba(0, 0, 0, 0.45), 0 0 34px rgba(57, 255, 20, 0.08)",
        redglow: "0 0 0 1px rgba(239, 68, 68, 0.38), 0 18px 60px rgba(0, 0, 0, 0.48), 0 0 32px rgba(239, 68, 68, 0.14)",
        goldglow: "0 0 0 1px rgba(250, 204, 21, 0.5), 0 20px 70px rgba(0, 0, 0, 0.52), 0 0 46px rgba(250, 204, 21, 0.18)",
        block: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -4px 0 rgba(0,0,0,0.3), 0 20px 55px rgba(0,0,0,0.42)"
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(rgba(57,255,20,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.07) 1px, transparent 1px)",
        "block-noise":
          "linear-gradient(135deg, rgba(255,255,255,0.045) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,0.035) 25%, transparent 25%), linear-gradient(45deg, rgba(0,0,0,0.22) 25%, transparent 25%)"
      },
      animation: {
        "gold-pulse": "goldPulse 2.8s ease-in-out infinite",
        "green-pulse": "greenPulse 3.2s ease-in-out infinite",
        "slow-float": "slowFloat 5s ease-in-out infinite"
      },
      keyframes: {
        goldPulse: {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(250,204,21,0.55), 0 0 30px rgba(250,204,21,0.12)" },
          "50%": { boxShadow: "0 0 0 1px rgba(250,204,21,0.88), 0 0 54px rgba(250,204,21,0.27)" }
        },
        greenPulse: {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" }
        },
        slowFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
