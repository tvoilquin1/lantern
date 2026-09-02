import React from "react";

export function MessageBubble({ from = "companion", style, children, ...rest }) {
  const companion = from === "companion";
  return (
    <div
      {...rest}
      style={{
        maxWidth: "86%",
        alignSelf: companion ? "flex-start" : "flex-end",
        background: companion ? "var(--surface-card)" : "var(--sage-100)",
        boxShadow: companion ? "var(--shadow-hairline)" : "none",
        color: companion ? "var(--text-primary)" : "var(--sage-900)",
        borderRadius: companion
          ? "var(--radius-bubble) var(--radius-bubble) var(--radius-bubble) var(--radius-bubble-tail)"
          : "var(--radius-bubble) var(--radius-bubble) var(--radius-bubble-tail) var(--radius-bubble)",
        padding: "16px 18px",
        fontSize: "var(--text-message-size)",
        lineHeight: "var(--text-body-leading)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-12)",
        ...style
      }}
    >
      {children}
    </div>
  );
}
