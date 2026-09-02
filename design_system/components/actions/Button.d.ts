import * as React from "react";

/**
 * Full-width pill buttons. Lantern offers one primary action per screen, with a quiet decline beneath it.
 * @startingPoint section="Actions" subtitle="Primary, secondary and quiet decline buttons" viewport="700x220"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "quiet";
  /** Full-bleed width. Default true. */
  full?: boolean;
}
export declare function Button(props: ButtonProps): React.JSX.Element;
