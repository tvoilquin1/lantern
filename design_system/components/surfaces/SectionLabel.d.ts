import * as React from "react";

/** The uppercase eyebrow that titles every card and section. */
export interface SectionLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use the sage-300 variant when sitting on a dark Card. */
  onDark?: boolean;
  size?: "sm" | "md";
  /** Wider 0.14em tracking, for date lines and screen-level eyebrows. */
  wide?: boolean;
}
export declare function SectionLabel(props: SectionLabelProps): React.JSX.Element;
