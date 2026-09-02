import React from "react";

export function GuidanceList({ items = [], style, ...rest }) {
  return (
    <div {...rest} style={{ display: "flex", flexDirection: "column", gap: "var(--space-12)", ...style }}>
      {items.map((text, i) => (
        <div key={i} style={{ display: "flex", gap: "var(--space-12)" }}>
          <div style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-chip-size)", color: "var(--accent)", paddingTop: "2px" }}>
            {String(i + 1).padStart(2, "0")}
          </div>
          <div style={{ fontSize: "var(--text-body-lg-size)", lineHeight: "var(--text-body-leading)", color: "var(--text-secondary)" }}>{text}</div>
        </div>
      ))}
    </div>
  );
}
