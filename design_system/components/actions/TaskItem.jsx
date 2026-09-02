import React from "react";

export function TaskItem({ done = false, onDark = false, style, children, ...rest }) {
  return (
    <div {...rest} style={{ display: "flex", gap: "var(--space-12)", alignItems: "flex-start", ...style }}>
      <div style={{
        width: "18px", height: "18px", borderRadius: "var(--space-6)", flexShrink: 0, marginTop: "2px",
        border: "1.5px solid " + (onDark ? "var(--sage-400)" : "var(--sage-600)"),
        background: done ? (onDark ? "var(--sage-400)" : "var(--sage-600)") : "transparent"
      }} />
      <div style={{
        fontSize: "var(--text-body-lg-size)", lineHeight: "1.5",
        color: onDark ? "var(--text-on-dark)" : "var(--text-secondary)"
      }}>{children}</div>
    </div>
  );
}
