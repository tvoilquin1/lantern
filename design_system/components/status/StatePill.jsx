import React from "react";

const TONES = {
  steady: { color: "var(--state-steady-fg)", background: "var(--state-steady-bg)" },
  caution: { color: "var(--state-caution-fg)", background: "var(--state-caution-bg)" },
  risk: { color: "var(--state-risk-fg)", background: "var(--state-risk-bg)" },
  neutral: { color: "var(--text-body)", background: "var(--surface-muted)" }
};

export function StatePill({ tone = "steady", style, children, ...rest }) {
  return (
    <span
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: "var(--text-chip-size)",
        fontWeight: "var(--weight-semibold)",
        padding: "5px 10px",
        borderRadius: "var(--radius-pill)",
        whiteSpace: "nowrap",
        ...TONES[tone],
        ...style
      }}
    >
      {children}
    </span>
  );
}
