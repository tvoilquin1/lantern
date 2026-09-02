import * as React from "react";

/** The caregiver burden gauge. Renders as a continuous bar, or as discrete named segments. */
export interface StateTrackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0-100. */
  value?: number;
  tone?: "steady" | "caution" | "risk";
  /** Render N discrete segments instead of a continuous bar — preferred, because it implies a named tier. */
  segments?: number;
  /** Tier names shown beneath a segmented track, e.g. ["Coping", "Stretched", "At risk"]. */
  labels?: string[];
}
export declare function StateTrack(props: StateTrackProps): React.JSX.Element;
