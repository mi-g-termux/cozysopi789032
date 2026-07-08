import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F2",
        ink: "#2C2C2C",
        accent: "#8B7355",
        secondary: "#D4C5A9",
        olive: "#6B7C5C",
        white: "#FFFFFF"
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "serif"],
        body: ["var(--font-inter)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 4px 20px rgba(44, 44, 44, 0.06)",
        hover: "0 12px 32px rgba(44, 44, 44, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
