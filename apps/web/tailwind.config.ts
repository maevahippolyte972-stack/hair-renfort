import type { Config } from "tailwindcss";

/**
 * Palette et typographie du brief (section Identité visuelle) : esprit éditorial
 * haut de gamme, pas un template SaaS générique. Les teintes sont portées en oklch
 * (mêmes familles ivoire/laiton/bordeaux) via des variables CSS pour garder le
 * support des modificateurs d'opacité Tailwind (bg-laiton/15, etc.) — voir globals.css.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ivoire: "oklch(var(--ivoire-lch) / <alpha-value>)",
        "noir-chaud": "oklch(var(--noir-chaud-lch) / <alpha-value>)",
        laiton: "oklch(var(--laiton-lch) / <alpha-value>)",
        "laiton-foreground": "oklch(var(--laiton-foreground-lch) / <alpha-value>)",
        bordeaux: "oklch(var(--bordeaux-lch) / <alpha-value>)",
        "bordeaux-foreground": "oklch(var(--bordeaux-foreground-lch) / <alpha-value>)",
        "vert-confirmation": "#4C6B4F",
        surface: "oklch(var(--surface-lch) / <alpha-value>)",
        "ink-soft": "oklch(var(--ink-soft-lch) / <alpha-value>)",
        secondary: "oklch(var(--secondary-lch) / <alpha-value>)",
        muted: "oklch(var(--muted-lch) / <alpha-value>)",
        "muted-foreground": "oklch(var(--muted-foreground-lch) / <alpha-value>)",
        border: "oklch(var(--border-lch) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
