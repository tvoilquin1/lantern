import React from "react";

export function InsetPanel({ label, style, children, ...rest }) {
  return (
    <div
      {...rest}
      style={{
        background: "var(--surface-inset)",
        borderRadius: "var(--radius-inset)",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-8)",
        ...style
      }}
    >
      {label ? (
        <div style={{
          fontSize: "10px",
          fontWeight: "var(--weight-semibold)",
          letterSpacing: "var(--text-eyebrow-tracking)",
          textTransform: "uppercase",
          color: "var(--text-faint)"
        }}>{label}</div>
      ) : null}
      {children}
    </div>
  );
}
