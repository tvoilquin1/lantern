import * as React from "react";

/** Numbered practical guidance, drawn from the knowledge base. Three items — a caregiver cannot act on more. */
export interface GuidanceListProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: string[];
}
export declare function GuidanceList(props: GuidanceListProps): React.JSX.Element;
