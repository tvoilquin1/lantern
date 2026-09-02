import React from "react";

const VARIANTS = {
  paper: { background: "var(--surface-card)", boxShadow: "var(--shadow-card)", color: "var(--text-primary)" },
  muted: { background: "var(--surface-muted)", color: "var(--text-primary)" },
  dark: { background: "var(--surface-dark)", color: "var(--text-on-dark)" },
  panel: { background: "var(--surface-card)", boxShadow: "var(--shadow-hairline)", color: "var(--text-primary)" }
};

export function Card({ variant = "paper", padded = true, gap = "var(--card-gap)", radius, style, children, ...rest }) {
  return (
    <div
      {...rest}
      style={{
        display: "flex",
        flexDirection: "column",
        gap,
        borderRadius: radius || (variant === "panel" || variant === "muted" ? "var(--radius-panel)" : "var(--radius-card)"),
        padding: padded ? "var(--card-padding-y) var(--card-padding-x)" : 0,
        boxSizing: "border-box",
        ...VARIANTS[variant],
        ...style
      }}
    >
      {children}
    </div>
  );
}
