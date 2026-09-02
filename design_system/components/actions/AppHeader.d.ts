import * as React from "react";

/** Screen header: the Lantern mark, then a greeting or screen title. No mock status bar, no clock. */
export interface AppHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: React.ReactNode;
  /** Small uppercase line above the title, usually the date. */
  eyebrow?: string;
  /** Right-aligned uppercase meta text. */
  meta?: string;
  /** Right-aligned node, e.g. a "Today ›" chip linking to the dashboard. */
  action?: React.ReactNode;
}
export declare function AppHeader(props: AppHeaderProps): React.JSX.Element;
