import * as React from "react";

/**
 * A turn in the companion conversation.
 * @startingPoint section="Conversation" subtitle="Companion and caregiver chat turns" viewport="700x260"
 */
export interface MessageBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** companion = paper, tail bottom-left. caregiver = sage tint, tail bottom-right. */
  from?: "companion" | "caregiver";
}
export declare function MessageBubble(props: MessageBubbleProps): React.JSX.Element;
