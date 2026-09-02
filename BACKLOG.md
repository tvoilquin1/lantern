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
| Zarit Burden Interview item selection | ⏸️ Deferred — pending Eddy's clinical input |
| Clinical review scope (M5 gate) | ⏸️ Deferred — pending Eddy's clinical input |
| Session persistence model | 🟡 Recommendation given (structured log + rolling summary), awaiting captain confirmation |

## Phases

- [ ] **Phase 0 — Project Scaffold & Design System Integration**
  Next.js/TS/Tailwind/shadcn scaffold; commit `design-system/` from the Lamplight source;
  placeholder data modules; `.env.local.example`.
  Blocked by: none (repo delivery decision is resolved — unblocked, not yet dispatched).

- [ ] **Phase 1 — Supabase Schema & RAG Indexing Infrastructure** (M1 part A)
  Supabase project + pgvector, all MVP tables, Supabase/Voyage client helpers.
  Blocked by: Phase 0; API credentials not yet provisioned.

- [ ] **Phase 2 — RAG Pipeline: Indexing & Validation** (M1 gate)
  Chunk and index all vault documents (15, including the wellbeing scale); validate
  Stage 4→5 retrieval test set.
  Blocked by: Phase 1.

- [ ] **Phase 3 — AI Companion Core: Onboarding** (P0-1 + P0-2, M2 part A)
  Conversational GDS onboarding + Zarit baseline; crisis keyword fallback; system prompt.
  Blocked by: M1 gate; Zarit item selection (deferred, pending Eddy); session persistence
  confirmation.

- [ ] **Phase 4 — Daily Check-in + Patient Log Extraction** (P0-3 + P0-4, M2 gate)
  Companion-initiated check-in (Vercel cron); `log_patient_observation` tool extraction.
  Blocked by: Phase 3.

- [ ] **Phase 5 — Burnout Detection + Gauge** (P0-6, M3)
  Signal aggregation (40/30/30 weighting — settled, do not reopen); amber→red threshold
  (conservative — settled, do not reopen).
  Blocked by: Phase 3, Phase 4.

- [ ] **Phase 6 — Dashboard** (P0-8, M4)
  3-panel read-only dashboard: patient stage, burnout gauge, action items.
  Blocked by: Phase 3, Phase 5.

- [ ] **Phase 7 — Transition Detection** (P0-5, M2 completion / pre-M5)
  Code can be built once Phase 2 + 4 are done; real validation needs 2+ weeks of live data.
  Blocked by: Phase 2, Phase 4.

- [ ] **Phase 8 — Pre-Launch Hardening & System Prompt Testing** (M5 prerequisites)
  Crisis protocol adversarial testing, prompt-injection guardrail, 1 week founder daily use.
  Blocked by: Phases 3–7; clinical review sign-off (deferred, pending Eddy).

- [ ] **Phase 9 — First Real User (M5) and 10-User Validation (M6)**
  Blocked by: Phase 8 + M5 gate passed.

## Notes

- No ship tasks have been dispatched yet — the project is pre-Phase-0.
- Full decision rationale and captain answers: `data/lantern-corrected-build-plan/decisions.md`
  in the firstmate home.
