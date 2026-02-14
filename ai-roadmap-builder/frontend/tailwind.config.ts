import type { Config } from "tailwindcss"

// eslint-disable-next-line @typescript-eslint/no-require-imports
const flattenColorPalette = (require("tailwindcss/lib/util/flattenColorPalette") as { default: (colors: unknown) => Record<string, string> }).default

function addVariablesForColors({ addBase, theme }: { addBase: (styles: Record<string, unknown>) => void; theme: (path: string) => unknown }) {
  const allColors = flattenColorPalette(theme("colors"))
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  )
  addBase({ ":root": newVars })
}

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        "glass-bg": "rgba(20, 20, 24, 0.6)",
        "color-1": "hsl(var(--color-1))",
        "color-2": "hsl(var(--color-2))",
        "color-3": "hsl(var(--color-3))",
        "color-4": "hsl(var(--color-4))",
        "color-5": "hsl(var(--color-5))",
        ring: "hsl(var(--ring))",
        "primary-foreground": "hsl(var(--primary-foreground))",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "SF Pro Display", "Roboto", "sans-serif"],
      },
      fontSize: {
        "hero": ["clamp(2.5rem, 5vw, 4rem)", { lineHeight: "1.15" }],
      },
      animation: {
        "gradient-shift": "gradient-shift 6s ease infinite",
        rainbow: "rainbow var(--speed, 2s) infinite linear",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        rainbow: {
          "0%": { backgroundPosition: "0%" },
          "100%": { backgroundPosition: "200%" },
        },
      },
    },
  },
  plugins: [addVariablesForColors],
}

export default config;
