import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        'silver-pool': 'linear-gradient(180deg, #0F0A21 0%, #F7F7F7 100%)',
        'gold-pool': 'linear-gradient(180deg, #000000 0%, #FFD700 98.89%)',
        'platinum-pool': 'linear-gradient(180deg, #0F0A21 0%, #E5E4E2 100%)',
        'diamond-pool': 'linear-gradient(180deg, #101027 0%, #B9F2FF 100%)',
        'crown-diamond-pool': 'linear-gradient(180deg, #0F0A21 -4.18%, #E89F52 100%)',
        'sul-background' : 'linear-gradient(90.11deg, rgba(137, 34, 179, 0.264) 0.11%, rgba(43, 37, 90, 0.1782) 47.67%, rgba(105, 26, 139, 0.264) 99.92%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
