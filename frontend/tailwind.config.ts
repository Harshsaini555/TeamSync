import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0f17",
        foreground: "#f1f5f9",
        card: {
          DEFAULT: "#161b26",
          foreground: "#f1f5f9"
        },
        popover: {
          DEFAULT: "#161b26",
          foreground: "#f1f5f9"
        },
        primary: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff",
          hover: "#1d4ed8"
        },
        secondary: {
          DEFAULT: "#1e293b",
          foreground: "#94a3b8"
        },
        muted: {
          DEFAULT: "#1e293b",
          foreground: "#64748b"
        },
        accent: {
          DEFAULT: "#38bdf8",
          foreground: "#0f172a"
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff"
        },
        border: "#262d3d",
        input: "#1e293b",
        ring: "#2563eb"
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
