import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        paper: "var(--paper)",
        espresso: {
          800: "#35322C",
          850: "#262420",
          900: "#1B1916",
          950: "#171614",
        },
        parchment: {
          50: "#FAF8F3",
          100: "#F7F4ED",
          200: "#F3F0E8",
          300: "#EFECE3",
          400: "#E5E0D5",
          500: "#DCD7CB",
        },
        champagne: {
          50: "#FCF9F2",
          100: "#FAF6ED",
          200: "#F3EBD8",
          500: "#D4B87C",
          600: "#C4AA76",
          700: "#B89B62",
          800: "#9A7E49",
        },
        olive: {
          50: "#F7F8F5",
          100: "#F4F6F1",
          200: "#E5EAE0",
          500: "#7A8068",
          600: "#65705B",
          700: "#525E4B",
        },
        burgundy: {
          50: "#FCF7F7",
          100: "#FBF4F4",
          200: "#F5E3E3",
          600: "#8C4A47",
          700: "#6F3D3A",
          800: "#572F2D",
        },
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px 0 rgba(15, 23, 42, 0.02)',
        'premium': '0 10px 25px -5px rgba(15, 23, 42, 0.06), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'card': '0 0 0 1px rgba(15, 23, 42, 0.05), 0 2px 4px rgba(15, 23, 42, 0.04)',
        'glow-blue': '0 0 40px -10px rgba(37, 99, 235, 0.25)',
        'glow-teal': '0 0 40px -10px rgba(13, 148, 136, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
