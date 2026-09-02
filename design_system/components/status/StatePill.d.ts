import * as React from "react";

/**
 * The state badge. Always carries a WORD ("Steady", "Stretched"), never a bare colour or number.
 * @startingPoint section="Status" subtitle="Steady / caution / risk state badges" viewport="700x150"
 */
export interface StatePillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "steady" | "caution" | "risk" | "neutral";
}
export declare function StatePill(props: StatePillProps): React.JSX.Element;
