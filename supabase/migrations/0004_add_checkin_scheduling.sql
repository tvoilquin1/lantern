-- Phase 4: daily check-in scheduling. Adds session kind/scheduling fields so a
-- Vercel cron job can write a pending check-in record each morning, and the
-- app can tell an onboarding/open conversation apart from a scheduled check-in.

alter table sessions drop constraint if exists sessions_status_check;
alter table sessions add constraint sessions_status_check
  check (status in ('pending', 'active', 'completed'));

alter table sessions add column if not exists kind text
  check (kind in ('onboarding', 'daily_checkin', 'open_conversation'))
  default 'open_conversation';

alter table sessions add column if not exists scheduled_for date;

-- One daily check-in per calendar date at MVP (single-caregiver, no user_id —
-- see AGENTS.md > Key resolved decisions > Auth). Guards against the cron
-- firing twice for the same morning.
create unique index if not exists sessions_daily_checkin_once_per_day
  on sessions (scheduled_for)
  where kind = 'daily_checkin';
