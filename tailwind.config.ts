import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Creamy design system (ported from the Lovable theme)
        cream: "#fff2c9", // buttery page background
        ink: "#111111", // near-black text / dark pills
        white: "#FFFFFF",
        // Signature flavor colors that drive the hero + sections
        "flavor-blue": "#6bb6d6", // Swedish Vanilla
        "flavor-green": "#6bbf7a", // Mint Chocochip / FAQ / footer
        "flavor-orange": "#c98452", // Apple Pie / product grid
        "green-soft": "#d7f5dc", // faq accordion pill
        "green-mint": "#c9f2d3", // testimonial avatar bg
        "green-ink": "#2f7a3e", // testimonial avatar text
        // Legacy tokens kept so existing pages keep compiling
        accent: "#8B7355",
        secondary: "#D4C5A9",
        olive: "#6B7C5C",
        sand: "#F5E6C3",
        "sand-deep": "#EAD7A8",
        grass: "#6bbf7a",
        "grass-dark": "#4c9d5c",
        "grass-soft": "#d7f5dc",
        vanilla: "#6bb6d6",
        chocolate: "#7B4B3A",
        strawberry: "#E4573E",
        mint: "#6bbf7a",
        blueberry: "#6bb6d6",
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
        soft: "0 6px 24px rgba(17,17,17,0.08)",
        hover: "0 16px 40px rgba(17,17,17,0.16)",
        pill: "0 8px 20px rgba(17,17,17,0.16)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "float-slow": "float 7.5s ease-in-out infinite",
        wiggle: "wiggle 3s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
