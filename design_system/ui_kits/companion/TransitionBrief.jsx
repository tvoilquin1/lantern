import React from "react";
import { Card } from "../../components/surfaces/Card.jsx";
import { SectionLabel } from "../../components/surfaces/SectionLabel.jsx";
import { StatePill } from "../../components/status/StatePill.jsx";
import { GuidanceList } from "../../components/actions/GuidanceList.jsx";
import { Button } from "../../components/actions/Button.jsx";
import { PhoneFrame } from "./PhoneFrame.jsx";

/** Transition detection, framed as something to know — never as an alert. */
export function TransitionBrief({ onBack }) {
  return (
    <PhoneFrame>
      <div style={{ padding: "26px 26px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={onBack} style={{ fontSize: "22px", color: "var(--text-faint)", cursor: "pointer", lineHeight: 1 }}>←</div>
        <SectionLabel>Something to know</SectionLabel>
        <div style={{ width: "22px" }} />
      </div>

      <div style={{ padding: "24px 26px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
        <StatePill tone="caution" style={{ alignSelf: "flex-start", padding: "6px 12px" }}>Possible shift ahead</StatePill>
        <div style={{ fontWeight: 700, letterSpacing: "-0.015em", fontSize: "25px", lineHeight: 1.18, color: "var(--text-primary)" }}>
          The pattern in Dad's last two weeks looks like an early shift toward the Middle stage.
        </div>
        <div style={{ fontSize: "14px", lineHeight: 1.55, color: "var(--text-body)", textWrap: "pretty" }}>
          Night wandering, needing help with buttons, and calling you by your mother's name are three of the changes that usually appear together at this point. This is a pattern in your logs, not a diagnosis — his doctor is the one to confirm it.
        </div>
      </div>

      <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: "11px" }}>
        <Card variant="panel" style={{ padding: "16px 18px" }}>
          <SectionLabel size="sm">What tends to help now</SectionLabel>
          <GuidanceList items={[
            "Lay out clothes in the order they go on. It buys back the dressing hour.",
            "A night light in the hallway and a bed sensor, before the next wandering night.",
            "When he uses the wrong name, answer the feeling, not the fact."
          ]} />
        </Card>

        <Card variant="muted" gap="var(--space-8)" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--text-secondary)" }}>Bring this to his next appointment</div>
          <div style={{ fontSize: "13.5px", lineHeight: 1.55, color: "var(--text-body)" }}>A one-page summary of the last 14 days, ready to print or send.</div>
        </Card>
      </div>

      <div style={{ marginTop: "auto", padding: "18px 20px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Button onClick={onBack}>Talk this through with Lantern</Button>
        <Button variant="quiet" onClick={onBack}>Not now</Button>
      </div>
    </PhoneFrame>
  );
}
