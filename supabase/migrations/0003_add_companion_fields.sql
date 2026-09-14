alter table sessions add column if not exists summary text;

alter table caregiver_state add column if not exists lcws_baseline_score float;
alter table caregiver_state add column if not exists lcws_overall_burden_score float;
