import React from "react";

export function Composer({ placeholder = "Talk to Lantern…", onSend, style, ...rest }) {
  return (
    <div {...rest} style={{
      background: "var(--surface-card)",
      borderRadius: "var(--radius-pill)",
      padding: "14px 16px 14px 22px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-12)",
      boxShadow: "var(--shadow-raised)",
      ...style
    }}>
      <div style={{ fontSize: "15px", color: "var(--text-faint)" }}>{placeholder}</div>
      <button onClick={onSend} aria-label="Send" style={{
        width: "40px", height: "40px", flexShrink: 0, border: "none", cursor: "pointer",
        borderRadius: "var(--radius-pill)", background: "var(--accent)",
        color: "var(--accent-contrast)", fontSize: "17px", lineHeight: 1
      }}>↑</button>
    </div>
  );
}
