import React from "react";

const RAMP = ["var(--sage-100)", "var(--sage-150)", "var(--sage-200)", "var(--sage-600)"];

export function Sparkline({ values = [], height = 46, style, ...rest }) {
  const max = Math.max(...values, 1);
  return (
    <div {...rest} style={{ display: "flex", gap: "var(--space-5)", alignItems: "flex-end", height: height + "px", ...style }}>
      {values.map((v, i) => (
        <div key={i} style={{
          flex: 1,
          height: Math.round((v / max) * 100) + "%",
          borderRadius: "var(--space-6)",
          background: RAMP[Math.min(RAMP.length - 1, Math.floor((i / Math.max(values.length - 1, 1)) * RAMP.length))]
        }} />
      ))}
    </div>
  );
}
