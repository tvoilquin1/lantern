// Placeholder for caregiver wellbeing assessment items.
// Name retained from build plan doc; this is NOT the Zarit Burden Interview.
// Content defined in Phase 1 per LCWS specification (see AGENTS.md and
// lantern_research/wellbeing scale/caregiver_wellbeing_scale.md).
export type WellbeingItem = {
  id: string;
  question: string;
  domain: string;
};

export const zaritItems: WellbeingItem[] = [];
