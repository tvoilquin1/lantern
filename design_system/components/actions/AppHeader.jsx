import React from "react";

export function AppHeader({ title, eyebrow, meta, action, style, ...rest }) {
  return (
    <div {...rest} style={{ display: "flex", flexDirection: "column", gap: "var(--space-20)", ...style }}>
      <div style={{ display: "flex", gap: "7px", alignItems: "center", fontSize: "13px", fontWeight: "var(--weight-semibold)", color: "var(--text-faint)" }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "var(--radius-pill)", background: "var(--accent)" }} />
        <div>Lantern</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-12)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {eyebrow ? (
            <div style={{ fontSize: "var(--text-eyebrow-size-sm)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--text-eyebrow-tracking-wide)", textTransform: "uppercase", color: "var(--text-body)" }}>{eyebrow}</div>
          ) : null}
          <div style={{ fontWeight: "var(--weight-bold)", letterSpacing: "var(--text-display-tracking)", fontSize: "var(--text-headline-size)", lineHeight: "1.15", color: "var(--text-primary)" }}>{title}</div>
        </div>
        {meta ? (
          <div style={{ fontSize: "var(--text-eyebrow-size)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--text-eyebrow-tracking)", textTransform: "uppercase", color: "var(--text-body)" }}>{meta}</div>
        ) : null}
        {action}
      </div>
    </div>
  );
}
