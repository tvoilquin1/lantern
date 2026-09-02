import React from "react";

export function SectionLabel({ onDark = false, size = "md", wide = false, style, children, ...rest }) {
  return (
    <div
      {...rest}
      style={{
        fontSize: size === "sm" ? "var(--text-eyebrow-size-sm)" : "var(--text-eyebrow-size)",
        fontWeight: "var(--weight-semibold)",
        letterSpacing: wide ? "var(--text-eyebrow-tracking-wide)" : "var(--text-eyebrow-tracking)",
        textTransform: "uppercase",
        color: onDark ? "var(--text-label-on-dark)" : "var(--text-body)",
        ...style
      }}
    >
      {children}
    </div>
  );
}
