import React from "react";

export function ChipRow({ gap = "var(--space-8)", style, children, ...rest }) {
  return <div {...rest} style={{ display: "flex", flexWrap: "wrap", gap, ...style }}>{children}</div>;
}
