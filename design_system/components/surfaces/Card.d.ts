import * as React from "react";

/**
 * The single surface primitive. Every block of content in Lantern sits in one of these four variants.
 * @startingPoint section="Surfaces" subtitle="Paper, muted, dark and panel card surfaces" viewport="700x320"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** paper = raised default. muted = flat secondary. dark = the one high-contrast block per screen. panel = hairline only. */
  variant?: "paper" | "muted" | "dark" | "panel";
  /** Apply the standard 17px/20px card padding. Default true. */
  padded?: boolean;
  /** Vertical gap between children. Default var(--card-gap). */
  gap?: string;
  /** Override the corner radius. */
  radius?: string;
}
export declare function Card(props: CardProps): React.JSX.Element;
