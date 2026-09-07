// Placeholder for caregiver wellbeing assessment items.
// Content defined in Phase 1 per LCWS specification (see AGENTS.md and
// lantern_research/wellbeing scale/caregiver_wellbeing_scale.md).
export type WellbeingItem = {
  id: string;
  question: string;
  domain: string;
};

export const wellbeingItems: WellbeingItem[] = [];
