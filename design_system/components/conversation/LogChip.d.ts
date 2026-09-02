import * as React from "react";

/** One extracted data point, shown back to the caregiver so it stays visible and correctable. Square-ish 8px radius distinguishes it from the pill-shaped StatePill. */
export interface LogChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "steady" | "caution" | "risk";
}
export declare function LogChip(props: LogChipProps): React.JSX.Element;
