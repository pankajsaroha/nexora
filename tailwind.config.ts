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
        foreground: {
          DEFAULT: "var(--foreground)",
          secondary: "var(--foreground-secondary)",
          muted: "var(--foreground-muted)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          subtle: "var(--surface-subtle)",
          muted: "var(--surface-muted)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
          elevated: "var(--card-elevated)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
          subtle: "var(--primary-subtle)",
          muted: "var(--primary-muted)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
          subtle: "var(--subtle-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          hover: "var(--accent-hover)",
          subtle: "var(--accent-subtle)",
        },
        warm: {
          DEFAULT: "var(--warm-accent)",
          subtle: "var(--warm-subtle)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
          subtle: "var(--border-subtle)",
        },
        input: "var(--input)",
        ring: "var(--ring)",
        "focus-ring": "var(--focus-ring)",
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
          subtle: "var(--success-subtle)",
          border: "var(--success-border)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
          subtle: "var(--warning-subtle)",
          border: "var(--warning-border)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
          subtle: "var(--destructive-subtle)",
          border: "var(--destructive-border)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
          subtle: "var(--info-subtle)",
          border: "var(--info-border)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          background: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          border: "var(--sidebar-border)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          active: "var(--sidebar-active-background)",
          "active-foreground": "var(--sidebar-active-foreground)",
          muted: "var(--sidebar-muted)",
          "muted-foreground": "var(--sidebar-muted-foreground)",
          gold: "var(--sidebar-gold)",
        },
        royal: {
          DEFAULT: "var(--royal-amethyst)",
          amethyst: "var(--royal-amethyst)",
          plum: "var(--deep-plum)",
          "soft-plum": "var(--soft-plum)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          champagne: "var(--champagne-gold)",
          subtle: "var(--gold-subtle)",
          border: "var(--gold-border)",
          text: "var(--gold-text)",
          muted: "var(--muted-gold)",
          pale: "var(--pale-champagne)",
        },
        amethyst: {
          DEFAULT: "var(--royal-amethyst)",
          deep: "var(--deep-amethyst)",
          soft: "var(--soft-plum)",
        },
        plum: {
          DEFAULT: "var(--deep-plum)",
          soft: "var(--soft-plum)",
          dark: "var(--deep-amethyst)",
        },
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px -2px rgba(43, 18, 56, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'premium': '0 10px 30px -10px rgba(43, 18, 56, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'gold-glow': '0 0 15px -3px rgba(212, 175, 55, 0.25)',
        'amethyst-glow': '0 0 15px -3px rgba(43, 18, 56, 0.25)',
        'accent-glow': '0 0 15px -3px rgba(212, 175, 55, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
};
export default config;
