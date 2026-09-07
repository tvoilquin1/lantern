# AGENTS.md — Lantern Agent Guidelines

Instructions for AI agents (Claude Code, Firstmate, and any future orchestrators) working in this repository.

---

## Scope

This repository is a Next.js 14 App Router application (Phase 0 scaffold complete). It contains:
- `app/` — Next.js App Router pages and layouts
- `components/` — shared UI components (empty at Phase 0)
- `features/` — feature-scoped modules (empty at Phase 0)
- `lib/` — shared utilities (`lib/utils.ts` — `cn()` helper)
- `data/` — typed placeholder data modules (system prompt, wellbeing items, crisis keywords, burnout signals)
- `constants/` — app-wide constants; `copy.ts` is the single source for all user-facing strings
- `styles/` — global CSS (`globals.css` loads Tailwind; design tokens imported in `app/layout.tsx`)
- `hooks/` — custom React hooks (empty at Phase 0)
- `types/` — shared TypeScript types (empty at Phase 0)
- `design_system/` — the Lamplight design system (HTML/CSS/JS; do not modify — see below)
- `lantern_research/` — the Obsidian knowledge vault (markdown only)
- `Ref/` — product spec documents (phase-1-spec.md, phase-2-workflows.md, phase-3-prd.md)
- `eval/` — golden-conversation fixtures and schema validator (see Evaluation set below)
- `BACKLOG.md` — sequenced build phases and open decisions

## Application scaffold

**Framework:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · ESLint · Prettier  
**Design system:** Lamplight tokens in `design_system/tokens/` are imported in `app/layout.tsx` (CSS custom properties) and mapped into Tailwind classes in `tailwind.config.ts`. Do not invent generic shadcn/Tailwind defaults where a Lamplight token exists.  
**String hygiene:** All user-facing strings must live in `constants/copy.ts`. No hardcoded strings in JSX.  
**Data placeholders:** `data/wellbeingItems.ts` and `data/stagingQuestions.ts` are empty typed modules. Fill with LCWS items / Lantern-original staging content in Phase 1.  
**Environment:** See `.env.local.example` for required keys (Anthropic, Voyage AI, Supabase).  
**Dev:** `npm run dev` · **Lint:** `npm run lint`

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
| Auth | Single-caregiver Supabase Auth login in MVP scope; `user_id` FK on all caregiver-specific tables; RLS at DB layer |
| Crisis protocol | `CRISIS_KEYWORDS` bypass fires first (LLM skipped); `flag_crisis` LLM tool is the complementary layer for ambiguous cases |
| Human escalation | Level 2 (3+ consecutive days at red): surfaces human support resources. 5+ missed check-ins: outreach to caregiver-designated emergency contact. Both sit alongside, not in place of, 988 Lifeline |

## Evaluation set

`eval/golden-conversations/` — four conversation fixtures with expected structured output.
`eval/validate-golden-conversations.js` — schema validator (runs in CI today via `.github/workflows/golden-conversations.yml`).
Phase 3 follow-up: wire against real companion once Phase 3 code lands.

## What not to do

- Do not change `design_system/` visual tokens, CSS, or component structure — only read from it
- Do not push to the default branch or merge a PR
- Do not introduce proprietary clinical instrument names (see Clinical models above)
- Do not add feature UI, business logic, Supabase schema, API routes, or auth — those are Phase 1+

## Maintaining this file

Update this file whenever a ship task produces durable project knowledge: resolved decisions,
new conventions, new directories with special rules. Keep entries concise and point to the
authoritative source file rather than duplicating content. Prefer a pointer to `BACKLOG.md`
or `Ref/` over copying detail.
