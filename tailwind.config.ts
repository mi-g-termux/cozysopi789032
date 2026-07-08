import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base tokens (per brief)
        cream: "#FAF7F2",
        ink: "#2C2C2C",
        accent: "#8B7355",
        secondary: "#D4C5A9",
        olive: "#6B7C5C",
        white: "#FFFFFF",
        // Creamy ice-cream palette (matches animation reference)
        sand: "#F5E6C3",
        "sand-deep": "#EAD7A8",
        grass: "#3F8B43",
        "grass-dark": "#2F6B33",
        "grass-soft": "#Bfe3B8",
        // Flavor accents used by the color-cycling hero
        vanilla: "#EAD9A0",
        chocolate: "#7B4B3A",
        strawberry: "#E4573E",
        mint: "#7FB685",
        blueberry: "#4A9BD1",
      },
      fontFamily: {
        heading: [
          "var(--font-fredoka)",
          "ui-rounded",
          "system-ui",
          "sans-serif",
        ],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 6px 24px rgba(44,44,44,0.08)",
        hover: "0 16px 40px rgba(44,44,44,0.16)",
        pill: "0 8px 20px rgba(44,44,44,0.16)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "float-slow": "float 7.5s ease-in-out infinite",
        wiggle: "wiggle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
