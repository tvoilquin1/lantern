import React from "react";

const TONES = {
  steady: { color: "var(--state-steady-fg)", background: "var(--state-steady-bg)" },
  caution: { color: "var(--state-caution-fg)", background: "var(--state-caution-bg)" },
  risk: { color: "var(--state-risk-fg)", background: "var(--state-risk-bg)" }
};

export function LogChip({ tone = "steady", style, children, ...rest }) {
  return (
    <span {...rest} style={{
      fontSize: "var(--text-chip-size)",
      fontWeight: "var(--weight-medium)",
      padding: "5px 10px",
      borderRadius: "var(--radius-chip)",
      ...TONES[tone],
      ...style
    }}>{children}</span>
  );
}
