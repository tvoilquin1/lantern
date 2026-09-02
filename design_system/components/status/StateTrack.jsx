import React from "react";

const FILLS = {
  steady: "var(--sage-600)",
  caution: "var(--ochre-400)",
  risk: "var(--clay-400)"
};

export function StateTrack({ value = 0, tone = "steady", segments, labels, style, ...rest }) {
  if (segments) {
    const filled = Math.round((value / 100) * segments);
    return (
      <div {...rest} style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", ...style }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {Array.from({ length: segments }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: "7px", borderRadius: "var(--radius-pill)",
              background: i < filled ? FILLS[tone] : "var(--paper-muted)"
            }} />
          ))}
        </div>
        {labels ? (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-caption-size)", color: "var(--text-body)" }}>
            {labels.map((l) => <div key={l}>{l}</div>)}
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div {...rest} style={{ height: "8px", borderRadius: "var(--radius-pill)", background: "var(--paper-muted)", overflow: "hidden", display: "flex", ...style }}>
      <div style={{
        width: value + "%",
        borderRadius: "var(--radius-pill)",
        background: tone === "steady" ? "var(--sage-600)" : "linear-gradient(90deg, var(--sage-200), var(--ochre-400))"
      }} />
    </div>
  );
}
