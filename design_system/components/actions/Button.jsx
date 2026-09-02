import React from "react";

const VARIANTS = {
  primary: { background: "var(--accent)", color: "#FBFAF6", border: "none", fontWeight: "var(--weight-semibold)" },
  secondary: { background: "var(--surface-card)", color: "var(--sage-700)", border: "1px solid var(--border-quiet)", fontWeight: "var(--weight-semibold)" },
  quiet: { background: "transparent", color: "var(--text-faint)", border: "none", fontWeight: "var(--weight-regular)" }
};

export function Button({ variant = "primary", full = true, style, children, ...rest }) {
  return (
    <button {...rest} style={{
      font: "inherit",
      fontSize: "15.5px",
      padding: variant === "quiet" ? "var(--space-6)" : "17px",
      width: full ? "100%" : "auto",
      borderRadius: "var(--radius-pill)",
      textAlign: "center",
      cursor: "pointer",
      minHeight: "44px",
      ...VARIANTS[variant],
      ...style
    }}>{children}</button>
  );
}
