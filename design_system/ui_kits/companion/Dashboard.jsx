import React from "react";
import { Card } from "../../components/surfaces/Card.jsx";
import { SectionLabel } from "../../components/surfaces/SectionLabel.jsx";
import { StatePill } from "../../components/status/StatePill.jsx";
import { StageHeadline } from "../../components/status/StageHeadline.jsx";
import { Sparkline } from "../../components/status/Sparkline.jsx";
import { TrendRow } from "../../components/status/TrendRow.jsx";
import { StateTrack } from "../../components/status/StateTrack.jsx";
import { TaskItem } from "../../components/actions/TaskItem.jsx";
import { Composer } from "../../components/conversation/Composer.jsx";
import { PhoneFrame } from "./PhoneFrame.jsx";

/** The three questions: where is he, where am I, what's in front of me. */
export function Dashboard({ onBack, onOpenBrief }) {
  return (
    <PhoneFrame>
      <div style={{ padding: "22px 26px 0", display: "flex", gap: "7px", alignItems: "center", fontSize: "13px", fontWeight: 600, color: "var(--text-faint)", cursor: "pointer" }} onClick={onBack}>
        <div style={{ width: 6, height: 6, borderRadius: 999, background: "var(--accent)" }} />
        <div>Lantern</div>
      </div>

      <div style={{ padding: "20px 26px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700, letterSpacing: "-0.015em", fontSize: "22px", color: "var(--text-primary)" }}>Today</div>
        <SectionLabel>Tue, 26 Aug</SectionLabel>
      </div>

      <div style={{ padding: "14px 20px 0", display: "flex", flexDirection: "column", gap: "9px" }}>
        <Card onClick={onOpenBrief} style={{ cursor: "pointer", paddingBottom: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SectionLabel>Where Dad is</SectionLabel>
            <StatePill tone="steady">Steady</StatePill>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <StageHeadline stage="Early" qualifier="moderate" />
            <div style={{ fontSize: "14px", lineHeight: 1.55, color: "var(--text-body)" }}>Nothing has shifted in the last three weeks.</div>
          </div>
          <Sparkline values={[40, 52, 44, 60, 55, 70, 66]} />
          <TrendRow items={[
            { label: "Sleep", value: "Worsening", tone: "caution" },
            { label: "Eating", value: "Steady" },
            { label: "Mobility", value: "Steady" }
          ]} />
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SectionLabel>Where you are</SectionLabel>
            <StatePill tone="caution">Stretched</StatePill>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <StateTrack value={64} tone="caution" />
            <div style={{ fontSize: "14px", lineHeight: 1.55, color: "var(--text-body)" }}>
              You've been up past 1am four nights running. That's usually the first sign, not the last.
            </div>
          </div>
        </Card>

        <Card variant="dark">
          <SectionLabel onDark>In front of you</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <TaskItem onDark>Two hours of respite care this week — I found three options near you.</TaskItem>
            <TaskItem onDark>Move Dad's bedtime routine 30 minutes earlier.</TaskItem>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: "auto", padding: "16px 20px 22px" }}>
        <Composer onSend={onBack} />
      </div>
    </PhoneFrame>
  );
}
