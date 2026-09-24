# AGENTS.md — Lantern Agent Guidelines

Instructions for AI agents (Claude Code, Firstmate, and any future orchestrators) working in this repository.

---

## Scope

This repository is a Next.js 14 App Router application (Phase 5 complete). It contains:
- `app/` — Next.js App Router pages and layouts
- `components/` — shared UI components (`Gauge.tsx` — plain-language wellbeing gauge, Phase 5)
- `features/` — feature-scoped modules (empty at Phase 0)
- `lib/` — shared utilities; `lib/utils.ts` (`cn()` helper); `lib/supabase/` (browser + server Supabase clients — see Supabase client convention below); `lib/voyage/` (embed + rerank helpers); `lib/retrieval/` (vault retrieval — `types.ts`, `retrieve.ts`); `lib/companion/` (crisis protocol — `crisis.ts`; system prompt builder — `systemPrompt.ts`; AI SDK tool defs — `tools.ts`, incl. `createLogPatientObservationTool` and `createRecordLcwsRescreenTool` factories, persist to `patient_log` / `caregiver_state`; burnout gauge core — `burnout.ts`, thresholds/weights/`aggregateSessionSignals`, see Key resolved decisions below; session-end summarization — `sessionEnd.ts`); `lib/notifications/` (`emergencyContactEmail.ts` — Resend courtesy email for the 5-missed-check-in trigger, skips gracefully with no `RESEND_API_KEY` or no contact email)
- `supabase/migrations/` — SQL migration files; `0001_initial_schema.sql` creates all seven MVP tables; `0005_add_burnout_tracking.sql` (Phase 5) adds gauge/escalation bookkeeping columns to `caregiver_state`
- `data/` — typed data modules (system prompt, staging questions, wellbeing items, crisis keywords, burnout signals); `wellbeingItems.ts` and `stagingQuestions.ts` filled in Phase 3 — see Application scaffold below
- `constants/` — app-wide constants; `copy.ts` is the single source for all user-facing strings
- `styles/` — global CSS (`globals.css` loads Tailwind; design tokens imported in `app/layout.tsx`)
- `hooks/` — custom React hooks (empty at Phase 0)
- `types/` — shared TypeScript types (empty at Phase 0)
- `design_system/` — the Lamplight design system (HTML/CSS/JS; do not modify — see below)
- `lantern_research/` — the Obsidian knowledge vault (markdown only)
- `Ref/` — product spec documents (phase-1-spec.md, phase-2-workflows.md, phase-3-prd.md)
- `eval/` — golden-conversation fixtures and schema validator (see Evaluation set below)
- `scripts/index-vault.ts` — idempotent heading-based vault indexer
- `scripts/validate-retrieval.ts` — Phase 2 retrieval gate checks
- `BACKLOG.md` — sequenced build phases and open decisions

## Application scaffold

**Framework:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · ESLint · Prettier  
**Design system:** Lamplight tokens in `design_system/tokens/` are imported in `app/layout.tsx` (CSS custom properties) and mapped into Tailwind classes in `tailwind.config.ts`. Do not invent generic shadcn/Tailwind defaults where a Lamplight token exists.  
**String hygiene:** All user-facing strings must live in `constants/copy.ts`. No hardcoded strings in JSX.  
**Data:** `data/wellbeingItems.ts` holds the 8 LCWS baseline items verbatim from `lantern_research/wellbeing scale/caregiver_wellbeing_scale.md`; `data/stagingQuestions.ts` holds the Lantern-original staging questions grounded in `lantern_research/stages/`. Both filled in Phase 3 (companion core).  
**AI SDK version pin:** `ai@4.3.19` / `@ai-sdk/anthropic@1.2.12` are deliberately pinned below npm "latest" (v7 at time of pinning) — an agent's training-cutoff knowledge of the AI SDK's exact API shapes (tool schemas, stream part types, `useChat` return shape) is reliable for v4, not for v5–v7. Confirm exact APIs via `node_modules/ai/dist/index.d.ts` before using; do not bump without re-verifying call sites against the new type declarations.  
**Environment:** See `.env.local.example` for required keys (Anthropic, Voyage AI, Supabase, `CRON_SECRET` for Vercel cron auth).  
**Dev:** `npm run dev` · **Lint:** `npm run lint`

**Supabase client convention (two clients, not interchangeable):**
- `lib/supabase/server.ts` (`createClient()`) — cookie-based `@supabase/ssr` client with the full query builder (`.order()`, `.limit()`, `.maybeSingle()`, `.not()`, etc). Use in any route handler invoked directly by the browser (has cookie context), e.g. `app/api/onboard`, `app/api/checkin`.
- `lib/supabase/rest-client.ts` (`createSupabaseRestClient()`) — lightweight custom REST client, no cookies, reads `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` directly. Only supports `.eq()`, `.select()`, `.insert()`, `.update()`, `.upsert()`, `.delete()`, `.rpc()` — **no** `.order()`/`.limit()`/`.maybeSingle()`. Use in cookie-less contexts: cron routes (`app/api/cron/*`), server-side tool `execute()` closures (`lib/companion/tools.ts`), `lib/retrieval/retrieve.ts`.

Picking the wrong one fails at the type level (missing methods) rather than silently, but decide up front — don't discover it mid-route.

---

## Clinical models

Lantern uses two Lantern-original clinical models. Do not reference external proprietary clinical instruments not listed in this section in any new content.

### Patient stage (Early / Middle / Late)

Lantern-original staging for dementia progression:

| Lantern stage | Description |
|---|---|
| **Early** | Mild dementia — finances and familiar tasks become unmanageable; still self-aware |
| **Middle** | Moderate to moderately severe decline — needs assistance with ADLs; two phases (early-middle and late-middle) |
| **Late** | Severe / very severe decline — minimal verbal communication; comfort-focused care |

A fourth document, "Before diagnosis and early signs," covers Stages 1–3 equivalent content but is not a Lantern care stage.

Stage files live in `lantern_research/stages/`:
- `00 - Before diagnosis and early signs.md`
- `01 - Early stage.md`
- `02 - Middle stage.md`
- `03 - Late stage.md`

### LCWS (Lantern Caregiver Wellbeing Scale)

Lantern-original caregiver wellbeing scale:

- **5 levels:** 5 (Stable) → 1 (Crisis)
- **5 domains:** relationship strain, emotional wellbeing, social & family life, finances, sense of control
- **Daily check-in:** one-question self-report
- **Biweekly baseline re-screen:** 8 conversational items total — 7 domain items (0–4 each; 6 co-founder-authored and clinically approved 2026-09-06, plus Finances captain-added with clinical co-founder agreement; covers all five LCWS domains) plus 1 global summary item ("Overall burden", scored 0–4 separately as a cross-check) — see LCWS doc for the full set
- **Signal weighting:** self-report 40% / behavioral 30% / LCWS baseline re-screen 30%

Full specification: `lantern_research/wellbeing scale/caregiver_wellbeing_scale.md`

---

## Knowledge vault conventions

- Chunk by `##` heading for RAG — do not split within a section
- Wikilinks use `[[filename without extension]]`
- The transition section `## Transition Warning Signs (Moving Toward Middle Stage)` in `01 - Early stage.md` must be preserved intact (it is a named RAG retrieval target)
- Do not add new clinical claims not grounded in *The 36-Hour Day* or the existing knowledge base
- Do not remove *The 36-Hour Day* references

---

## Key resolved decisions (consult BACKLOG.md for full list)

| Decision | Outcome |
|---|---|
| Default view on app open | Companion/conversation is always home; dashboard is navigated-to, never the entry point |
| Session persistence | Structured log + rolling end-of-session summary (`sessions.summary`, 100–200 words); no raw transcript |
| Auth (MVP) | No auth, no `user_id` columns, no RLS in Phase 1 MVP; access enforced at the API-route layer. Single-caregiver Supabase Auth is deferred to a post-MVP phase. |
| Crisis protocol | `CRISIS_KEYWORDS` bypass fires first (LLM skipped); `flag_crisis` LLM tool is the complementary layer for ambiguous cases |
| Human escalation | Level 2 (3+ consecutive days at red): surfaces human support resources. 5+ missed check-ins: outreach to caregiver-designated emergency contact. Both sit alongside, not in place of, 988 Lifeline |
| Daily check-in scheduling (Phase 4) | A Vercel cron (`vercel.json`, `app/api/cron/daily-checkin`, ~8am daily) writes a pending `sessions` row (`kind='daily_checkin'`, `scheduled_for=<date>`) rather than pushing a notification; the app surfaces it as a waiting message when the caregiver next opens `/checkin`. One check-in per calendar date enforced by a partial unique index (`sessions_daily_checkin_once_per_day`, `supabase/migrations/0004_add_checkin_scheduling.sql`) since there's no `user_id` at MVP. |
| Check-in visual design ("Still Water") | Captain-decided 2026-09-20: the check-in screen (`app/checkin/`) uses a visually distinct design direction from the rest of the app's "Lamplight" system — own scoped stylesheet (`app/checkin/checkin.css`, imported only by `app/checkin/layout.tsx`), never `design_system/` tokens. Writing voice/content rules from `design_system/readme.md` still apply; only the visual skin differs. Do not port Still Water tokens elsewhere or Lamplight tokens into `app/checkin/`. |
| Amber→red threshold (Phase 5) | Red requires gauge score < 3 (`RED_THRESHOLD` in `lib/companion/burnout.ts`), amber band is 3–4. Conservative principle, grounded in the wellbeing-scale doc's own Escalation Velocity Logic, which ties human-support escalation to being "stuck at 2" (Overwhelmed-or-worse), not to level 3 (Strained) — so amber stays ordinary companion-coaching territory and does not itself trigger escalation. Signal weighting (self-report sentiment 40% / behavioral 30% / LCWS re-screen 30%) is named tunable constants alongside it (`SIGNAL_WEIGHTS`). |
| Emergency-contact recipient (Phase 5) | ✅ Resolved 2026-09-21 (no-op shipped), then ✅ built out 2026-09-22: real caregiver-designated emergency contact. `supabase/migrations/0006_add_emergency_contact.sql` adds `emergency_contact_name`/`emergency_contact_email`/`emergency_contact_phone`/`emergency_contact_relationship` to `caregiver_state`. Captured conversationally (optional, skippable) in `app/api/onboard/route.ts`'s new `emergency_contact` step (between `lcws` and `complete`); email is zod-validated before persisting. The 5-missed-check-in trigger in `app/api/cron/daily-checkin/route.ts` now sends a real courtesy email via Resend (`lib/notifications/emergencyContactEmail.ts`, `RESEND_API_KEY`/`RESEND_FROM_EMAIL`) when a contact email is on file, and still just records the timestamp (no send) when none is set — the `emergency_contact_outreach_triggered_at` guard keeps it firing exactly once either way. `emergency_contact_phone` is captured and stored only; SMS sending stays out of scope until the app is paid. |

## Evaluation set

`eval/golden-conversations/` — five conversation fixtures with expected structured output (Phase 5 added `05-level2-escalation.json`, exercising the Level-2 human-support-resources path via `request_overrides`).
`eval/validate-golden-conversations.js` — two-pass validator: schema validation, then (Phase 3+) a live pass that POSTs each fixture's conversation to the real `/api/chat` endpoint (`API_BASE_URL`, default `http://localhost:3000`) and asserts 988-mention on crisis fixtures and expected tool calls. Failures are never silenced. Phase 5 added optional fixture fields: `request_overrides` (merged into the live POST body, e.g. to simulate server-side gauge-escalation state like `surfaceHumanSupportResources` without needing real Supabase state) and `response_includes_any`/`response_excludes` (case-insensitive substring assertions against the response text).
`eval/test-phase4-behavior.mjs` and `eval/test-phase5-behavior.mjs` — plain-`node` behavioral tests (no test framework) covering non-LLM logic: cron auth/idempotency, system-prompt section gating, copy.ts key presence, migration SQL shape, and (Phase 5) `lib/companion/burnout.ts`'s pure functions plus `aggregateSessionSignals` against a hand-rolled mock Supabase client. `eval/test-emergency-contact-behavior.mjs` (Phase 5 follow-up) covers `lib/notifications/emergencyContactEmail.ts`'s skip-without-`RESEND_API_KEY` contract plus source-shape assertions on the `0006` migration and the cron/onboard routes' emergency-contact wiring. All resolve paths relative to their own file location (`import.meta.url`), so they run correctly from any worktree.
Known gap: `.github/workflows/golden-conversations.yml` still only runs the validator with no dev server started and no `ANTHROPIC_API_KEY`/Voyage secrets provisioned in CI, so the live pass will fail there until that infra is set up — a follow-up outside Phase 3's scope (the dispatched deliverable was the validator script, not CI infra/secrets). The same gap means a disposable worktree with no `.env.local` (or with Supabase credentials that don't resolve from the sandbox) can only run `SKIP_LIVE_PASS=true`; the live pass and a real browser walkthrough of `/checkin` and `/gauge-preview` require provisioned, network-reachable Supabase + Anthropic credentials.

## What not to do

- Do not change `design_system/` visual tokens, CSS, or component structure — only read from it
- Do not push to the default branch or merge a PR
- Do not introduce proprietary clinical instrument names (see Clinical models above)
- Do not add auth (Supabase Auth, login, session cookies, `user_id` FKs, RLS) — deferred to a post-MVP phase
- Do not add new DB tables or migrations, or new feature UI/API routes, outside a dispatched phase task (Phase 3 added `app/api/chat`, `app/api/onboard`, and `supabase/migrations/0003_add_companion_fields.sql`; Phase 4 added `app/api/checkin`, `app/api/cron/daily-checkin`, `app/checkin`, and `supabase/migrations/0004_add_checkin_scheduling.sql`; Phase 5 added `app/api/checkin/end`, `app/api/gauge`, `app/gauge-preview`, `components/Gauge.tsx`, and `supabase/migrations/0005_add_burnout_tracking.sql`; the Phase 5 emergency-contact follow-up added `supabase/migrations/0006_add_emergency_contact.sql` and `lib/notifications/emergencyContactEmail.ts` — no new tables or routes, just columns on `caregiver_state` and a new onboarding step; Phase 6 is the dashboard itself — not yet built)
- Do not build a persistent log-review screen for `patient_log` entries — resolved decision is in-conversation confirmation only (at most one observation surfaced back to the caregiver per check-in, never a list)

## Retrieval pipeline

Vault chunks are indexed by `scripts/index-vault.ts` and retrieved through
`lib/retrieval/retrieve.ts`. The `match_vault_chunks` database function performs
the stage-filtered pgvector candidate search before Voyage reranking; keep the
heading-based chunk boundary intact for the named transition retrieval target.

## Maintaining this file

Update this file whenever a ship task produces durable project knowledge: resolved decisions,
new conventions, new directories with special rules. Keep entries concise and point to the
authoritative source file rather than duplicating content. Prefer a pointer to `BACKLOG.md`
or `Ref/` over copying detail.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
