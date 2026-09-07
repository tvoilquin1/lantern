# PRD: Lantern MVP

**Date:** June 14, 2026
**Status:** Draft — Phase 3 (Product Requirements Document)
**Version:** 0.3
**Inputs:** Phase 1 Spec v0.2 · Phase 2 Workflows v0.1

---

## 1. Overview

Lantern is a dementia care companion built for the caregiver — not the patient's chart. It combines an AI companion with a lightweight dashboard to give family caregivers what they currently lack: a knowledgeable presence that understands where they are in the journey, warns them before the next stage hits, and checks in on their own wellbeing as a first-class concern.

The problem is structural. When a family member is diagnosed with dementia, the caregiver is handed a prognosis and sent home. No roadmap, no proactive coaching, no warning when the Middle stage is approaching. Existing tools are either clinical (built for providers, not families) or passive (log your day, nothing happens). No product combines stage-aware intelligence, proactive outreach, and caregiver burnout tracking in a single companion. That is the gap Lantern occupies.

We are building for MVP validation with 10–25 real caregivers. The goal is not to ship a polished product — it is to get genuine behavioural signal fast enough to know whether this is worth building further. Every scope decision prioritises that signal over completeness.

---

## 2. Goals & Success Metrics

### Goal 1: Prove the companion earns return visits without prompting

The companion must be useful enough that caregivers come back on their own — not because of push notifications or streak mechanics.

| Metric | Target |
|--------|--------|
| 7-day return rate | ≥ 60% of onboarded users return within 7 days without a prompt |
| Unsolicited opens | ≥ 30% of sessions initiated by the user (not the companion's check-in) |

---

### Goal 2: Validate that stage-aware guidance lands as accurate and useful

If caregivers don't trust the stage guidance, everything else fails. This is the foundation.

| Metric | Target |
|--------|--------|
| Qualitative accuracy rating | ≥ 70% of debrief participants describe stage guidance as "accurate" or "helpful" unprompted |
| Companion conversation depth | Avg ≥ 4 exchanges per session (bounce after 1 reply = failure) |

---

### Goal 3: Demonstrate that caregivers engage with their own wellbeing layer

The burnout gauge is a hypothesis — caregivers may only care about the patient. We need to know if they engage with data about themselves.

| Metric | Target |
|--------|--------|
| Burnout gauge views | ≥ 50% of active users open the burnout panel at least once per week |
| Burnout check-in completion | ≥ 70% of companion-initiated burnout check-ins receive a response |

---

### Goal 4: Surface at least one validated stage transition signal in the beta cohort

The transition detection feature (Early→Middle warning) is the highest-stakes capability. We need to observe it working in the wild at least once before scaling.

| Metric | Target |
|--------|--------|
| Transition flag events | ≥ 1 transition flag surfaced and confirmed as accurate by the caregiver in the 10-user beta |
| Caregiver response to flag | Flag acknowledged (not dismissed) in ≥ 50% of cases |

---

### Goal 5: Achieve PMF signal from the 10-user cohort

| Metric | Target |
|--------|--------|
| Organic referrals | ≥ 2 users refer someone else without being asked |
| Unsolicited initiations | ≥ 3 users initiate conversation without a prompt within the first 2 weeks |
| Qualitative PMF | Majority describe the companion as "helpful" or "accurate" unprompted in debrief |

---

## 3. User Personas & Workflows

### Primary Persona

**Sarah, 52** — managing her mother's Early stage dementia while working full-time. Her mother lives with her. Covers medical coordination, medication management, and the emotional labour her siblings don't share. Functional but running on fumes. Doesn't know what the Middle stage looks like. Googles at midnight.

**Design principle:** Design for Sarah first. Mid/late-stage caregivers (Early through Late) have the highest burnout risk, face the most frequent crises, and will surface every hard edge case in the product.

---

### Workflow Summary

| # | Workflow | Core value delivered |
|---|----------|---------------------|
| 1 | **First-Time Onboarding** | Establishes patient stage + caregiver burnout baseline conversationally. No forms. Companion is the entry point immediately after onboarding; dashboard is accessible via navigation tab. |
| 2 | **Daily Check-in** | Companion-initiated morning check-in. Extracts patient log data through conversation. Senses burnout in the background. |
| 3 | **Transition Detection & Warning** | Accumulates patient log signals over time. Cross-references against Early→Middle transition indicators. Issues a soft, proactive warning — not a diagnosis. |
| 4 | **Burnout Detection & Intervention** | Multi-signal burnout detection (self-report + behavioral + periodic LCWS re-screen). Companion holds space first, then offers evidence-based options. Crisis protocol if indicators present. |
| 5 | **Dashboard Orientation** | 2-minute at-a-glance: patient stage indicator, caregiver burnout gauge, 1–3 companion-surfaced action items. Calm when stable. Flagged when not. |

---

## 4. User Stories (Prioritised)

### P0 — MVP (must-have, blocks validation)

---

**Story P0-1: Conversational Onboarding**
> As a first-time caregiver using Lantern, I want to be asked about my mother's current abilities through natural conversation, so that Lantern understands where she is without making me fill out a clinical form.

**Acceptance Criteria:**
- [ ] Companion opens with a warm framing message explaining what onboarding involves
- [ ] Patient stage (Early/Middle/Late) is derived from conversational questions, not a dropdown or checkbox form
- [ ] Companion summarises its stage inference and asks the caregiver to confirm or correct
- [ ] Caregiver can correct the stage estimate and Lantern accepts it
- [ ] If stage is unclear, companion asks behavioral questions ("Does she still drive?") and infers from answers
- [ ] Onboarding is resumable — if the caregiver drops off, it picks up where it left off next session
- [ ] Entire onboarding completable in under 10 minutes

**Notes:**
- Stage inference conversational questions need to be pre-written and tested before the flow is built — the LLM derives the stage from answers, not from a rules engine
- Stage inference uses Claude structured output (not freetext parsing); stage stored to Supabase immediately on confirmation
- Resume state requires session progress stored in Supabase (current question index + answers so far)
- The "10 minute" target is a UX constraint, not a technical one — prompt design must keep questions concise

**Dependencies:**
- P0-7 (RAG Knowledge Base) must be live so the companion can reference stage knowledge during onboarding
- Supabase schema: `sessions` table and `patient_profile` table must exist

**Estimation:** 8–13 points (3–4 days). First conversation flow; highest design complexity of any story.

---

**Story P0-2: Caregiver Baseline (Burnout)**
> As a caregiver completing onboarding, I want Lantern to ask how I'm doing — not just about my mother — so that my own state is tracked from day one.

**Acceptance Criteria:**
- [ ] After patient stage is established, companion shifts focus to the caregiver explicitly
- [ ] LCWS baseline is administered through conversation, not a scored form
- [ ] Wellbeing baseline is stored and visible in the dashboard as an initial reading
- [ ] If acute distress indicators are present, companion surfaces 988 Lifeline and pauses onboarding
- [ ] Companion does not attempt to manage a crisis — holds space and refers

**Notes:**
- LCWS baseline covers 8 conversational items: 7 domain items (co-founder-authored, clinically approved 2026-09-06; covers all five LCWS domains) plus "Overall burden" as a global summary item scored 0–4 separately. Items are in the LCWS doc (`lantern_research/wellbeing scale/caregiver_wellbeing_scale.md`). Use the authored set verbatim.
- Crisis keyword fallback (from Feature 1) applies during this flow — fires before LLM response
- Domain composite and overall-burden score stored as separate numeric reference points in `caregiver_state`; future sessions compare against them directionally

**Dependencies:**
- P0-1 (Conversational Onboarding) must complete first — baseline is collected at the end of onboarding
- Supabase schema: `caregiver_state` table must exist with `lcws_baseline_score` (7-domain composite) and `lcws_overall_burden_score` (global summary, separate) and other baseline fields

**Estimation:** 5 points (1.5–2 days). Simpler than onboarding; baseline items are clinically approved — no additional review gate before building.

---

**Story P0-3: Daily Check-in (Companion-Initiated)**
> As a returning caregiver, I want the companion to check in with me in the morning, so that I have a consistent moment to update Lantern on how things are going without having to remember to do it myself.

**Acceptance Criteria:**
- [ ] Companion initiates a check-in message at a default time (8am, configurable)
- [ ] Check-in opens with a question about the caregiver's night/morning — not a form
- [ ] Companion extracts patient-relevant signals from free-text responses (sleep, incidents, behavioral changes)
- [ ] If a clinically notable incident surfaces, companion acknowledges it and logs it explicitly
- [ ] Check-in closes with one relevant observation, tip, or validation — not a list of questions
- [ ] If the caregiver doesn't respond, no follow-up is sent until the next scheduled check-in

**Notes:**
- "Companion initiates" at MVP means: a Supabase cron job or Vercel cron writes a pending check-in record; the app shows it as a waiting message when the caregiver opens the app. True push notifications are P1.
- Configurable check-in time is P1 (P1-2) — default 8am is hardcoded at MVP
- P0-4 (Patient Log Extraction) is tightly coupled to this story — they should be built together in the same sprint

**Dependencies:**
- P0-1 and P0-2 must be complete (patient profile and caregiver baseline must exist before a check-in has context)
- P0-4 (Patient Log Extraction) is a prerequisite for the extraction step within this flow
- Scheduling mechanism (Supabase cron or Vercel cron) must be decided and set up

**Estimation:** 8 points (2–3 days), including the scheduling mechanism.

---

**Story P0-4: Patient Log Extraction**
> As a caregiver during a check-in, I want Lantern to extract structured data from what I say naturally, so that I don't have to fill in a log form after every conversation.

**Acceptance Criteria:**
- [ ] Companion extracts structured data (sleep, nutrition, mobility, behavioral changes, incidents) from free-text
- [ ] Data is stored in the patient log without requiring the caregiver to confirm each field
- [ ] Notable incidents (falls, wandering, stove incidents) are flagged separately from routine log entries
- [ ] Extraction does not feel like an interview — questions are conversational and contextual
- [ ] No more than 2–3 follow-up questions per check-in

**Notes:**
- Extraction uses Claude tool use (the `log_patient_observation` schema defined in Feature 3) — fires server-side after each companion turn; caregiver never sees the schema
- `nothing_notable: true` prevents empty log entries when Sarah says "fine, nothing new"
- `raw_quote` in `transition_signals` field preserves the caregiver's exact words for future reference — important for explaining flags back to her later
- Tool fires silently; extraction errors should fail gracefully (log the error, don't interrupt the conversation)

**Dependencies:**
- P0-7 (RAG Knowledge Base) must be live so the companion knows what signals are clinically relevant to extract
- Extraction schema (Feature 3 spec) must be finalised before building
- Supabase schema: `patient_log` table must exist

**Estimation:** 5 points (1.5–2 days). Schema is defined; Vercel AI SDK tool use is straightforward.

---

**Story P0-5: Transition Detection**
> As a caregiver several weeks into using Lantern, I want to be warned when the patient's log is showing patterns consistent with a stage transition, so that I'm not blindsided when Middle stage behaviours arrive.

**Acceptance Criteria:**
- [ ] Companion cross-references patient log entries against Early→Middle transition signals in the knowledge base
- [ ] Transition flag is triggered only when 2+ signals appear across multiple sessions (not a single incident)
- [ ] Companion initiates a proactive out-of-schedule message: "I've been noticing something worth talking about — is now okay?"
- [ ] Flag is framed as "worth watching" — not a diagnosis or pronouncement
- [ ] Companion shares 1–2 practical preparation steps (from knowledge base), not an alarm
- [ ] Dashboard transition risk indicator updates to yellow when flag is issued
- [ ] If caregiver disputes the flag, companion accepts the correction and continues monitoring
- [ ] Companion does not diagnose or reference clinical criteria by name without the caregiver's own framing first

**Notes:**
- "2+ signals across multiple sessions" is a configurable threshold — start conservative to avoid false alarms; tune after observing real user data
- Cross-referencing logic: query `patient_log` for `transition_signals` entries in the past N sessions; if count ≥ threshold, trigger flag. This is application logic, not LLM logic.
- The proactive message uses the same scheduling mechanism as P0-3 (write a pending message; show on next app open)
- Flag framing ("worth watching") must be enforced in the system prompt, not hardcoded strings — the companion must generate it naturally, not paste a template
- This story cannot be meaningfully tested until P0-4 has been running for 2+ weeks and accumulating real log data

**Dependencies:**
- P0-4 (Patient Log Extraction) must be running and have accumulated data across multiple sessions — requires real usage, not just a build
- P0-7 (RAG Knowledge Base) must pass the Early→Middle transition test set before this story can be validated
- Proactive message scheduling mechanism (from P0-3) must exist

**Estimation:** 13 points (3–4 days). Cross-referencing logic and flag framing are the riskiest parts; prompt design requires significant testing.

---

**Story P0-6: Burnout Detection**
> As a caregiver using Lantern over several weeks, I want the companion to notice when my responses suggest I'm burning out — even if I haven't said so directly — so that it can check in on me before I hit a wall.

**Acceptance Criteria:**
- [ ] Burnout detection aggregates at least 3 signal types: self-report sentiment, behavioral (missed check-ins, late-night sessions), periodic LCWS baseline re-screen
- [ ] Wellbeing gauge on dashboard updates directionally after each session
- [ ] When wellbeing crosses amber→red threshold, companion proactively initiates a check-in focused on the caregiver, not the patient
- [ ] Companion leads with acknowledgment before offering resources
- [ ] Companion asks permission before surfacing coping suggestions
- [ ] If crisis indicators present: 988 Lifeline surfaced immediately; companion does not attempt to manage the situation
- [ ] Wellbeing gauge moves in the positive direction when signals improve

**Notes:**
- Signal weighting (confirmed v1 default, captain decision 2026-09-01): self-report sentiment 40%, behavioral signals 30%, biweekly LCWS baseline re-screen 30%. Ship with these values for v1; keep them as a tunable parameter in code (not a hardcoded constant) so they can be adjusted later, but no further decision is needed before building.
- Amber→red threshold (confirmed v1 default, captain decision 2026-09-01): implement using the conservative principle already stated here — err toward not triggering rather than picking a looser number. No further captain decision needed before building M3; revisit after real caregiver testing.
- Periodic LCWS re-screen (every 2 weeks) reuses the same scheduling mechanism as P0-3
- Sentiment analysis runs server-side on each session's text after the conversation ends — not real-time during the conversation
- Behavioral signals (missed check-ins, night-time sessions) are derived from session timestamps in `sessions` table — no extra tracking needed

**Dependencies:**
- P0-2 (Caregiver Baseline) must exist to have a baseline score to compare against
- P0-3 (Daily Check-in) must be running to accumulate behavioral signals
- Signal weighting and amber→red threshold: confirmed 2026-09-01 to ship with the values/principle specified above; no longer a blocking decision before building
- Supabase schema: `caregiver_state` table must track score history (not just current value)

**Estimation:** 8 points (2–3 days). Signal aggregation logic is non-trivial; LCWS re-screen through conversation needs prompt testing.

---

**Story P0-7: RAG Knowledge Base**
> As the system, I need a vectorised knowledge base over the Obsidian vault so that all companion responses to stage-specific queries are grounded in Lantern's stage knowledge base, not model hallucination.

**Acceptance Criteria:**
- [ ] All 14 vault documents (7 stage notes + 7 reference notes) are chunked and vectorised
- [ ] Chunking is by Markdown heading (`##`), not token count
- [ ] "Transition Warning Signs (Moving Toward Middle Stage)" section in the Early stage note is intact as a single chunk (verified before go-live)
- [ ] RAG retrieval is stage-scoped — queries run against the current patient stage by default
- [ ] Early→Middle transition retrieval test set passes: ≥90% of signal queries return the correct section in top-3
- [ ] No Middle stage content surfaces for normal Early stage variance queries in top-1

**Notes:**
- This is M1 — must be built and validated before any other P0 story begins
- Embedding model: Voyage AI hosted embeddings API (`voyage-3` or current recommended model — confirm API key is provisioned before starting)
- Re-ranking pipeline: top-10 vector results → Voyage AI hosted rerank API (`rerank-2`) → top-3 returned
- pgvector extension must be manually enabled in Supabase dashboard before the first `CREATE EXTENSION` migration runs — easy to miss
- The Early→Middle transition test query set is already written in `docs/phase-2-workflows.md` — run it before declaring M1 done

**Dependencies:**
- Supabase project must exist with pgvector extension enabled
- Voyage AI API key must be provisioned and confirmed working before indexing
- Early→Middle transition test query set (Phase 2 workflows doc) must exist before validation — already done

**Estimation:** 5 points (1.5–2 days). Mostly scripting and validation; no complex logic once tooling is confirmed working.

---

**Story P0-8: Dashboard (3-Panel)**
> As a caregiver with 2 minutes, I want to open Lantern and immediately see the patient's current stage, my burnout state, and anything that needs my attention — without having to start a conversation.

**Acceptance Criteria:**
- [ ] Companion/conversation is the default view on every app open — dashboard is accessible via navigation tab, never the landing screen (captain decision 2026-09-01: app always opens on the companion)
- [ ] Panel 1: Patient stage indicator with trajectory label (stable / progressing / watch)
- [ ] Panel 2: Caregiver burnout gauge (green / amber / red) with a plain-language label
- [ ] Panel 3: 1–3 action items surfaced from recent sessions, tappable into the companion chat
- [ ] When nothing has changed: dashboard is calm ("Everything looks stable")
- [ ] When a flag exists: highlighted card at top of screen
- [ ] No streak mechanics, gamification, or manufactured urgency
- [ ] Dashboard accessible without starting a conversation

**Notes:**
- Dashboard is read-only at MVP — it reads from Supabase; no state is written from the dashboard
- Action items are written by the companion to an `action_items` table during sessions, not derived at render time — the dashboard just displays them
- "Calm" state must be explicitly designed (not an empty div) — a plain-language message like "Everything looks stable" is a first-class UI state
- No real-time updates at MVP — refresh on app open is sufficient for 10-25 users

**Dependencies:**
- P0-1 (patient stage) and P0-2 (burnout baseline) must be complete so the dashboard has data to display
- P0-5 (transition detection) and P0-6 (burnout detection) provide the flag states shown in panels 1 and 2
- Supabase schema: `action_items` table must exist and be written to by the companion before this story can be fully tested

**Estimation:** 5 points (1.5–2 days). UI-heavy but no complex logic; depends on other stories for real data.

---

### P1 — Important (high value, not MVP-blocking)

---

**Story P1-1: Burnout Intervention Coaching**
> As a caregiver whose burnout gauge has hit red, I want Lantern to offer specific, evidence-based interventions — not generic wellness tips — so that the suggestions are actually useful for my situation.

**Acceptance Criteria:**
- [ ] Interventions sourced from knowledge base (not model generation alone)
- [ ] Companion offers options, not prescriptions: "Some of these might not fit right now"
- [ ] Interventions are stage-appropriate for an Early/Middle stage caregiver
- [ ] Includes: respite strategies, sibling conversation frameworks, sleep hygiene, validation of emotional response

---

**Story P1-2: Configurable Check-in Settings**
> As a caregiver, I want to adjust when the companion checks in with me, so that it fits my schedule rather than disrupting it.

**Acceptance Criteria:**
- [ ] Default check-in time is 8am, adjustable by user
- [ ] User can reduce check-in frequency (daily → every 2 days → weekly)
- [ ] User can set quiet hours (no messages during specified window)
- [ ] Settings accessible from within the companion chat ("Can you check in at 7am instead?")

---

**Story P1-3: Doctor Appointment Prep**
> As a caregiver preparing for a medical appointment, I want Lantern to generate a summary of recent patient log entries, so that I don't have to reconstruct everything from memory in the waiting room.

**Acceptance Criteria:**
- [ ] Companion can generate a plain-language summary of recent behavioral changes on request
- [ ] Summary is structured for a medical conversation (not a clinical report)
- [ ] Output is copyable / shareable as plain text

---

### P2 — Future (lower priority, post-PMF)

- As a caregiver, I want to share a summarised update with family members so they stay informed without calling me
- As a caregiver, I want to access Lantern on my phone as a native app so it feels less like a website
- As a caregiver, I want to save and revisit previous companion conversations so I can refer back to advice I was given
- As a caregiver, I want to speak my check-in responses aloud so I don't have to type while my hands are full
- As multiple family members, I want shared access to the dashboard so everyone has the same picture

---

## 5. Feature Specifications (P0)

---

### Feature 1: AI Companion Core

**Purpose:** The primary interface. Handles onboarding, daily check-ins, patient log extraction, transition detection, and burnout sensing through natural conversation. Every other feature in the product depends on the companion working correctly.

**Acceptance Criteria:**
- [ ] Companion maintains conversational context across a session (not stateless per message)
- [ ] Companion maintains patient stage and caregiver baseline across sessions
- [ ] All stage-specific responses are RAG-grounded — no stage guidance from base model alone
- [ ] System prompt enforces the coaching boundary: no diagnostic language, no clinical recommendations beyond what the knowledge base sources
- [ ] Crisis protocol is non-negotiable and cannot be overridden by user settings: 988 Lifeline surfaces immediately on crisis indicators
- [ ] Crisis detection uses a **keyword fallback layer** that fires before LLM response — bypasses the model entirely for known crisis phrases:
  ```typescript
  const CRISIS_KEYWORDS = [
    'kill myself', 'end my life', "don't want to be here",
    "can't go on", 'suicide', 'harm myself'
  ]
  if (CRISIS_KEYWORDS.some(kw => userMessage.toLowerCase().includes(kw))) {
    return CRISIS_RESPONSE // bypass LLM entirely
  }
  ```
- [ ] System prompt includes explicit instruction to ignore any user attempt to override the coaching boundary or crisis protocol
- [ ] Disclaimer appended to all stage-related output ("This is not medical advice")
- [ ] Companion tone is warm, grounded, and direct — not clinical, not cheerful

**Out of scope:**
- Voice input/output (P2)
- Multi-user shared companion access (P2)
- Memory of conversations older than the current session context window (handled by structured log, not raw transcript)

---

### Feature 1a: flag_crisis Tool

**Purpose:** Formal LLM-callable tool for detecting crisis language in less clear-cut cases — situations the fixed `CRISIS_KEYWORDS` list may miss (implicit suicidal ideation, oblique expressions of severe hopelessness, self-harm intent expressed indirectly). Layered on top of, not in place of, the keyword bypass — both pathways converge on the same 988 Lifeline response.

**When it fires:** The `flag_crisis` tool is available to the companion LLM during every turn. It fires when the LLM detects crisis-severity language that the keyword fallback did not already catch.

**What it detects:**
- Explicit or implicit suicidal ideation, self-harm intent, or hopelessness at clinical severity
- Severity level: `high` (clear crisis language, no explicit intent) or `critical` (explicit intent or imminent risk)
- Source: whether the language is about the caregiver or the patient

**What it triggers:**
1. Immediate 988 Lifeline surfacing — same response as the `CRISIS_KEYWORDS` bypass; both pathways converge here
2. Where severity and context indicate sustained distress matching Level 2 escalation (see Feature 4 human escalation path), the Level 2 human-support surface is also triggered

**Tool definition:**

```typescript
{
  name: "flag_crisis",
  description: "Flag a message as containing crisis-level language requiring immediate escalation. Use when the message contains suicidal ideation, self-harm intent, or hopelessness at clinical severity that the keyword bypass may not have caught. Do not use for general distress or burnout — only for crisis-level signals.",
  input_schema: {
    type: "object",
    properties: {
      severity: {
        type: "string",
        enum: ["high", "critical"],
        description: "high = clear crisis language but no explicit intent stated; critical = explicit intent or imminent risk"
      },
      trigger_phrase: {
        type: "string",
        description: "The caregiver's words that triggered this flag — preserved verbatim for context"
      },
      source: {
        type: "string",
        enum: ["caregiver_self", "patient_report"],
        description: "Whether the crisis language is about the caregiver (primary concern) or the patient (forward to relevant resource only if applicable)"
      }
    },
    required: ["severity", "trigger_phrase", "source"]
  }
}
```

**Critical invariant:** The `CRISIS_KEYWORDS` bypass always fires first — it is faster, deterministic, and non-negotiable. `flag_crisis` is the complementary LLM layer for cases the keyword list misses. Neither replaces the other. The companion never attempts to manage a crisis; it holds space, surfaces 988, and refers.

**Out of scope:**
- Replacing the `CRISIS_KEYWORDS` bypass layer
- Managing or treating crisis situations (companion refers only)

---

### Feature 2: RAG Knowledge Pipeline

**Purpose:** Grounds all companion responses in Lantern's stage knowledge base. The quality of retrieval is a first-order concern — wrong stage guidance in this domain destroys trust immediately.

**Acceptance Criteria:**
- [ ] All 14 vault documents chunked by Markdown heading (`##`)
- [ ] Chunking verified: each semantic section is one chunk
- [ ] **Embedding model:** Voyage AI hosted embeddings API (`voyage-3`). Requires API key; no local model-serving infrastructure.
- [ ] Vectors stored in pgvector (Supabase) — extension must be enabled before indexing
- [ ] **Re-ranking:** top-10 vector results re-ranked by Voyage AI's hosted rerank API (`rerank-2`) before returning top-3 to the companion
- [ ] Retrieval pipeline: query → vector similarity top-10 → Voyage rerank → top-3 returned
- [ ] Retrieval is stage-scoped by default (current patient stage filters or re-ranks results)
- [ ] Early→Middle transition retrieval test set passes before M1 is marked complete (see Phase 2 workflows doc)
- [ ] Retrieval latency < 800ms end-to-end including re-ranking (hosted embedding + rerank calls add network round-trip vs. local inference; adjust once measured)

**Out of scope:**
- Self-hosted embedding/reranking inference (local ONNX) — moved to hosted Voyage AI to avoid serverless model-serving overhead on Vercel; revisit only if hosted latency or cost becomes a problem
- External data sources beyond the Obsidian vault (adding clinical databases, PubMed, etc.)
- Dynamic vault updates at runtime (vault is static for MVP; updates require re-indexing)

---

### Feature 3: Patient Log

**Purpose:** Structured storage of patient behavioral data extracted from companion conversations. The log feeds both the transition detection layer and the dashboard. Caregivers never see it as a form — they only interact with it through the companion.

**Acceptance Criteria:**
- [ ] Log entries extracted from conversation without explicit caregiver action
- [ ] Extraction uses Claude tool use (structured output) — not freetext parsing
- [ ] Each entry timestamped and tagged with source (daily check-in, open conversation)
- [ ] Flagged entries (falls, wandering, stove incidents, medication errors) stored separately with explicit flag type
- [ ] Log queryable by the transition detection layer (most recent N entries for a given signal type)
- [ ] No PHI stored in ways that trigger HIPAA obligations at MVP stage — anonymised patient IDs, no clinical identifiers

**Extraction Schema (Claude tool definition):**

```typescript
{
  name: "log_patient_observation",
  description: "Extract structured patient observation data from caregiver's free-text response. Only extract what is explicitly mentioned — do not infer or fill in unknowns.",
  input_schema: {
    type: "object",
    properties: {
      sleep: {
        type: "object",
        properties: {
          quality: { type: "string", enum: ["good", "disrupted", "very_poor", "unknown"] },
          incidents: { type: "array", items: { type: "string" },
            description: "e.g. 'up three times', 'confused at 2am', 'found wandering'" }
        }
      },
      nutrition: {
        type: "object",
        properties: {
          ate_meals: { type: "boolean" },
          concerns: { type: "array", items: { type: "string" },
            description: "e.g. 'refused dinner', 'forgot to eat', 'lost 2 pounds'" }
        }
      },
      mobility: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["normal", "reduced", "fall", "unknown"] },
          notes: { type: "string" }
        }
      },
      behavioral_changes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string",
              description: "e.g. 'increased_agitation', 'confusion', 'paranoia', 'social_withdrawal'" },
            description: { type: "string" }
          }
        }
      },
      safety_flags: {
        type: "array",
        description: "Only populate if a safety incident was explicitly described",
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["stove_incident", "wandering", "fall", "medication_error",
                     "exploitation_risk", "aggression", "unsupervised_exit", "other"]
            },
            description: { type: "string" },
            severity: { type: "string", enum: ["low", "medium", "high"] }
          },
          required: ["type", "description", "severity"]
        }
      },
      transition_signals: {
        type: "array",
        description: "Patterns that may indicate a stage transition — only flag if clearly present",
        items: {
          type: "object",
          properties: {
            signal: { type: "string",
              description: "e.g. 'forgot_to_eat', 'stove_left_on', 'wandered_outside', 'medication_mismanaged'" },
            raw_quote: { type: "string", description: "Exact caregiver words that triggered this flag" }
          }
        }
      },
      nothing_notable: {
        type: "boolean",
        description: "True if the caregiver's response contains no extractable patient observations"
      }
    }
  }
}
```

**Out of scope:**
- Manual log entry by caregiver (form-based input)
- Log export or sharing (P1/P2)
- Caregiver-visible log history (they see summaries via companion, not raw log)

---

### Feature 4: Burnout Gauge

**Purpose:** Tracks caregiver wellbeing as a vital sign. Aggregates multiple signal types into a directional gauge (green / amber / red). Feeds the burnout intervention flow.

**Acceptance Criteria:**
- [ ] Gauge initialised from LCWS baseline at onboarding
- [ ] Updated after every session based on: sentiment of responses, session frequency/timing, explicit self-report
- [ ] Periodic LCWS re-screen administered through conversation (not form) every 2 weeks
- [ ] Gauge visible on dashboard as a coloured indicator with plain-language label
- [ ] Gauge moves in both directions (can improve)
- [ ] Burnout intervention flow triggered automatically at amber→red crossing

**Human escalation path (two levels — sits alongside, never replaces, the immediate crisis-keyword → 988 Lifeline fallback):**

**Level 2 — Human support resources:**
Triggered when: 3+ consecutive days of qualifying distress signal at or above the amber→red threshold (sustained distress, not a single spike).
Response: Companion surfaces human support resources — caregiver support organisations, local respite resource pointers, professional counselling referral pathways. This is not 988 (which remains the immediate-crisis response); it is proactive surfacing of non-emergency human support for sustained high-stress periods.

**Emergency contact outreach:**
Triggered when: 5 consecutive missed check-ins (a meaningful disengagement pattern that may indicate the caregiver is in acute difficulty).
Response: System triggers outreach to a caregiver-designated emergency contact (collected during onboarding). The contact receives a simple notification that Lantern has not heard from the caregiver for 5+ days and may want to check in.

**Critical invariant:** Both escalation levels sit alongside, not in place of, the immediate crisis-keyword → 988 Lifeline fallback. The 988 response fires immediately on crisis language regardless of escalation level, burnout gauge state, or missed check-in count. It is non-negotiable and cannot be deferred.

**Clinical review gate:** Resolved — human-escalation threshold logic (3+ consecutive days of qualifying distress; 5 consecutive missed check-ins) was reviewed and approved by the co-founder on 2026-09-06 (D-1 resolved). No further review required before M5.

**Out of scope:**
- Third-party wellbeing instrument integration at MVP (LCWS only)
- Caregiver wellbeing trend history chart (dashboard shows current state only)

---

### Feature 5: Dashboard

**Purpose:** Gives caregivers a 2-minute orientation without requiring a conversation. The dashboard must be calm when things are stable and clear when they're not.

**Acceptance Criteria:**
- [ ] Accessible via navigation tab from the companion — never loads as the default app-open view (companion/conversation is always home)
- [ ] Three panels: patient stage indicator, burnout gauge, action items
- [ ] Stage indicator shows: current stage, trajectory label, transition risk colour (green / yellow / red)
- [ ] Action items are companion-generated from recent sessions: max 3, tappable
- [ ] Tapping an action item opens the companion chat with context loaded
- [ ] No streak indicators, usage stats, or gamification elements
- [ ] "Nothing new" state is explicitly calm — no empty state anxiety

**Out of scope:**
- Patient log history view
- Session history / transcript access
- Notification settings (accessible via companion conversation at P1, dashboard settings at P2)

---

## 6. Technical Approach (High-Level)

### Architecture

**Hybrid:** Server-side for all AI inference, RAG retrieval, and log storage. Client-side for UI rendering and real-time conversation display.

```
Browser (Next.js / React)
    ↕ HTTPS / Server-Sent Events
Next.js API Routes (server-side)
    ├── Claude API (claude-sonnet-4-6) — companion inference
    ├── RAG retrieval layer — pgvector or Chroma
    └── Supabase — patient log, burnout state, session data
```

### Key Technology Decisions

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js + TypeScript + Tailwind + shadcn/ui | Preferred stack; app router for streaming responses |
| AI | Claude API — claude-sonnet-4-6 | Long context handles RAG-augmented prompts; tool use for structured log extraction; cost manageable at low volume |
| Embeddings | Voyage AI hosted embeddings (`voyage-3`) | Anthropic's recommended RAG pairing; avoids self-hosting model inference in Vercel's serverless functions (package size, cold starts, memory limits) |
| RAG / Vector store | Supabase pgvector (free tier) | Co-located with app DB; avoids a separate vector service at MVP |
| Re-ranking | Voyage AI hosted rerank (`rerank-2`) | Same-vendor pairing with embeddings; removes local cross-encoder model-serving from the deploy target |
| Session persistence | Structured log for scored/tracked data + short rolling end-of-session summary (100–200 words, stored in `sessions.summary`) — no raw transcript ever stored | Captain-confirmed 2026-09-06. Summary regenerated at end of each session; next session's system prompt includes it alongside key structured fields from `patient_log` and `caregiver_state`. |
| Database | Supabase (PostgreSQL) | Auth, storage, and DB in one; free tier sufficient |
| Hosting | Vercel (frontend) + Supabase (data) | Zero-infra overhead; free tiers cover MVP volume |
| Streaming | Vercel AI SDK | Native streaming + tool use support with Claude |

### Critical Technical Dependencies

1. **RAG pipeline (M1)** — everything depends on retrieval quality. Built and validated before the companion is wired up.
2. **Chunking strategy** — by Markdown heading, not token count. Validated before vectorising (see Phase 2 doc).
3. **Embedding + re-ranking pipeline** — Voyage AI hosted API (`voyage-3`) for embeddings; Voyage AI hosted rerank (`rerank-2`) for top-10 → top-3. Both hosted, called over the network. Must be wired together before running the Early→Middle transition test set. Requires a Voyage AI API key.
4. **Session persistence (resolved 2026-09-06)** — structured log for scored/tracked data (`patient_log`, `caregiver_state`) plus a short rolling end-of-session summary stored in `sessions.summary`. System prompt on the following session includes the summary + key structured fields. No raw transcript stored at any point.
5. **System prompt discipline** — coaching boundary, crisis protocol, and prompt injection guardrail enforced in the system prompt. Must be tested explicitly before M5.
6. **Crisis keyword fallback** — keyword layer fires before LLM response for known crisis phrases. Non-negotiable. Implemented before M5.
7. **Structured extraction schema** — patient log tool definition (see Feature 3) must be finalised before M2 companion build starts.
8. **Cost management** — RAG-augmented prompts will be large. Cache the system prompt. Design check-in flows to minimise unnecessary context.

### Data Model Notes

**Auth and row-level isolation (added to MVP scope 2026-09-06):**
Single-caregiver Supabase Auth login is in MVP scope. All caregiver-specific tables include a `user_id` UUID FK referencing Supabase Auth's `auth.users` table. Row-Level Security (RLS) policies enforce row-level isolation at the database layer; access is additionally enforced at the API-route layer.

Tables with `user_id` FK: `sessions`, `patient_profile`, `patient_log`, `caregiver_state`, `action_items`, `onboarding_progress`. The `vault_chunks` table is shared knowledge-base content and requires no user scoping.

**Session continuity field (resolved 2026-09-06):**
The `sessions` table gains a `summary` field — a short natural-language text (target: 100–200 words) regenerated by the companion at the end of each session. The system prompt for the following session includes this rolling summary alongside key structured fields from `patient_log` and `caregiver_state`. No full-transcript table is added. Raw conversation text is never persisted.

### What's deferred for good reason

- Multi-user / family accounts: single-caregiver Supabase Auth login is in MVP scope (Supabase Auth is already the planned stack's auth provider). Multi-user / family-shared accounts remain deferred until scaling beyond a single caregiver.
- Native mobile: web app + PWA is sufficient for MVP.
- Multi-language: US/English only.
- Payment layer: validation-first. Billing after PMF.

---

## 7. Timeline & Milestones

Scrappy iteration mode. No hard deadlines — velocity over schedule.

| Milestone | Scope | Gate |
|-----------|-------|------|
| **M1: RAG pipeline** | Vectorise vault, validate retrieval quality on Early→Middle queries, chunking verified | Early→Middle transition test set passes (≥90% precision@3) |
| **M2: Companion MVP** | Onboarding + daily check-in + patient log extraction. Single-caregiver login via Supabase Auth. | Founders can complete onboarding and a 3-day check-in loop without bugs |
| **M3: Burnout layer** | Burnout gauge initialised at onboarding, updated per session, dashboard visible | Gauge moves in both directions; amber→red triggers check-in |
| **M4: Dashboard** | Stage indicator + burnout gauge + action items | Dashboard loads in <2s; all 3 panels functional |
| **M5: First real user** | Deploy to 1 caregiver from co-founder's network | User completes onboarding and returns within 7 days |
| **M6: 10-user validation** | Expand cohort, measure retention and qualitative signal | Debrief interviews complete; PMF signal assessed |

**Sequencing rule:** Do not start M2 until M1 is validated. Do not start M5 until M2–M4 are stable for at least one week of internal use.

---

## 8. Known Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| RAG retrieval quality insufficient for transition detection | Medium | High | Build retrieval test set before wiring up companion. Validate at M1 gate. |
| Caregivers too exhausted to complete onboarding | Medium | High | Zero-friction UX is a design principle. Test onboarding with founders first. Resumable if dropped. |
| LLM tone mismatch — companion feels clinical or cheerful rather than warm | Medium | High | System prompt tone is load-bearing. Founders must test extensively before M5. |
| Stage transition flag fires too early or too late | Medium | High | Start with soft framing ("worth watching"). Require 2+ signals across multiple sessions before flagging. |
| Crisis protocol not firing reliably | Low | Critical | Tested explicitly and non-negotiably before M5. Cannot be a happy-path-only test. |
| Part-time team velocity insufficient | High | Medium | Scope ruthlessly. One milestone at a time. Never parallelise M1 and M2. |
| HIPAA exposure from caregivers sharing identifiable patient data | Low | High | No PHI stored in MVP. Anonymised patient IDs. Privacy notice on onboarding. |
| Caregivers don't trust an AI with something this emotional | Medium | High | Tone, warmth, and design are load-bearing. Validate at M5 before M6 expansion. |
| pgvector performance degraded at scale | Low | Low | Irrelevant at MVP volume (<25 users). Revisit before scaling. |

---

## 9. Assumptions

1. Caregivers are willing to engage with a text-based companion without a native mobile app, at least for MVP validation.
2. The Obsidian vault (11 documents) contains sufficient stage knowledge to ground stage-aware responses without external data sources.
3. Early→Middle transition signals are behaviorally observable through caregiver conversation without clinical assessment.
4. A 2-week debrief interview (~15 min per user) is achievable with the 10-user cohort given co-founder's personal network for recruitment.
5. Supabase free tier is sufficient for MVP data volume (<25 users, <6 months).
6. Claude claude-sonnet-4-6 can maintain coaching-boundary discipline via system prompt alone without additional guardrails infrastructure.
7. Caregivers will engage with their own burnout gauge — this is a hypothesis; Goal 3 is specifically designed to validate or invalidate it.
8. No paid user acquisition is required for M5 and M6 cohorts (co-founder's personal network sufficient).

---

## Human Review Checklist

- [ ] Goals are aligned with the Phase 1 spec's four founding goals
- [ ] Success metrics are measurable at 10–25 user scale (no percentages that require large N)
- [ ] User stories are specific and testable
- [ ] Acceptance criteria are clear and binary (done / not done)
- [ ] P0/P1/P2 prioritisation reflects MVP scope from Phase 1 spec
- [ ] Technical approach is feasible on a shoestring budget
- [ ] All dependencies identified (especially M1 → M2 sequencing)
- [ ] Timeline is realistic given part-time bandwidth
- [ ] Both founders agree on priorities and P0 scope

---

*Drafted: June 14, 2026 | Phase 3 of the Hybrid Product Development Workflow*
*Next: Phase 4 — Feature Decomposition*
