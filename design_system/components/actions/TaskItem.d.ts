import * as React from "react";

/** One actionable item surfaced by the companion. Phrased as something Lantern already did half of. */
export interface TaskItemProps extends React.HTMLAttributes<HTMLDivElement> {
  done?: boolean;
  /** Use inside a dark Card. */
  onDark?: boolean;
}
export declare function TaskItem(props: TaskItemProps): React.JSX.Element;
