import * as React from "react";

/** Flex-wrap row for chips. Exists so chip groups use gap spacing rather than inline whitespace. */
export interface ChipRowProps extends React.HTMLAttributes<HTMLDivElement> { gap?: string; }
export declare function ChipRow(props: ChipRowProps): React.JSX.Element;
