import React from "react";

export function SuggestionChip({ style, children, ...rest }) {
  return (
    <button {...rest} style={{
      font: "inherit",
      fontSize: "var(--text-body-lg-size)",
      color: "var(--sage-700)",
      background: "var(--surface-card)",
      border: "1px solid var(--border-quiet)",
      padding: "10px 14px",
      borderRadius: "var(--radius-pill)",
      cursor: "pointer",
      minHeight: "44px",
      ...style
    }}>{children}</button>
  );
}
