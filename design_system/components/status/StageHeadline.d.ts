import * as React from "react";

/** The patient's current stage, with the plain-English qualifier that makes the number mean something. */
export interface StageHeadlineProps extends React.HTMLAttributes<HTMLDivElement> {
  stage: string;
  /** Always supply this. "Early" alone is not self-explanatory without context. */
  qualifier?: string;
}
export declare function StageHeadline(props: StageHeadlineProps): React.JSX.Element;
