create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  status text check (status in ('active', 'completed')),
  last_question_index int,
  partial_answers jsonb
);

create table if not exists patient_profile (
  id uuid primary key default gen_random_uuid(),
  stage_id int check (stage_id between 1 and 7),
  stage_confirmed_by_caregiver bool default false,
  stage_confirmed_at timestamptz,
  updated_at timestamptz default now()
);

create table if not exists patient_log (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id),
  log_date timestamptz default now(),
  sleep jsonb,
  nutrition jsonb,
  mobility jsonb,
  behavioral_changes jsonb,
  safety_flags jsonb,
  transition_signals jsonb,
  nothing_notable bool default false,
  source text check (source in ('check_in', 'open_conversation')),
  created_at timestamptz default now()
);

create table if not exists caregiver_state (
  id uuid primary key default gen_random_uuid(),
  burnout_score_current float,
  burnout_score_baseline float,
  score_history jsonb[],
  last_zarit_at timestamptz,
  last_check_in_at timestamptz,
  amber_at timestamptz,
  red_at timestamptz,
  updated_at timestamptz default now()
);

create table if not exists action_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id),
  text text not null,
  tappable_context jsonb,
  is_dismissed bool default false,
  created_at timestamptz default now()
);

create table if not exists vault_chunks (
  id uuid primary key default gen_random_uuid(),
  doc_path text not null,
  heading text,
  content text not null,
  stage_scope int[],
  embedding vector(1024),
  created_at timestamptz default now()
);

create table if not exists onboarding_progress (
  id uuid primary key default gen_random_uuid(),
  current_step text,
  partial_state jsonb,
  updated_at timestamptz default now()
);
