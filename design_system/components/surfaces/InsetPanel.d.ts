import * as React from "react";

/** A recessed panel nested inside a Card — used to show extracted data without breaking the reading flow. */
export interface InsetPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional uppercase micro-label, e.g. "Added to Dad's log". */
  label?: string;
}
export declare function InsetPanel(props: InsetPanelProps): React.JSX.Element;
