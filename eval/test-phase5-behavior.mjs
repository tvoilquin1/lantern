/**
 * Phase 5 behavioral tests — exercise public interfaces and assert observable state.
 * Run with: node eval/test-phase5-behavior.mjs
 */
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const _require = createRequire(import.meta.url);
const jitiFactory = _require(_require.resolve("jiti/lib/index.js", { paths: [PROJECT_ROOT] }));
const jiti = jitiFactory(PROJECT_ROOT + "/", {
  alias: { "@": PROJECT_ROOT },
  interopDefault: true,
});

let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, label) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    errors.push(label);
    console.log(`  FAIL  ${label}`);
  }
}

const burnout = jiti(path.join(PROJECT_ROOT, "lib/companion/burnout.ts"));
const {
  GAUGE_MIN,
  GAUGE_MAX,
  RED_THRESHOLD,
  AMBER_THRESHOLD,
  RED_STREAK_ESCALATION_DAYS,
  MISSED_CHECKIN_ESCALATION_DAYS,
  SIGNAL_WEIGHTS,
  classifyGaugeColor,
  gaugeScoreFromLcws,
  clamp,
  buildScoreHistoryEntry,
  countTrailingRedStreak,
  computeBehavioralScore,
  aggregateSessionSignals,
  computeMissedCheckinStreak,
} = burnout;

// ─── 1. classifyGaugeColor — threshold crossings ───────────────────────────
console.log("\n[1] classifyGaugeColor — threshold crossings");

assert(classifyGaugeColor(GAUGE_MAX) === "green", `score ${GAUGE_MAX} (max) classifies green`);
assert(
  classifyGaugeColor(AMBER_THRESHOLD) === "green",
  `score at AMBER_THRESHOLD (${AMBER_THRESHOLD}) classifies green (boundary is exclusive on the amber side)`
);
assert(
  classifyGaugeColor(AMBER_THRESHOLD - 0.01) === "amber",
  "score just below AMBER_THRESHOLD classifies amber"
);
assert(
  classifyGaugeColor(RED_THRESHOLD) === "amber",
  `score at RED_THRESHOLD (${RED_THRESHOLD}) classifies amber (boundary is exclusive on the red side)`
);
assert(
  classifyGaugeColor(RED_THRESHOLD - 0.01) === "red",
  "score just below RED_THRESHOLD classifies red"
);
assert(classifyGaugeColor(GAUGE_MIN) === "red", `score ${GAUGE_MIN} (min) classifies red`);

// ─── 2. gaugeScoreFromLcws — 0-4 LCWS composite onto 1-5 gauge scale ───────
console.log("\n[2] gaugeScoreFromLcws — LCWS composite conversion");

assert(gaugeScoreFromLcws(0) === 1, "LCWS 0 (crisis) maps to gauge 1");
assert(gaugeScoreFromLcws(4) === 5, "LCWS 4 (stable) maps to gauge 5");
assert(gaugeScoreFromLcws(2) === 3, "LCWS 2 maps to gauge 3");
assert(gaugeScoreFromLcws(10) === GAUGE_MAX, "out-of-range LCWS input clamps to GAUGE_MAX");
assert(gaugeScoreFromLcws(-10) === GAUGE_MIN, "out-of-range LCWS input clamps to GAUGE_MIN");

// ─── 3. clamp ───────────────────────────────────────────────────────────────
console.log("\n[3] clamp — bounds enforcement");

assert(clamp(3, 1, 5) === 3, "value within bounds is unchanged");
assert(clamp(10, 1, 5) === 5, "value above max clamps to max");
assert(clamp(-10, 1, 5) === 1, "value below min clamps to min");

// ─── 4. countTrailingRedStreak — bidirectional movement ────────────────────
console.log("\n[4] countTrailingRedStreak — bidirectional movement");

const entry = (color) => ({
  at: new Date().toISOString(),
  type: "session",
  compositeScore: 2,
  color,
});

assert(countTrailingRedStreak([]) === 0, "empty history has zero streak");
assert(countTrailingRedStreak([entry("red")]) === 1, "single red entry has streak of 1");
assert(
  countTrailingRedStreak([entry("red"), entry("red"), entry("red")]) === 3,
  "three consecutive red entries has streak of 3"
);
assert(
  countTrailingRedStreak([entry("red"), entry("red"), entry("green")]) === 0,
  "streak resets to 0 once the most recent entry moves back to green (bidirectional, not monotonic)"
);
assert(
  countTrailingRedStreak([entry("amber"), entry("red"), entry("red")]) === 2,
  "streak only counts the trailing run of red, not earlier red entries broken by a non-red entry"
);

// ─── 5. computeBehavioralScore — missed-gap and night-time signals ─────────
console.log("\n[5] computeBehavioralScore — behavioral signal penalties");

const dayTime = "2026-09-21T15:00:00.000Z";
const nightTime = "2026-09-21T02:00:00.000Z";

// aggregateSessionSignals computes its own "now" internally (real wall-clock
// time) rather than taking it as an input, so last_check_in_at fixtures below
// are anchored to the actual current time (not a fixed date) to guarantee no
// unintended missed-gap behavioral penalty regardless of when this test runs.
const recentCheckIn = () => new Date(Date.now() - 60 * 60 * 1000).toISOString();

const noPenalty = computeBehavioralScore({
  lastCheckInAt: "2026-09-20T15:00:00.000Z",
  newCheckInAt: "2026-09-21T15:00:00.000Z",
  sessionCreatedAt: dayTime,
});
assert(
  noPenalty === GAUGE_MAX,
  "no missed-gap or night-time signal yields the max behavioral score"
);

const gapPenalty = computeBehavioralScore({
  lastCheckInAt: "2026-09-15T15:00:00.000Z",
  newCheckInAt: "2026-09-21T15:00:00.000Z",
  sessionCreatedAt: dayTime,
});
assert(
  gapPenalty < GAUGE_MAX,
  "a multi-day gap since the last check-in lowers the behavioral score"
);

const nightPenalty = computeBehavioralScore({
  lastCheckInAt: "2026-09-20T15:00:00.000Z",
  newCheckInAt: "2026-09-21T15:00:00.000Z",
  sessionCreatedAt: nightTime,
});
assert(nightPenalty < GAUGE_MAX, "a night-time session lowers the behavioral score");
assert(nightPenalty >= GAUGE_MIN, "behavioral score never drops below GAUGE_MIN");

const bothPenalties = computeBehavioralScore({
  lastCheckInAt: "2026-09-15T15:00:00.000Z",
  newCheckInAt: "2026-09-21T15:00:00.000Z",
  sessionCreatedAt: nightTime,
});
assert(
  bothPenalties <= gapPenalty && bothPenalties <= nightPenalty,
  "combined signals lower the score at least as much as either alone"
);

// ─── 6. buildScoreHistoryEntry ──────────────────────────────────────────────
console.log("\n[6] buildScoreHistoryEntry — shape");

const built = buildScoreHistoryEntry({
  type: "session",
  compositeScore: 4,
  color: "green",
  sessionId: "abc",
});
assert(
  typeof built.at === "string" && !Number.isNaN(Date.parse(built.at)),
  'entry has a valid ISO "at" timestamp'
);
assert(
  built.type === "session" && built.compositeScore === 4 && built.color === "green",
  "entry preserves the passed-in fields"
);

// ─── 7. aggregateSessionSignals — signal aggregation, bidirectional movement, escalation triggers ───
console.log("\n[7] aggregateSessionSignals — signal aggregation and escalation triggers");

function makeMockSupabase(initialRow) {
  let row = { ...initialRow };
  let updatePayload = null;
  return {
    from(table) {
      assert(
        table === "caregiver_state",
        `aggregateSessionSignals reads/writes the caregiver_state table (got "${table}")`
      );
      return {
        select: () => ({
          limit: () => ({
            maybeSingle: async () => ({ data: row, error: null }),
          }),
        }),
        update: (payload) => ({
          eq: async () => {
            updatePayload = payload;
            row = { ...row, ...payload };
            return { data: null, error: null };
          },
        }),
      };
    },
    getUpdatePayload: () => updatePayload,
  };
}

{
  // Weighted composite: a stable caregiver with a positive self-report should land green.
  const mock = makeMockSupabase({
    id: "state-1",
    burnout_score_current: 5,
    score_history: [],
    last_check_in_at: recentCheckIn(),
    lcws_baseline_score: 4,
    lcws_latest_score: 4,
    red_at: null,
    amber_at: null,
    level2_support_surfaced_at: null,
  });

  const result = await aggregateSessionSignals({
    supabase: mock,
    sessionId: "session-1",
    sentimentScore: 5,
    sessionCreatedAt: dayTime,
  });

  const expectedComposite =
    5 * SIGNAL_WEIGHTS.selfReportSentiment +
    GAUGE_MAX * SIGNAL_WEIGHTS.behavioral +
    5 * SIGNAL_WEIGHTS.lcwsRescreen;
  assert(
    Math.abs(result.compositeScore - expectedComposite) < 0.001,
    "composite score matches the documented SIGNAL_WEIGHTS formula"
  );
  assert(result.color === "green", "a fully positive session classifies green");
  assert(result.crossedToRed === false, "no red crossing when starting green and staying green");
  assert(
    mock.getUpdatePayload().score_history.length === 1,
    "score_history gains exactly one entry per session"
  );
}

{
  // Crossing into red for the first time should set crossedToRed and not yet trigger Level 2.
  const mock = makeMockSupabase({
    id: "state-2",
    burnout_score_current: 4,
    score_history: [],
    last_check_in_at: recentCheckIn(),
    lcws_baseline_score: 0,
    lcws_latest_score: 0,
    red_at: null,
    amber_at: "2026-09-19T00:00:00.000Z",
    level2_support_surfaced_at: null,
  });

  const result = await aggregateSessionSignals({
    supabase: mock,
    sessionId: "session-2",
    sentimentScore: 1,
    sessionCreatedAt: dayTime,
  });

  assert(result.color === "red", "a fully negative session classifies red");
  assert(result.crossedToRed === true, "first red session after a non-red state sets crossedToRed");
  assert(
    result.level2ShouldSurface === false,
    "a single red day does not yet trigger Level 2 (needs RED_STREAK_ESCALATION_DAYS)"
  );
  assert(
    mock.getUpdatePayload().gauge_crossed_red_pending === true,
    "gauge_crossed_red_pending is persisted for the next session to consume"
  );
}

{
  // Bidirectional movement: pre-seed a red history, then have this session recover to green.
  const redEntry = {
    at: "2026-09-19T00:00:00.000Z",
    type: "session",
    compositeScore: 1.5,
    color: "red",
  };
  const mock = makeMockSupabase({
    id: "state-3",
    burnout_score_current: 1.5,
    score_history: [redEntry, redEntry],
    last_check_in_at: recentCheckIn(),
    lcws_baseline_score: 4,
    lcws_latest_score: 4,
    red_at: "2026-09-18T00:00:00.000Z",
    amber_at: null,
    level2_support_surfaced_at: null,
  });

  const result = await aggregateSessionSignals({
    supabase: mock,
    sessionId: "session-3",
    sentimentScore: 5,
    sessionCreatedAt: dayTime,
  });

  assert(result.color === "green", "a recovering session moves the gauge back to green");
  assert(
    result.redStreakDays === 0,
    "red streak resets to 0 once the gauge moves back to green (bidirectional, not monotonic decay)"
  );
  assert(mock.getUpdatePayload().red_at === null, "red_at is cleared once the gauge leaves red");
}

{
  // Level 2 escalation: three consecutive red sessions should surface human support once, not repeatedly.
  const redEntry = {
    at: "2026-09-19T00:00:00.000Z",
    type: "session",
    compositeScore: 1.5,
    color: "red",
  };
  const mock = makeMockSupabase({
    id: "state-4",
    burnout_score_current: 1.5,
    score_history: [redEntry, redEntry],
    last_check_in_at: recentCheckIn(),
    lcws_baseline_score: 0,
    lcws_latest_score: 0,
    red_at: "2026-09-18T00:00:00.000Z",
    amber_at: null,
    level2_support_surfaced_at: null,
  });

  const result = await aggregateSessionSignals({
    supabase: mock,
    sessionId: "session-4",
    sentimentScore: 1,
    sessionCreatedAt: dayTime,
  });

  assert(
    result.redStreakDays === RED_STREAK_ESCALATION_DAYS,
    `three consecutive red sessions reaches RED_STREAK_ESCALATION_DAYS (${RED_STREAK_ESCALATION_DAYS})`
  );
  assert(
    result.level2ShouldSurface === true,
    "Level 2 human-support escalation triggers once the red streak reaches RED_STREAK_ESCALATION_DAYS"
  );
  assert(
    mock.getUpdatePayload().level2_support_pending === true,
    "level2_support_pending is persisted for the checkin route to consume and surface"
  );

  // A subsequent red session should not re-trigger Level 2 once already surfaced.
  const mockAlreadySurfaced = makeMockSupabase({
    id: "state-5",
    burnout_score_current: 1.5,
    score_history: [redEntry, redEntry, redEntry],
    last_check_in_at: recentCheckIn(),
    lcws_baseline_score: 0,
    lcws_latest_score: 0,
    red_at: "2026-09-18T00:00:00.000Z",
    amber_at: null,
    level2_support_surfaced_at: "2026-09-21T00:00:00.000Z",
  });

  const resultAlreadySurfaced = await aggregateSessionSignals({
    supabase: mockAlreadySurfaced,
    sessionId: "session-5",
    sentimentScore: 1,
    sessionCreatedAt: dayTime,
  });

  assert(
    resultAlreadySurfaced.level2ShouldSurface === false,
    "Level 2 does not re-trigger once level2_support_surfaced_at is already set — surfaced once, not every red session"
  );
}

{
  // No caregiver_state row (onboarding incomplete) — must not throw, returns null.
  const mock = {
    from: () => ({
      select: () => ({
        limit: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  };

  const result = await aggregateSessionSignals({
    supabase: mock,
    sessionId: "session-6",
    sentimentScore: 3,
    sessionCreatedAt: dayTime,
  });

  assert(
    result === null,
    "aggregateSessionSignals returns null (not throw) when no caregiver_state row exists yet"
  );
}

{
  // Idempotency: if score_history already contains an entry for this sessionId,
  // aggregateSessionSignals must return the prior result without appending a second entry.
  const priorEntry = {
    at: "2026-09-21T10:00:00.000Z",
    type: "session",
    compositeScore: 4.2,
    color: "green",
    sentimentScore: 5,
    behavioralScore: 5,
    lcwsScore: 5,
    sessionId: "session-idempotent",
  };
  const mock = makeMockSupabase({
    id: "state-idem",
    burnout_score_current: 4.2,
    score_history: [priorEntry],
    last_check_in_at: recentCheckIn(),
    lcws_baseline_score: 4,
    lcws_latest_score: 4,
    red_at: null,
    amber_at: null,
    level2_support_surfaced_at: null,
  });

  const result = await aggregateSessionSignals({
    supabase: mock,
    sessionId: "session-idempotent",
    sentimentScore: 1,
    sessionCreatedAt: dayTime,
  });

  assert(
    result !== null && result.compositeScore === priorEntry.compositeScore,
    "idempotent retry returns the prior compositeScore without re-aggregating"
  );
  assert(
    mock.getUpdatePayload() === null,
    "idempotent retry does not write to caregiver_state a second time"
  );
}

{
  // DB write failure: if caregiver_state.update returns an error, aggregateSessionSignals must throw.
  const failingMock = {
    from(table) {
      return {
        select: () => ({
          limit: () => ({
            maybeSingle: async () => ({
              data: {
                id: "state-fail",
                burnout_score_current: 5,
                score_history: [],
                last_check_in_at: recentCheckIn(),
                lcws_baseline_score: 4,
                lcws_latest_score: 4,
                red_at: null,
                amber_at: null,
                level2_support_surfaced_at: null,
              },
              error: null,
            }),
          }),
        }),
        update: () => ({
          eq: async () => ({ data: null, error: { message: "connection timeout", code: "500" } }),
        }),
      };
    },
  };

  let threw = false;
  try {
    await aggregateSessionSignals({
      supabase: failingMock,
      sessionId: "session-fail",
      sentimentScore: 4,
      sessionCreatedAt: dayTime,
    });
  } catch {
    threw = true;
  }
  assert(threw, "aggregateSessionSignals throws when caregiver_state update returns an error");
}

// ─── 8. Missed check-in streak — Level 2 emergency-contact trigger threshold ───
console.log("\n[8] Missed check-in streak — emergency-contact outreach trigger");

const sessionsAllMissed = [
  { scheduled_for: "2026-09-20", status: "pending" },
  { scheduled_for: "2026-09-19", status: "pending" },
  { scheduled_for: "2026-09-18", status: "pending" },
  { scheduled_for: "2026-09-17", status: "pending" },
  { scheduled_for: "2026-09-16", status: "pending" },
];
assert(
  computeMissedCheckinStreak(sessionsAllMissed, "2026-09-21") === 5,
  "five consecutive pending (missed) days computes a streak of 5, reaching MISSED_CHECKIN_ESCALATION_DAYS"
);
assert(MISSED_CHECKIN_ESCALATION_DAYS === 5, "MISSED_CHECKIN_ESCALATION_DAYS is documented as 5");

const sessionsRecovered = [
  { scheduled_for: "2026-09-20", status: "completed" },
  { scheduled_for: "2026-09-19", status: "pending" },
  { scheduled_for: "2026-09-18", status: "pending" },
];
assert(
  computeMissedCheckinStreak(sessionsRecovered, "2026-09-21") === 0,
  "a completed check-in yesterday resets the streak to 0 even if earlier days were missed (walks backward, stops at first completed)"
);

const sessionsNoHistory = [{ scheduled_for: "2026-09-20", status: "pending" }];
assert(
  computeMissedCheckinStreak(sessionsNoHistory, "2026-09-21") === 1,
  "streak stops (does not count as missed) at the first date with no session row at all — only 1 real missed day counted"
);

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} checks — ${passed} passed, ${failed} failed`);
if (errors.length > 0) {
  console.log("\nFailed:");
  errors.forEach((e) => console.log(`  - ${e}`));
  process.exit(1);
}
