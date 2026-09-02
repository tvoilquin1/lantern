import React from "react";
import { AppHeader } from "../../components/actions/AppHeader.jsx";
import { MessageBubble } from "../../components/conversation/MessageBubble.jsx";
import { InsetPanel } from "../../components/surfaces/InsetPanel.jsx";
import { LogChip } from "../../components/conversation/LogChip.jsx";
import { ChipRow } from "../../components/conversation/ChipRow.jsx";
import { SuggestionChip } from "../../components/conversation/SuggestionChip.jsx";
import { Composer } from "../../components/conversation/Composer.jsx";
import { StatePill } from "../../components/status/StatePill.jsx";
import { PhoneFrame } from "./PhoneFrame.jsx";

/** Home screen. The companion greets first; the dashboard is a chip away. */
export function Conversation({ onOpenDashboard, onAnswer, answered }) {
  return (
    <PhoneFrame>
      <div style={{ padding: "22px 26px 0" }}>
        <AppHeader
          eyebrow="Tuesday, 26 August"
          title="Good morning, Sarah."
          action={
            <StatePill tone="neutral" onClick={onOpenDashboard} style={{ cursor: "pointer", gap: "6px" }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--accent)" }} />
              Today ›
            </StatePill>
          }
        />
      </div>

      <div style={{ flex: 1, padding: "18px 22px 0", display: "flex", flexDirection: "column", gap: "10px", overflow: "hidden" }}>
        <MessageBubble from="companion">How was last night for the two of you?</MessageBubble>
        <MessageBubble from="caregiver">He was up at 2 and again at 4. Wandered into the kitchen. I got maybe four hours.</MessageBubble>
        <MessageBubble from="companion">
          <div>Four hours is not enough, and this is the fourth night this week. I've noted it.</div>
          <InsetPanel label="Added to Dad's log">
            <ChipRow gap="6px">
              <LogChip>Sleep · 2 wakings</LogChip>
              <LogChip>Night wandering</LogChip>
              <LogChip tone="caution">Your sleep · 4h</LogChip>
            </ChipRow>
          </InsetPanel>
          <div>Was the kitchen the destination, or did he seem to be looking for something?</div>
        </MessageBubble>
        {answered ? (
          <MessageBubble from="caregiver">{answered}</MessageBubble>
        ) : (
          <ChipRow>
            <SuggestionChip onClick={() => onAnswer && onAnswer("Looking for something")}>Looking for something</SuggestionChip>
            <SuggestionChip onClick={() => onAnswer && onAnswer("Just pacing")}>Just pacing</SuggestionChip>
            <SuggestionChip onClick={() => onAnswer && onAnswer("Not sure")}>Not sure</SuggestionChip>
          </ChipRow>
        )}
      </div>

      <div style={{ padding: "16px 20px 22px" }}>
        <Composer placeholder="Type as much or as little as you like" />
      </div>
    </PhoneFrame>
  );
}
