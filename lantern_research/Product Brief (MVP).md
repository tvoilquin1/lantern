# Product Brief: Lantern (MVP)

**Date:** June 9, 2026
**Status:** Vision / Pre-build

---

## One-Sentence Pitch

> *Lantern gives dementia caregivers something no one else does: a coach who understands the disease, the caregiver's exhaustion, and what's coming next — so you don't have to figure it out alone.*

---

## The Problem

Dementia caregiving is a 36-hour day on repeat. The caregiver faces:
- **No coach** — they're handed a diagnosis and sent home. No one tells them what Stage 4 looks like, when to expect the transition to Stage 5, or what to do differently when it happens.
- **No one watching them** — support systems focus on the patient. The caregiver's burnout is invisible until they collapse.
- **No proactive intelligence** — existing apps are passive: you log, they store. They don't push useful information at the moment it matters.

**Founding insight (from co-founder's experience):** *There is no reason to go through this alone. The tools now exist to change that.*

---

## The Product (MVP — 2 Pillars)

### Pillar 1: AI Companion (Front Door)

The caregiver interacts with Lantern primarily through conversation — text-based, voice-optional.

**What the companion does:**

| Capability | How |
|------------|-----|
| **Onboarding — sets the baseline** | GDS-style questionnaire via conversation. Establishes patient stage, caregiver baseline (Zarit Burden Index or equivalent). Creates the initial reference point. |
| **Daily check-in (proactive)** | "Good morning. Mom was up at 4 AM last night. I'm concerned about sundowning escalation. Want me to suggest evening routine changes?" |
| **Patient log extraction (zero-friction)** | Companion asks specific, stage-sensitive questions in natural conversation. Extracts structured data (sleep quality, nutrition, mobility, behavioral changes) without the caregiver filling out forms. |
| **Transition detection** | Cross-references unfolding patient log against the GDS body of knowledge (via RAG). Flags potential stage transitions with both clinical framing and practical caregiving guidance. |
| **Caregiver burnout sensing** | Multi-signal detection: self-report ("How are you holding up?"), behavioral signals (gaps in logging, night-time app activity), periodic screening (abbreviated PHQ-9 / Zarit). Weighted over time. |
| **Coaching & relief** | When burnout signals rise: suggests specific interventions (respite, support group, a single task to delegate). When a transition is near: prepares the caregiver before it hits. When the caregiver just needs to talk: holds space. |

**Tone:** Professional coach + practical assistant. Warm but never saccharine. Direct but never cold. It treats the caregiver as a capable person in an impossible situation.

**Proactivity level:** High by default (user can dial down). A quiet day has a morning check-in. A flagged pattern triggers an unscheduled nudge. Silence from the caregiver for 48 hours triggers a soft check-in.

### Pillar 2: Dashboard (Orientation Layer)

The caregiver opens the dashboard for *overview*, not *work*. It answers three questions at a glance:

1. **Where is the patient?** Stage indicator, recent trajectory, transition risk (green/yellow/red)
2. **Where am I?** Burnout indicator — invisible health made visible. A simple gauge: green (steady) → amber (watching) → red (intervene)
3. **What's in front of me?** Actionable items the companion has surfaced: log gaps, flagged patterns, suggested reads, appointment reminders

---

## Core Design Principles

### 1. Zero friction is the feature
The companion extracts more from a 2-minute conversation than a form could get in 10. The caregiver should never feel like the app is *work*. If it feels like a chore, it's broken.

### 2. Proactive but configurable
The companion initiates. The user can turn down the frequency or set quiet hours. But the default is: it shows up for you, because you're too exhausted to come to it.

### 3. Stage-aware, not diagnostic
Lantern knows the GDS framework cold. It can say "This looks like a Stage 4–5 transition" and explain what that means for care. It NEVER says "Your loved one has Alzheimer's" or "They are at Stage X clinically." That line is firm.

### 4. Burnout is tracked like a vital sign
The caregiver's wellbeing is not an afterthought — it's a tracked metric with trends, alerts, and interventions. No other app does this.

---

## Technical Architecture (MVP)

```
┌─────────────────────────────────────────────────────┐
│                   Caregiver (User)                    │
│              (Conversation + Dashboard UI)            │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              AI Companion Agent                      │
│  - Chat / voice interface                            │
│  - Proactive check-in scheduler                      │
│  - Conversation → structured data extraction         │
│  - Burnout signal detection                          │
│  - Coaching & intervention logic                     │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              RAG Engine                              │
│  - Body of knowledge (Obsidian markdown → vector DB) │
│  - GDS stages, reference notes, care protocols       │
│  - Queried at inference time for stage-aware answers │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              Data Layer                              │
│  - Patient state (stage, log history, trajectory)    │
│  - Caregiver state (burnout metrics, engagement)     │
│  - Config (proactivity level, quiet hours, etc.)     │
│  - Simple KV store or SQLite (MVP)                   │
└─────────────────────────────────────────────────────┘
```

**RAG over the body of knowledge is the backbone.** The Obsidian vault we've built (7 stages + 7 reference notes) becomes Lantern's knowledge base. The AI companion queries it to answer stage-specific questions and detect transition patterns. We can add to it, refine it, and version it independently of the app code.

---

## What the MVP Is NOT (Scope Boundaries)

| Excluded from MVP | Rationale |
|-------------------|-----------|
| Family coordination / scheduler / activity feed | Deferred. Exists in other apps. Would dilute the unique value. |
| Voice UI (beyond basic STT/TTS) | Add later. Text-first keeps MVP focused. |
| Clinical decision support / diagnostics | Legal/regulatory boundary. Lantern coaches, doesn't diagnose. |
| Native mobile app | Web app + PWA is sufficient for MVP. Native only if needed. |
| Multi-language | US/English only for MVP. |

---

## Success Metrics

| For the caregiver | For the business |
|------------------|-----------------|
| Self-reported burnout reduction (PHQ-9 / Zarit trend) | Retention at 30/60/90 days |
| Reduced sense of isolation (NPS / qualitative) | Daily active usage (conversations initiated) |
| Feeling prepared for stage transitions | Caregiver does not quit (or quiet quit) |
| Tangible actions taken (respite scheduled, support group joined) | Referrals / word-of-mouth from caregiver communities |

---

## Execution Plan (Next Steps)

1. **Validate the concept** — put this brief in front of 5–10 real dementia caregivers (ideally through the co-founder's network). What resonates? What's missing? What would make them pay for it?
2. **Define the MVP conversation design** — the first 5 interactions a caregiver has with the companion. What does onboarding feel like? What does a morning check-in sound like?
3. **Build the RAG pipeline** — vectorize the Obsidian vault, connect it to an LLM (GPT-4 or Claude), build a simple web front-end for conversation testing
4. **Build the data layer** — patient state, caregiver state, configuration
5. **Ship the MVP** — web app with dashboard + conversation interface, no user accounts initially (single-user demo)

---

*This brief is a snapshot of our June 9, 2026 conversation. It's meant to capture the vision clearly enough to validate and build from, but flexibly enough to evolve as we learn.*
