# Lantern Caregiver Wellbeing Scale (LCWS)

> **Status:** Draft for co-founder validation  
> **Alignment:** Zarit Burden Interview (ZBI)  
> **Detection mechanism:** Structured daily check-in (1 question)  

---

## Table of Contents

- [Purpose & Principles](#purpose--principles)
- [ZBI Alignment Map](#zbi-alignment-map)
- [Level 5 — Stable](#level-5--stable)
- [Level 4 — Managing](#level-4--managing)
- [Level 3 — Strained](#level-3--strained)
- [Level 2 — Overwhelmed](#level-2--overwhelmed)
- [Level 1 — Crisis](#level-1--crisis)
- [Daily Check-In Design](#daily-check-in-design)
- [Escalation Velocity Logic](#escalation-velocity-logic)
- [Lantern Response Modes by Level](#lantern-response-modes-by-level)
- [Missed Check-In Handling](#missed-check-in-handling)
- [ZBI Domain Profile Reference](#zbi-domain-profile-reference)
- [Phase 2: Conversation-Based Detection](#phase-2-conversation-based-detection)
- [Validation Questions for Co-Founder](#validation-questions-for-co-founder)

---

## Purpose & Principles

The Lantern Caregiver Wellbeing Scale (LCWS) is a **5-level framework** that maps the oscillating states of wellbeing a caregiver moves through over time. It serves as the intelligence layer for the Lantern AI companion — enabling Lantern to sense where a caregiver is and respond appropriately.

### Design principles

1. **Respect the caregiver's limited energy.** The check-in must take ≤5 seconds. No 22-item questionnaires.
2. **Truthful detection via self-report.** A caregiver who's at level 2 but reports "3" still told you they're not okay. The trend matters more than the absolute number.
3. **Level-aware coaching.** Lantern does not coach the same way at every level. Each level demands a distinct response mode.
4. **Oscillation, not linearity.** Caregivers move up and down the scale day-to-day. The system tracks velocity and trend, not just point-in-time.
5. **Aligned to a validated instrument.** The scale maps to the Zarit Burden Interview (ZBI) so it has clinical credibility and maps to established research.

---

## ZBI Alignment Map

| LCWS Level | ZBI Tier | ZBI Score Range |
|---|---|---|
| **5 — Stable** | Little or no burden | 0-21 |
| **4 — Managing** | Mild to moderate | 21-40 |
| **3 — Strained** | Moderate to severe | 41-55 |
| **2 — Overwhelmed** | Moderate to severe | 55-70 |
| **1 — Crisis** | Severe | 61-88 |

**Note:** Levels 3 and 2 overlap in ZBI's "moderate to severe" band because that range (41-70) is wide. The distinction between them is behavioral — still functional but exhausted (3) vs. functional impairment setting in (2) — not just score-based.

---

## Level Definitions

### Level 5 — Stable

| Dimension | Description |
|---|---|
| **ZBI equivalent** | Little or no burden (0-21) |
| **Core feeling** | Capable, present, finding meaning |
| **Self-reported** | "I'm doing well — challenged but okay" |
| **Check-in label** | 5 — Doing well. Challenged, but okay. |

**What it looks like:**  
The caregiver has adapted well. They acknowledge it's hard but feel they're meeting the challenge. They have perspective — they see the person, not just the patient. Self-care happens (small things — a walk, a call with a friend). They can talk about positive moments without forcing it.

**ZBI domain profile:** Low across all five domains. Grief and ambiguous loss expressed as manageable sadness, not distress.

**Lantern response mode:** [[#Lantern Response Modes by Level|Reinforce & celebrate]]

---

### Level 4 — Managing

| Dimension | Description |
|---|---|
| **ZBI equivalent** | Mild to moderate burden (21-40) |
| **Core feeling** | Treading water, coping day-to-day |
| **Self-reported** | "I'm getting by. It's a lot." |
| **Check-in label** | 4 — Managing. It's a lot, but okay. |

**What it looks like:**  
The default state for most long-term caregivers. Stress is present but being handled. The routine works but fatigue is building. Sleep may be disrupted sometimes. Low-grade worry about the future. The caregiver is functional but feels stretched.

**ZBI domain profile:** Elevated in Loss of Control and Social/Family Life. Relationship burden still low. Emotional well-being is holding.

**Lantern response mode:** [[#Lantern Response Modes by Level|Light support & awareness]]

---

### Level 3 — Strained

| Dimension | Description |
|---|---|
| **ZBI equivalent** | Moderate to severe burden (41-55) |
| **Core feeling** | Irritable, exhausted, guilty, losing patience |
| **Self-reported** | "I'm struggling. I need a break but I can't take one." |
| **Check-in label** | 3 — Struggling. I need a break. |

**What it looks like:**  
The inflection point. The caregiver is snapping at people, cancelling plans regularly, feeling guilty about their own irritability. Sleep is significantly disrupted. Physical symptoms may emerge (headaches, getting sick more often). They say "I need a break" but don't take one. They feel trapped in a cycle they can't escape.

**ZBI domain profile:** Elevated in Emotional Well-being and Burden in the Relationship. Guilt and anger markers present.

**Lantern response mode:** [[#Lantern Response Modes by Level|Active coaching]] — the highest-value intervention zone

---

### Level 2 — Overwhelmed

| Dimension | Description |
|---|---|
| **ZBI equivalent** | Moderate to severe burden (55-70) |
| **Core feeling** | Helpless, hopeless, isolated, losing control |
| **Self-reported** | "I can't do this anymore. I feel completely alone." |
| **Check-in label** | 2 — Completely overwhelmed. |

**What it looks like:**  
Functional impairment is setting in. The caregiver is neglecting their own needs (skipping meals, poor hygiene). They've withdrawn from friends and family. There may be rough moments with the patient — shouting, impatience, missed medications. They express wanting to give up or run away.

**ZBI domain profile:** High across all domains. Loss of Control and Emotional Well-being dominate. Strong anger at the situation or the patient.

**Lantern response mode:** [[#Lantern Response Modes by Level|Intervention]]

---

### Level 1 — Crisis

| Dimension | Description |
|---|---|
| **ZBI equivalent** | Severe burden (61-88) |
| **Core feeling** | Complete breakdown |
| **Self-reported** | "I can't. I'm done. I need help now." |
| **Check-in label** | 1 — I can't keep going. I need help. |

**What it looks like:**  
The caregiver has reached their limit. Crisis event likely — ER visit, explosive conflict, desire to abandon care. Suicidal ideation may be present. Care quality has likely collapsed. Acute burnout stage.

**ZBI domain profile:** Severe across all domains.

**Lantern response mode:** [[#Lantern Response Modes by Level|Crisis protocol only]]

---

## Daily Check-In Design

### The one-question model

Every day (or every time the caregiver opens the app), Lantern asks:

> **"On a scale of 1 to 5, how are you feeling today as a caregiver?"**
>
> - **1** — I can't keep going. I need help.
> - **2** — Completely overwhelmed.
> - **3** — Struggling. I need a break.
> - **4** — Managing. It's a lot, but okay.
> - **5** — Doing well. Challenged, but okay.

### Follow-up (conditional)

If the caregiver selects **3 or below**, the AI follows up with:

> **"I hear you. What's the hardest part right now?"**

This free-text response:
- Feeds the conversation ("You mentioned X — let's talk about that")
- Refines the level estimate through sentiment
- Gives the AI material to work with

### Why this works

1. **5 seconds per day.** The caregiver is exhausted. Any longer and compliance drops.
2. **Conversation anchor.** The AI companion knows where to start before the real exchange begins. No cold open.
3. **Self-report bias is acceptable.** Someone at level 2 who reports "3" is still telling you they're not okay. The *trend* matters more than the absolute number.
4. **Level 1 never gets missed.** Asking "how are you?" with an obvious exit for "I'm not okay" is intentionally easy for a caregiver who would otherwise say "fine."

---

## Escalation Velocity Logic

The scale is not point-in-time — the AI tracks trends over the last 7 days:

| Pattern | Interpretation | Action |
|---|---|---|
| Stable at 4-5 for 7+ days | Baseline wellbeing | Low proactivity |
| Drop from 4 to 3 over 2 days | Early warning | Gently check in |
| Drop from 4 to 2 in one day | Acute stress trigger | Active coaching |
| Drop from 3 to 1 in one day | Possible crisis event | Crisis protocol |
| Stuck at 2 for 3+ consecutive days | Chronic overwhelm | Escalate to human support |
| Stuck at 3 for 7+ consecutive days | Plateauing strain | Escalate to professional |
| Rising from 2 to 4 over a week | Recovery | Celebrate wins, reinforce |
| Oscillating between 3 and 4 with no 5 | Chronic low-grade strain | Light persistent coaching |
| Single 1-day drop to 2 then back up | Stress spike, recovered | Monitor, no action needed |

### Duration-weighted severity

- Being at level 2 for one day is different from being at level 2 for a week.
- The system weights level × consecutive days — a sustained 3 is more concerning than a one-day 2.

---

## Lantern Response Modes by Level

### Level 5 — Reinforce & Celebrate

- Normal, light conversation
- Celebrate wins ("That sounds like a great moment")
- Reinforce boundaries and habits that are working
- Low proactivity — mostly companionship
- Example: *"It sounds like you're in a good space — what's been working for you?"*

### Level 4 — Light Support & Awareness

- Normalize the difficulty ("It's okay that it's hard")
- Gentle check-ins on self-care
- Plant seeds for earlier intervention when things tip
- Example: *"How's your sleep been?"* / *"When did you last take an hour for yourself?"*
- Offer practical tips, but don't push

### Level 3 — Active Coaching (highest value zone)

- Empathetic inquiry ("That irritability isn't a failure — it's a signal")
- Concrete self-care suggestions — small, achievable, *today*
- Boundary-setting coaching
- Guilt normalization and reframing
- Higher proactivity — initiate conversations, don't wait
- Example: *"Let's talk about what you need right now. What's one thing that could change today?"*

### Level 2 — Intervention

- Beyond coaching. Validate, empathize, then *direct* toward action.
- "This is a real signal. I want you to put yourself first right now."
- Specific next step — no open-ended questions
- Facilitate reconnecting with support network, professional help, or respite
- Example: *"Can you commit to one of these three things today?"*
- Not a conversation — a guided action sequence

### Level 1 — Crisis Protocol Only

- No coaching. No normal conversation.
- Immediate warm handoff to human support
- 988 referral if suicidal ideation
- AI's job: don't make it worse; ensure the caregiver reaches a real human
- If any risk of harm to patient or self → escalate immediately

---

## Missed Check-In Handling

If the caregiver doesn't respond to the check-in for 2+ consecutive days, the AI sends a light touch:

> *"I noticed you didn't check in yesterday. No pressure — just want you to know I'm here when you're ready. How are things?"*

**Why this works:**
- No guilt. No shaming.
- The caregiver who skips check-ins may be the one who needs the most help and has the least energy to ask for it.
- If they still don't respond after 5 days, the system escalates to the co-founder or designated human contact.

---

## ZBI Domain Profile Reference

The scale maps to the **16 items of the Zarit Burden Interview** (the full 22 is broader; these are the core domains).

| ZBI Domain | 5 — Stable | 4 — Managing | 3 — Strained | 2 — Overwhelmed | 1 — Crisis |
|---|---|---|---|---|---|
| Burden in the relationship | Low | Low | Elevated | High | Very high |
| Emotional well-being | Low | Low-moderate | High | Very high | Severe |
| Social & family life | Low | Moderate | Elevated | High | Very high |
| Finances | Low | Low | Low-moderate | Moderate | High |
| Loss of control over one's life | Low | Moderate | High | Very high | Severe |

### Per-domain signals (for future conversation analysis)

**Burden in the relationship:**
- Resentment at the patient's demands
- Anger, embarrassment, guilt
- Feeling the patient is "a different person"

**Emotional well-being:**
- Exhaustion, anxiety, depression
- Feeling trapped or hopeless
- Apathy ("I don't care anymore")

**Social & family life:**
- Social withdrawal, cancelled plans
- Resentment at family who don't help
- Feeling of missing out on life

**Finances:**
- Financial strain language
- Job loss or reduced hours
- Unable to afford care

**Loss of control:**
- "I can't keep up"
- "I've lost control of my life"
- "I can't plan anything"

---

## Phase 2: Conversation-Based Detection

The preferred long-term detection mechanism is organic conversation — the AI companion analyzes what the caregiver says and infers their level without any structured check-in.

### Why this is deferred to Phase 2

1. **Implementation complexity.** NLP-based sentiment analysis across ZBI domains is non-trivial.
2. **Cost.** Every conversation needs inference to extract the level.
3. **Cold start problem.** The first few conversations have no baseline.
4. **False positive risk.** The AI could hallucinate a level shift that isn't there.

### How Phase 2 would work

- Use the keyword/trigger framework to detect emotional signals in free-form chat
- Cross-reference with the self-reported check-in score
- If signals diverge from self-report → probe gently
- The check-in remains the anchor — conversation analysis is additive

---

## Validation Questions for Co-Founder

1. Do the 5 level descriptions match the caregiver journey you've observed in practice?
2. Is "Strained" (Level 3) the right inflection point for coaching intervention — the moment where catching someone makes the biggest difference?
3. Is the ZBI alignment useful for credibility, or does it feel too clinical and disconnected from lived experience?
4. Will a caregiver at Level 2 honestly report "2"? If not, how do we catch them reliably?
5. What's the hardest transition to catch? Which level shift happens most silently and is most dangerous when missed?
6. Is "one question a day" enough to be useful, or does it feel too shallow?

---

## Related

- [[Framework Overview]]
- [[Product Brief (MVP)]]

---

*Last updated: June 10, 2026*
