import React from "react";

export function StageHeadline({ stage, qualifier, style, ...rest }) {
  return (
    <div {...rest} style={{
      fontWeight: "var(--weight-bold)",
      letterSpacing: "var(--text-display-tracking)",
      fontSize: "var(--text-display-size)",
      color: "var(--text-primary)",
      ...style
    }}>
      {stage}
      {qualifier ? <span style={{ fontSize: "17px", color: "var(--text-faint)" }}>{" — " + qualifier}</span> : null}
    </div>
  );
}
