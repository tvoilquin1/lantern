// Behavioral signals used to detect caregiver burnout patterns.
// Populated in Phase 1 (companion build). See AGENTS.md > Key resolved decisions.
export type BurnoutSignal = {
  id: string;
  pattern: string;
  weight: number;
};

export const burnoutSignals: BurnoutSignal[] = [];
