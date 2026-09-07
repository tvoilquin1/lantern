import type { Config } from "tailwindcss";

// Lamplight design tokens — sourced from design_system/tokens/
// Do not edit these values here; update design_system/tokens/ and keep in sync.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Colors ───────────────────────────────────────────────────────────
      colors: {
        // Paper — warm neutral ground. Never pure white, never cool grey.
        paper: {
          desk: "#E8E4DC",
          app: "#F6F2EA",
          card: "#FFFDFA",
          inset: "#FAF7F1",
          muted: "#EFEAE1",
          hairline: "#F0EBE2",
        },
        // Ink
        ink: {
          900: "#2A2724",
          700: "#3D3934",
          500: "#6E675E",
          400: "#8A8378",
        },
        // Sage — the only true accent. Steady, calm, affirmative.
        sage: {
          900: "#2F3A31",
          800: "#3F5745",
          700: "#4A5B4E",
          650: "#4F6A53",
          600: "#5F7A63",
          400: "#7C9280",
          300: "#9CB09E",
          200: "#C7D5C3",
          150: "#DCE5D9",
          100: "#E7EDE5",
          "050": "#F2F5F1",
        },
        // Ochre — caution. Worth attention, never an alarm.
        ochre: {
          700: "#9A6A2E",
          400: "#D8AE68",
          100: "#F5E9D6",
        },
        // Clay — highest tier (at-risk, crisis). Muted brick, never signal red.
        clay: {
          700: "#A0503F",
          400: "#C58374",
          100: "#F4E3DD",
        },
      },

      // ── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        display: ["26px", { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "700" }],
        headline: ["22px", { lineHeight: "1.2" }],
        title: ["25px", { lineHeight: "1.18" }],
        message: ["15.5px", { lineHeight: "1.55" }],
        body: ["14px", { lineHeight: "1.55" }],
        "body-lg": ["14.5px", { lineHeight: "1.55" }],
        supporting: ["13.5px", { lineHeight: "1.5" }],
        meta: ["12.5px", { lineHeight: "1.4" }],
        chip: ["12px", { lineHeight: "1.3" }],
        caption: ["11.5px", { lineHeight: "1.4" }],
        eyebrow: ["11px", { letterSpacing: "0.12em", fontWeight: "600" }],
        "eyebrow-sm": ["10.5px", { letterSpacing: "0.14em", fontWeight: "600" }],
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },

      // ── Spacing ──────────────────────────────────────────────────────────
      // Not a strict 4px grid — Lamplight rhythm values
      spacing: {
        "2": "2px",
        "3": "3px",
        "5": "5px",
        "6": "6px",
        "8": "8px",
        "9": "9px",
        "10": "10px",
        "11": "11px",
        "12": "12px",
        "14": "14px",
        "16": "16px",
        "18": "18px",
        "20": "20px",
        "22": "22px",
        "26": "26px",
        "card-x": "20px",
        "card-y": "17px",
        "card-gap": "11px",
        "stack-gap": "9px",
        "screen-gutter": "20px",
        "screen-gutter-text": "26px",
      },

      // ── Border radius ─────────────────────────────────────────────────────
      borderRadius: {
        chip: "8px",
        inset: "16px",
        bubble: "24px",
        "bubble-tail": "8px",
        card: "28px",
        panel: "24px",
        device: "42px",
        pill: "999px",
      },

      // ── Box shadow (elevation) ────────────────────────────────────────────
      boxShadow: {
        hairline: "0 0 0 1px rgba(42, 39, 36, 0.05)",
        card: "0 1px 0 rgba(42, 39, 36, 0.04), 0 0 0 1px rgba(42, 39, 36, 0.05)",
        raised:
          "0 8px 20px -10px rgba(42, 39, 36, 0.22), 0 0 0 1px rgba(42, 39, 36, 0.05)",
        device:
          "0 30px 60px -24px rgba(42, 39, 36, 0.28), 0 0 0 1px rgba(42, 39, 36, 0.06)",
      },

      // ── Motion ───────────────────────────────────────────────────────────
      transitionTimingFunction: {
        settle: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "200ms",
        slow: "320ms",
      },
    },
  },
  plugins: [],
};

export default config;
