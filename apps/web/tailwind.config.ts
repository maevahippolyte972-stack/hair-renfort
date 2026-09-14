import type { Config } from "tailwindcss";

/**
 * Palette et typographie du brief (section Identité visuelle) : esprit éditorial
 * haut de gamme, pas un template SaaS générique.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ivoire: "#F5F1E8",
        "noir-chaud": "#1C1712",
        laiton: "#A8793E",
        bordeaux: "#6B2737",
        "vert-confirmation": "#4C6B4F",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
