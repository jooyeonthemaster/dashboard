import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0f",
          elevated: "#14141c",
          sunken: "#050509",
        },
        ink: {
          DEFAULT: "#f4f4f7",
          muted: "#b6b6c8",
          faint: "#8a8aa3",
        },
        accent: {
          marketing: "#FF6B6B",
          sales: "#4ECDC4",
          dev: "#FFD93D",
          ops: "#A78BFA",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "var(--font-noto-kr)",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "Pretendard Variable",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
