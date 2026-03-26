import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "var(--surface-page)",
          alt: "var(--surface-alt)",
          card: "var(--surface-card)",
          dark: "var(--surface-dark)",
        },
        brand: {
          DEFAULT: "var(--brand-blue)",
          dark: "var(--brand-blue-hover)",
          light: "var(--brand-blue-light)",
          ozon: "var(--brand-ozon)",
          blue: "var(--brand-blue)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          dark: "var(--accent-dark)",
          light: "var(--accent-light)",
        },
        ink: {
          DEFAULT: "var(--ink-dark)",
          dark: "var(--ink-dark)",
          secondary: "var(--ink-secondary)",
          muted: "var(--ink-muted)",
          inverse: "var(--ink-inverse)",
        },
        line: {
          DEFAULT: "var(--line)",
          light: "var(--line-light)",
        },
        primary: "var(--ink)",
        "text-primary": "var(--ink)",
        "text-muted": "var(--ink-muted)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        subheading: ["var(--font-subheading)", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        ozon: ["var(--font-ozon)", "Nunito", "Comfortaa", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease-out",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
