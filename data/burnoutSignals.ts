// Behavioral signals used to detect caregiver burnout patterns.
// Populated in Phase 5 (burnout gauge). See AGENTS.md > Key resolved decisions.
//
// These are sub-weights *within* the behavioral component of the overall
// signal-weighting model (self-report sentiment 40% / behavioral 30% / LCWS
// re-screen 30% — see lib/companion/burnout.ts SIGNAL_WEIGHTS). Weights below
// must sum to 1 and are combined in lib/companion/burnout.ts's
// computeBehavioralScore.
//
// Both signals are derived only from existing `sessions` timestamps
// (created_at, and caregiver_state.last_check_in_at) — no new tracking
// surface, per the Phase 5 brief.
export type BurnoutSignal = {
  id: string;
  pattern: string;
  weight: number;
};

export const burnoutSignals: BurnoutSignal[] = [
  {
    id: 'missed_checkin_gap',
    pattern:
      'Gap of more than one day since the last completed check-in (caregiver_state.last_check_in_at vs. this session).',
    weight: 0.6,
  },
  {
    id: 'night_time_session',
    pattern:
      'Session created between 22:00 and 05:00 (server clock) — a late-night or pre-dawn session, associated with disrupted sleep and elevated stress.',
    weight: 0.4,
  },
];
