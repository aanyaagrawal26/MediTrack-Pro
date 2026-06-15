import type { Config } from "tailwindcss";

/**
 * Tailwind theme tuned for a calm, clinical hospital UI.
 * The custom colors map to medication statuses so badges stay consistent
 * everywhere in the app (Pending / Given / Delayed / Missed).
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcdcff",
          300: "#8ec6ff",
          400: "#59a6ff",
          500: "#2f83ff",
          600: "#1763f5",
          700: "#114de1",
          800: "#1540b6",
          900: "#173a8f",
        },
        // Medication status palette
        status: {
          pending: "#f59e0b",
          given: "#16a34a",
          delayed: "#ea580c",
          missed: "#dc2626",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)",
        pop: "0 10px 30px rgba(16,24,40,0.18)",
      },
      keyframes: {
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(220,38,38,0.45)" },
          "70%": { boxShadow: "0 0 0 12px rgba(220,38,38,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(220,38,38,0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.8s infinite",
        shimmer: "shimmer 2s infinite",
        floaty: "floaty 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
