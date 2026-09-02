import React from "react";

export function PhoneFrame({ children, style, ...rest }) {
  return (
    <div {...rest} style={{
      width: "390px", height: "812px", flexShrink: 0,
      background: "var(--surface-app)",
      borderRadius: "var(--radius-device)",
      boxShadow: "var(--shadow-device)",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      fontFamily: "var(--font-sans)",
      ...style
    }}>{children}</div>
  );
}
