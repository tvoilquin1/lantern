# AGENTS.md — Lantern Agent Guidelines

Instructions for AI agents (Claude Code, Firstmate, and any future orchestrators) working in this repository.

---

## Scope

This is a pre-Phase-0 product repository. It contains:
- `lantern_research/` — the Obsidian knowledge vault (markdown only)
- `design_system/` — the Lamplight design system (HTML/CSS/JS/JSX, no framework)
- `Ref/` — product spec documents (phase-1-spec.md, phase-2-workflows.md, phase-3-prd.md)
- `eval/` — golden-conversation fixtures and schema validator (see Evaluation set below)
- `BACKLOG.md` — sequenced build phases and open decisions

No application code exists yet. Do not scaffold one unless the user explicitly requests it.

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

- Do not add application code, npm packages, or a Next.js scaffold
- Do not change design system visual tokens, CSS, or component structure — only copy text
- Do not push to the default branch or merge a PR
- Do not introduce proprietary clinical instrument names (see Clinical models above)

## Maintaining this file

Update this file whenever a ship task produces durable project knowledge: resolved decisions,
new conventions, new directories with special rules. Keep entries concise and point to the
authoritative source file rather than duplicating content. Prefer a pointer to `BACKLOG.md`
or `Ref/` over copying detail.
