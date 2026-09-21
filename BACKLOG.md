# Lantern Backlog

Status snapshot as of 2026-09-01. Source of truth for scope/sequencing: `Ref/phase-3-prd.md`
and the corrected build plan (`data/lantern-corrected-build-plan/report.md` in the firstmate
home). Update this file as phases are dispatched and completed, and as decisions land.

## Decisions

| Decision | Status |
|---|---|
| Default view on app open (companion vs. dashboard) | ✅ Resolved — opens on companion |
| Repo delivery (vault/design system/spec docs) | ✅ Resolved — committed |
| API credentials (Anthropic, Voyage, Supabase) | ⚠️ Acknowledged, not yet provisioned |
| Wellbeing-scale doc in RAG index | ✅ Resolved — include |
| Check-in scheduling mechanism | ✅ Resolved — Vercel cron |
| Log confirmation / InsetPanel reconciliation | ✅ Resolved — in-conversation confirmation |
| Proprietary scales | ✅ Resolved — none used; LCWS + Early/Middle/Late are Lantern-original |
| Clinical review scope (D-1) | ✅ Resolved — co-founder reviewed and approved LCWS level descriptions, Early/Middle/Late stage descriptions, and human-escalation thresholds (3-day distress / 5-missed-check-in triggers) on 2026-09-06; six baseline domain items are co-founder-authored text; Finances (seventh domain item) captain-added with clinical co-founder agreement |
| Session persistence model | ✅ Resolved — structured log + rolling end-of-session summary; no raw transcript ever stored |
| Signal weighting (Phase 5) | ✅ Resolved — self-report sentiment 40% / behavioral 30% / LCWS re-screen 30%, named tunable constants in `lib/companion/burnout.ts` (`SIGNAL_WEIGHTS`) |
| Amber→red threshold (Phase 5) | ✅ Resolved — red requires gauge score < 3 (`RED_THRESHOLD` in `lib/companion/burnout.ts`), amber band is 3–4. Conservative principle: grounded in the wellbeing-scale doc's own Escalation Velocity Logic, which ties human-support escalation to being "stuck at 2" (Overwhelmed-or-worse), not to level 3 (Strained) — so amber stays ordinary companion-coaching territory and does not itself trigger escalation |
| Emergency-contact recipient (Phase 5) | ⚠️ Open — no caregiver-designated-contact data model exists anywhere in the schema. The 5-missed-check-in trigger is implemented as the narrowest honest version: `caregiver_state.emergency_contact_outreach_triggered_at` timestamp + a structured `console.warn` in `app/api/cron/daily-checkin/route.ts`, with no recipient or notification channel invented. Raised to firstmate as a `needs-decision` gap. |

## Phases

- [x] **Phase 0 — Project Scaffold & Design System Integration**
  Next.js/TS/Tailwind/shadcn scaffold; commit `design-system/` from the Lamplight source;
  placeholder data modules; `.env.local.example` (includes Supabase Auth vars).

- [x] **Phase 1 — Supabase Schema & RAG Indexing Infrastructure** (M1 part A)
  Seven MVP tables in `supabase/migrations/0001_initial_schema.sql` (sessions, patient_profile,
  patient_log, caregiver_state, action_items, vault_chunks, onboarding_progress). No auth, no
  `user_id` columns, no RLS — access enforced at the API-route layer. Browser + server Supabase
  clients in `lib/supabase/`; Voyage embed + rerank helpers in `lib/voyage/client.ts`.

- [x] **Phase 2 — RAG Pipeline: Indexing & Validation** (M1 gate)
  Chunk and index all vault documents (15, including the wellbeing scale); validate
  Early→Middle transition retrieval test set.
  Scripts: `scripts/index-vault.ts`, `scripts/validate-retrieval.ts`; retrieval: `lib/retrieval/retrieve.ts`.

- [x] **Phase 3 — AI Companion Core: Onboarding** (P0-1 + P0-2, M2 part A)
  Conversational stage inference + LCWS baseline; crisis keyword fallback; `flag_crisis`
  LLM-callable tool; system prompt. Golden-conversation evaluation set
  (`eval/golden-conversations/`) now runs two passes: schema validation + live endpoint
  assertions (crisis 988-check, tool_calls_expected). CI gap: `.github/workflows/golden-conversations.yml`
  still lacks a dev server and secrets — see AGENTS.md > Evaluation set.

- [x] **Phase 4 — Daily Check-in + Patient Log Extraction** (P0-3 + P0-4, M2 gate)
  Vercel cron (`vercel.json`, `app/api/cron/daily-checkin`) writes pending `sessions` row daily;
  `/checkin` screen (Still Water visual direction — see AGENTS.md); `app/api/checkin` (GET/POST);
  `createLogPatientObservationTool` factory persists structured observations to `patient_log`;
  `systemPrompt.ts` + `app/api/chat` updated for `sessionKind:'daily_checkin'`; partial unique
  index in `supabase/migrations/0004_add_checkin_scheduling.sql`.

- [x] **Phase 5 — Burnout Detection + Gauge** (P0-6, M3)
  Signal aggregation (40/30/30 weighting — settled, do not reopen); amber→red threshold
  (conservative — settled, do not reopen). Human escalation path (see
  `Ref/phase-3-prd.md` §5 Feature 4): Level 2 (3+ consecutive days at red threshold)
  surfaces human support resources to the caregiver; 5 consecutive missed check-ins triggers
  outreach to a caregiver-designated emergency contact. Both sit alongside, not in place of,
  the immediate crisis-keyword → 988 Lifeline fallback (that remains immediate and
  non-negotiable, untouched this phase).

  Core module `lib/companion/burnout.ts` (thresholds, weights, `aggregateSessionSignals`,
  `computeBehavioralScore`, streak helpers — see Decisions above for the settled values).
  `data/burnoutSignals.ts` populated with the two behavioral sub-signals (missed-gap,
  night-time session) that make up the 30% behavioral bucket. Session-end summarization +
  sentiment scoring in `lib/companion/sessionEnd.ts`, wired through new `app/api/checkin/end`
  (session completion + post-session aggregation — the `/checkin` UI now has a "Done for today"
  action to reach it). Onboarding (`app/api/onboard`) seeds the initial gauge score + baseline
  `score_history` entry from the LCWS composite. Biweekly LCWS re-screen (`record_lcws_rescreen`
  tool in `lib/companion/tools.ts`, wired into `app/api/chat`) re-uses the existing companion/chat
  machinery rather than a parallel flow. Reusable `components/Gauge.tsx` (plain-language label,
  Lamplight `sage`/`ochre`/`clay` tokens — never a bare score as the headline) plus a minimal dev
  scaffold at `app/gauge-preview` (`app/api/gauge` GET) — not the Phase 6 dashboard.
  New migration: `supabase/migrations/0005_add_burnout_tracking.sql`.
  Blocked by: Phase 3, Phase 4.

  Additional acceptance criteria (human escalation path):
  - [x] After 3+ consecutive days of qualifying distress / red-threshold signal, companion surfaces human support resources to the caregiver (caregiver support orgs, respite resources — not 988, which is immediate-crisis only) — `RED_STREAK_ESCALATION_DAYS` in `lib/companion/burnout.ts`, surfaced via `surfaceHumanSupportResources` in `systemPrompt.ts`
  - [x] Human-escalation threshold logic (3-day and 5-missed-check-in triggers) — clinically approved 2026-09-06 (D-1 resolved)
  - [⚠️] After 5 consecutive missed check-ins, system triggers outreach to caregiver-designated emergency contact — narrowest-honest partial: the trigger itself fires and is recorded (`emergency_contact_outreach_triggered_at`, `app/api/cron/daily-checkin`), but no caregiver-designated-contact data model or actual notification channel exists yet (out of Phase 5's scope to invent) — see Decisions above and status file for the open `needs-decision`

- [ ] **Phase 6 — Dashboard** (P0-8, M4)
  3-panel read-only dashboard: patient stage, burnout gauge, action items.
  Blocked by: Phase 3, Phase 5.

- [ ] **Phase 7 — Transition Detection** (P0-5, M2 completion / pre-M5)
  Code can be built once Phase 2 + 4 are done; real validation needs 2+ weeks of live data.
  Blocked by: Phase 2, Phase 4.

- [ ] **Phase 8 — Pre-Launch Hardening & System Prompt Testing** (M5 prerequisites)
  Crisis protocol adversarial testing (both `CRISIS_KEYWORDS` bypass and `flag_crisis`
  LLM-callable tool path), prompt-injection guardrail, human-escalation thresholds verified,
  1 week founder daily use. Run full golden-conversation eval set against real companion
  (assert all `expected_output` fields — see `eval/golden-conversations/`).
  Blocked by: Phases 3–7.

- [ ] **Phase 9 — First Real User (M5) and 10-User Validation (M6)**
  Blocked by: Phase 8 + M5 gate passed.

## Notes

- Phases 0 and 1 are complete. Phase 2 (RAG pipeline) is next.
- Full decision rationale and captain answers: `data/lantern-corrected-build-plan/decisions.md`
  in the firstmate home.
