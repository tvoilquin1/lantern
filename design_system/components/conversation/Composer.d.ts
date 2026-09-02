import * as React from "react";

/** The floating message input. Present on every screen — the companion is always reachable. */
export interface ComposerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Invitational, lowercase-ended placeholder. Default "Talk to Lantern…". */
  placeholder?: string;
  onSend?: () => void;
}
export declare function Composer(props: ComposerProps): React.JSX.Element;
