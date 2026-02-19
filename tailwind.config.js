/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#04060B",
          s1: "#0A0F18",
          s2: "#111827",
          s3: "#1A2235",
          hover: "#1F2B3E",
          b1: "#1E293B",
          b2: "#334155",
          accent: "#6366F1",
          green: "#10B981",
          red: "#EF4444",
          yellow: "#F59E0B",
          purple: "#8B5CF6",
          orange: "#F97316",
          cyan: "#06B6D4",
        }
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "monospace"],
      }
    }
  },
  plugins: [],
};
