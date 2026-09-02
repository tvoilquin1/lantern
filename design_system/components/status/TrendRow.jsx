import React from "react";

const TONES = { steady: "var(--sage-600)", caution: "var(--ochre-700)", risk: "var(--clay-700)" };

export function TrendRow({ items = [], divider = true, style, ...rest }) {
  return (
    <div {...rest} style={{
      display: "flex", gap: "var(--space-10)",
      borderTop: divider ? "1px solid var(--border-rule)" : "none",
      paddingTop: divider ? "13px" : 0,
      ...style
    }}>
      {items.map((it) => (
        <div key={it.label} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ fontSize: "var(--text-caption-size)", color: "var(--text-body)" }}>{it.label}</div>
          <div style={{ fontSize: "var(--text-body-size)", fontWeight: "var(--weight-semibold)", color: TONES[it.tone || "steady"] }}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}
