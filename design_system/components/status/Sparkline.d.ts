import * as React from "react";

/** A soft bar sparkline for trajectory over weeks. Deliberately unlabelled — it shows shape, not data. */
export interface SparklineProps extends React.HTMLAttributes<HTMLDivElement> {
  values?: number[];
  /** Container height in px. Bars are percentages of this, so never set it below 40. */
  height?: number;
}
export declare function Sparkline(props: SparklineProps): React.JSX.Element;
