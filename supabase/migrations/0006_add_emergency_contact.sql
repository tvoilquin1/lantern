-- Phase 5 follow-up: real caregiver-designated emergency contact, replacing
-- the honest no-op recorded in 0005_add_burnout_tracking.sql
-- (emergency_contact_outreach_triggered_at) with an actual recipient. Email
-- channel first — SMS is deferred until the app is paid (see AGENTS.md > Key
-- resolved decisions, BACKLOG.md).
--
-- Captured conversationally during onboarding (app/api/onboard/route.ts,
-- 'emergency_contact' step) and optional — the caregiver can skip, leaving
-- all four columns null. Consumed by the 5-missed-check-in outreach trigger
-- in app/api/cron/daily-checkin/route.ts.
--
-- emergency_contact_phone is captured and stored only — SMS sending is out
-- of scope until the app is paid (see AGENTS.md > Key resolved decisions).

alter table caregiver_state add column if not exists emergency_contact_name text;
alter table caregiver_state add column if not exists emergency_contact_email text;
alter table caregiver_state add column if not exists emergency_contact_phone text;
alter table caregiver_state add column if not exists emergency_contact_relationship text;
