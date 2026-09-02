import * as React from "react";

export interface TrendItem {
  label: string;
  /** A word, not a number: "Steady", "Worsening", "Improving". */
  value: string;
  tone?: "steady" | "caution" | "risk";
}
/** The domain-by-domain footer of the patient card. */
export interface TrendRowProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: TrendItem[];
  divider?: boolean;
}
export declare function TrendRow(props: TrendRowProps): React.JSX.Element;
