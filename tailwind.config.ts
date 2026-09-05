import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: "#1A1A1A",
        offwhite: "#FAF8F5",
        brand: {
          DEFAULT: "#FF6B1A",
          dark: "#E0570F",
          light: "#FFE4D2",
        },
      },
      borderRadius: {
        card: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
