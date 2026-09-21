import type { createClient } from '@/lib/supabase/server';
import { burnoutSignals } from '@/data/burnoutSignals';

type SupabaseServerClient = ReturnType<typeof createClient>;

// Gauge scale: 1 (crisis) – 5 (stable) — the same polarity already used by
// ctx.lcwsLevel in systemPrompt.ts and the daily check-in's 1-5 scale. The
// LCWS baseline/re-screen composite (0-4 domain mean) is offset by 1 onto
// this scale wherever it feeds the gauge (see lantern_research/wellbeing
// scale/caregiver_wellbeing_scale.md's "equivalent to the 1-5 daily check-in
// when offset by 1" note).
export const GAUGE_MIN = 1;
export const GAUGE_MAX = 5;

// Settled decision — do not reopen (see AGENTS.md > Key resolved decisions):
// self-report sentiment 40% / behavioral 30% / LCWS re-screen 30%.
export const SIGNAL_WEIGHTS = {
  selfReportSentiment: 0.4,
  behavioral: 0.3,
  lcwsRescreen: 0.3,
} as const;

// Amber -> red threshold (Phase 5, 2026-09-21). Conservative principle: err
// toward NOT triggering escalation. Red requires score < 3 (LCWS level 2
// "Overwhelmed" or worse) rather than < 4, because the wellbeing-scale doc's
// own Escalation Velocity Logic ties human-support escalation specifically to
// being "stuck at 2" — level 3 ("Strained") is treated there as ordinary
// companion-coaching territory, not an escalation trigger. This keeps the
// amber band as a coaching zone: the system does not surface human-support
// resources merely because a caregiver reports feeling strained for a few
// days, only when sustained signal is Overwhelmed-or-worse.
export const RED_THRESHOLD = 3; // score < RED_THRESHOLD => red
export const AMBER_THRESHOLD = 4; // score < AMBER_THRESHOLD (and >= RED_THRESHOLD) => amber

// Level 2 human-escalation: 3+ consecutive days at red (PRD Feature 4,
// clinically approved 2026-09-06 — see AGENTS.md, implemented exactly).
export const RED_STREAK_ESCALATION_DAYS = 3;

// Missed check-in emergency-contact-outreach trigger (PRD Feature 4, same
// clinical sign-off).
export const MISSED_CHECKIN_ESCALATION_DAYS = 5;

// Biweekly LCWS re-screen cadence.
export const LCWS_RESCREEN_INTERVAL_DAYS = 14;

export type GaugeColor = 'green' | 'amber' | 'red';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function classifyGaugeColor(score: number): GaugeColor {
  if (score < RED_THRESHOLD) return 'red';
  if (score < AMBER_THRESHOLD) return 'amber';
  return 'green';
}

/** Converts an LCWS 0-4 domain composite onto the 1-5 gauge scale. */
export function gaugeScoreFromLcws(lcws0to4: number): number {
  return clamp(lcws0to4 + 1, GAUGE_MIN, GAUGE_MAX);
}

export type ScoreHistoryEntry = {
  at: string;
  type: 'baseline' | 'session' | 'lcws_rescreen';
  compositeScore: number;
  color: GaugeColor;
  sentimentScore?: number;
  behavioralScore?: number;
  lcwsScore?: number;
  sessionId?: string | null;
};

export function buildScoreHistoryEntry(entry: Omit<ScoreHistoryEntry, 'at'>): ScoreHistoryEntry {
  return { at: new Date().toISOString(), ...entry };
}

/** Counts consecutive 'red' entries at the end of score_history (most recent first). */
export function countTrailingRedStreak(history: ScoreHistoryEntry[]): number {
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i]!.color === 'red') {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export type BehavioralScoreInputs = {
  lastCheckInAt: string | null;
  newCheckInAt: string;
  sessionCreatedAt: string;
};

/**
 * Behavioral component (1-5 scale): starts at the best score and subtracts a
 * penalty per active signal, scaled by that signal's weight within
 * data/burnoutSignals.ts's 30% behavioral bucket.
 */
export function computeBehavioralScore(inputs: BehavioralScoreInputs): number {
  const missedGapSignal = burnoutSignals.find((s) => s.id === 'missed_checkin_gap');
  const nightSignal = burnoutSignals.find((s) => s.id === 'night_time_session');
  const range = GAUGE_MAX - GAUGE_MIN;

  let score = GAUGE_MAX;

  const gapDays = inputs.lastCheckInAt
    ? (new Date(inputs.newCheckInAt).getTime() - new Date(inputs.lastCheckInAt).getTime()) / 86_400_000
    : 0;
  if (gapDays > 1 && missedGapSignal) {
    score -= missedGapSignal.weight * range;
  }

  const hour = new Date(inputs.sessionCreatedAt).getUTCHours();
  const isNightTime = hour >= 22 || hour < 5;
  if (isNightTime && nightSignal) {
    score -= nightSignal.weight * range;
  }

  return clamp(score, GAUGE_MIN, GAUGE_MAX);
}

export type CheckinSessionRow = { scheduled_for: string; status: string };

/**
 * Walks backward from yesterday counting consecutive non-completed daily
 * check-in days. Stops at the first date with no session row at all (rather
 * than treating it as a miss) — a missing row means the cron wasn't running
 * yet that day, not that the caregiver skipped a real prompt.
 */
export function computeMissedCheckinStreak(sessions: CheckinSessionRow[], todayISODate: string): number {
  const byDate = new Map(sessions.map((s) => [s.scheduled_for, s]));
  let streak = 0;
  const cursor = new Date(`${todayISODate}T00:00:00Z`);
  for (;;) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    const dateStr = cursor.toISOString().slice(0, 10);
    const row = byDate.get(dateStr);
    if (!row || row.status === 'completed') break;
    streak += 1;
  }
  return streak;
}

type CaregiverStateRow = {
  id: string;
  burnout_score_current: number | null;
  score_history: ScoreHistoryEntry[] | null;
  last_check_in_at: string | null;
  lcws_baseline_score: number | null;
  lcws_latest_score: number | null;
  red_at: string | null;
  amber_at: string | null;
  level2_support_surfaced_at: string | null;
};

export type AggregateSessionSignalsInput = {
  supabase: SupabaseServerClient;
  sessionId: string | null;
  sentimentScore: number;
  sessionCreatedAt: string;
};

export type AggregateSessionSignalsResult = {
  compositeScore: number;
  color: GaugeColor;
  crossedToRed: boolean;
  redStreakDays: number;
  level2ShouldSurface: boolean;
};

/**
 * Runs after a check-in session ends (see app/api/checkin/end). Combines the
 * three settled signal types via SIGNAL_WEIGHTS, appends to score_history
 * (bidirectional — recomputed fresh each time, not a monotonic decay), and
 * updates the streak/escalation bookkeeping columns added in
 * 0005_add_burnout_tracking.sql.
 */
export async function aggregateSessionSignals(
  input: AggregateSessionSignalsInput,
): Promise<AggregateSessionSignalsResult | null> {
  const { supabase, sessionId, sentimentScore, sessionCreatedAt } = input;

  const { data: state } = await supabase
    .from('caregiver_state')
    .select(
      'id,burnout_score_current,score_history,last_check_in_at,lcws_baseline_score,lcws_latest_score,red_at,amber_at,level2_support_surfaced_at',
    )
    .limit(1)
    .maybeSingle();

  if (!state) {
    // Onboarding hasn't completed yet — no gauge row to aggregate into.
    console.warn('[burnout] aggregateSessionSignals called with no caregiver_state row; skipping');
    return null;
  }

  const row = state as CaregiverStateRow;

  if (sessionId != null) {
    const priorHistory = row.score_history ?? [];
    const prior = priorHistory.find((e) => e.sessionId === sessionId);
    if (prior) {
      return {
        compositeScore: prior.compositeScore,
        color: prior.color,
        crossedToRed: false,
        redStreakDays: countTrailingRedStreak(priorHistory),
        level2ShouldSurface: false,
      };
    }
  }

  const now = new Date().toISOString();

  const behavioralScore = computeBehavioralScore({
    lastCheckInAt: row.last_check_in_at,
    newCheckInAt: now,
    sessionCreatedAt,
  });

  const lcws0to4 = row.lcws_latest_score ?? row.lcws_baseline_score ?? 2;
  const lcwsScore = gaugeScoreFromLcws(lcws0to4);

  const compositeScore = clamp(
    sentimentScore * SIGNAL_WEIGHTS.selfReportSentiment +
      behavioralScore * SIGNAL_WEIGHTS.behavioral +
      lcwsScore * SIGNAL_WEIGHTS.lcwsRescreen,
    GAUGE_MIN,
    GAUGE_MAX,
  );

  const previousColor = classifyGaugeColor(row.burnout_score_current ?? compositeScore);
  const color = classifyGaugeColor(compositeScore);
  const crossedToRed = previousColor !== 'red' && color === 'red';

  const entry = buildScoreHistoryEntry({
    type: 'session',
    compositeScore,
    color,
    sentimentScore,
    behavioralScore,
    lcwsScore,
    sessionId,
  });
  const history = [...(row.score_history ?? []), entry];
  const redStreakDays = countTrailingRedStreak(history);

  const redAt = color === 'red' ? (row.red_at ?? now) : null;
  const amberAt = color === 'amber' ? (row.amber_at ?? now) : color === 'green' ? null : row.amber_at;
  const level2ShouldSurface =
    color === 'red' && redStreakDays >= RED_STREAK_ESCALATION_DAYS && row.level2_support_surfaced_at == null;

  const { error: stateUpdateError } = await supabase
    .from('caregiver_state')
    .update({
      burnout_score_current: compositeScore,
      score_history: history,
      last_check_in_at: now,
      red_at: redAt,
      amber_at: amberAt,
      gauge_crossed_red_pending: crossedToRed,
      level2_support_pending: level2ShouldSurface,
      level2_support_surfaced_at: color === 'red' ? row.level2_support_surfaced_at : null,
      missed_checkin_streak: 0,
    })
    .eq('id', row.id);

  if (stateUpdateError) {
    throw new Error(`[burnout] failed to persist gauge state: ${stateUpdateError.message}`);
  }

  return { compositeScore, color, crossedToRed, redStreakDays, level2ShouldSurface };
}
