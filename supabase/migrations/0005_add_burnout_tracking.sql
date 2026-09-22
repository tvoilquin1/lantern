-- Phase 5: burnout gauge signal aggregation + human-escalation tracking.
-- caregiver_state already carries burnout_score_current/baseline, score_history,
-- last_lcws_at, last_check_in_at, amber_at, red_at (0001_initial_schema.sql) and
-- lcws_baseline_score/lcws_overall_burden_score (0003). This adds:
--
-- - lcws_latest_score / lcws_latest_overall_burden_score: the LCWS composite as
--   of the most recent biweekly re-screen (lcws_baseline_score stays the
--   onboarding-time value, never overwritten — see lib/companion/burnout.ts).
-- - missed_checkin_streak: consecutive missed daily check-ins. Computed by the
--   cron route (app/api/cron/daily-checkin) since a missed day never produces a
--   sessions row for signal aggregation to key off of.
-- - gauge_crossed_red_pending / level2_support_pending: set when post-session
--   aggregation detects an amber->red crossing or a 3+ consecutive-day red
--   streak; consumed and cleared the next time a check-in opens (Ref/phase-3-prd.md
--   Feature 4 — the reaction necessarily happens in the *next* session, since
--   aggregation runs after a session ends).
-- - level2_support_surfaced_at: dedupes Level 2 human-support surfacing to once
--   per red streak.
-- - emergency_contact_outreach_triggered_at: records the 5+ missed-check-in
--   trigger. No caregiver-designated emergency contact exists anywhere in the
--   data model (see AGENTS.md > Key resolved decisions) — this column is the
--   narrowest-honest implementation: a timestamped record, not a notification.

alter table caregiver_state add column if not exists lcws_latest_score float;
alter table caregiver_state add column if not exists lcws_latest_overall_burden_score float;
alter table caregiver_state add column if not exists missed_checkin_streak int not null default 0;
alter table caregiver_state add column if not exists gauge_crossed_red_pending boolean not null default false;
alter table caregiver_state add column if not exists level2_support_pending boolean not null default false;
alter table caregiver_state add column if not exists level2_support_surfaced_at timestamptz;
alter table caregiver_state add column if not exists emergency_contact_outreach_triggered_at timestamptz;
