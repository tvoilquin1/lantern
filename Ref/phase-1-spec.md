# Product Spec: Lantern (MVP)

**Date:** June 10, 2026
**Status:** Draft — Phase 1 (Specification & Discovery)
**Version:** 0.2

---

## Business Context

Dementia caregiving affects an estimated 11 million unpaid caregivers in the US alone. When a family member is diagnosed, the caregiver is handed a prognosis and sent home — no roadmap, no coach, no warning when things are about to get harder.

Existing tools are either clinical (built for providers, not families) or passive (log your day, nothing happens). No product proactively coaches the caregiver, tracks their wellbeing as a first-class metric, or uses the body of clinical knowledge to prepare them before the next stage hits.

**Founding insight:** The knowledge to guide someone through this journey already exists. The tools to deliver it conversationally now exist. There is no reason for families to figure this out alone.

Lantern is a dementia care companion built for the caregiver — not the patient's chart. It combines an AI companion (proactive, stage-aware, burnout-sensing) with a dashboard that gives caregivers orientation at a glance.

---

## Primary User (MVP Persona)

**Sarah, 52. Managing her mother's Stage 4 diagnosis while working full-time.**

Her mother lives with her. The cognitive decline has been gradual — finances became unmanageable about a year ago, her mother can no longer drive, and Sarah is now fielding calls from her mother's doctor, coordinating medications, and covering the emotional labor her siblings aren't sharing. She's functional, but running on fumes.

She doesn't know what's coming in Stage 5. Nobody told her. She Googles at midnight.

**Why this persona, not early-stage:**
Mid/late-stage caregivers (Stages 4–6) have more acute burnout risk, face more frequent crises, and represent the highest-value users for both the companion and the burnout layer. They also surface more edge cases in the product (safety situations, transition signals, care complexity) that will stress-test the system in ways an early-stage caregiver won't. Design for Sarah first; earlier-stage users will still get value.

**What Sarah needs from Lantern:**
- To know what's normal for Stage 4 and what should alarm her
- To be warned before Stage 5 behaviors start, not after they arrive
- Someone to check in on *her*, not just ask about her mother
- To feel like she's not doing this wrong

---

## Goals

1. **Reduce caregiver isolation** — give every caregiver access to a knowledgeable companion who understands where they are in the journey and what's coming next.
2. **Surface stage transitions before they blindside** — cross-reference the patient log against the GDS body of knowledge to flag emerging patterns and prepare the caregiver in advance.
3. **Make caregiver burnout visible** — track it as a vital sign, trend it over time, and intervene before collapse.
4. **Demonstrate product-market fit** — get 10–25 real caregivers using it daily and generate qualitative signal on what's working.

---

## Success Metrics

At 10–25 users, percentage-based targets are statistically meaningless. Validation-stage metrics are behavioural and qualitative.

**Leading indicators (measurable in product):**

| Signal | What it tells us |
|--------|-----------------|
| Onboarding completion rate | Is the zero-friction UX actually frictionless? |
| 7-day return rate | Did it earn a second visit without prompting? |
| Conversation depth (avg. exchanges per session) | Are users engaging or bouncing after one reply? |
| Burnout gauge views | Do caregivers care about their own state, or only the patient's? |
| Unsolicited companion initiations accepted | Is proactivity welcome or annoying? |

**Qualitative signal (2-week debrief interview, ~15 min per user):**
- "Did you feel less alone while using it?"
- "Were you surprised by anything it told you?"
- "Did it change anything you did for your loved one or yourself?"
- "Would you tell another caregiver to use it?"
- "What would make you stop using it?"

**PMF signal (after 10-user beta):**
- ≥ 3 users initiate conversation without being prompted within the first 2 weeks
- ≥ 2 users refer someone else without being asked
- Qualitative: majority describe the companion as "helpful" or "accurate" unprompted

---

## Competitive Landscape

*Note: formal competitor research not yet completed. This is a preliminary map based on known products. Validate before Phase 3.*

| Product | What it does | What it misses | Lantern's wedge |
|---------|-------------|----------------|-----------------|
| **CareZone** | Medication tracking, appointment logs, care journal | Passive — you log, nothing happens. No companion, no coaching. | Proactive outreach + stage-aware intelligence |
| **Caring Village** | Family care coordination, task sharing, care plans | Built for families, not the primary caregiver's inner life. No burnout layer. | Caregiver wellbeing as a first-class metric |
| **Carely** | Family photo sharing + care updates | Social/communication layer, not a coaching tool | Depth over breadth — coaching, not coordination |
| **Alzheimer's Assoc. apps** | Disease information, resource directories | Informational only. Static. No personalization or conversation. | Dynamic, conversational, adapts to their specific stage |
| **General AI companions (Replika, etc.)** | Emotional support chat | No domain knowledge, no stage awareness, no clinical grounding | Purpose-built for this specific journey |

**The gap:** No product combines proactive outreach + GDS stage-awareness + caregiver burnout tracking in a single companion. That's the space Lantern occupies.

---

## Scope (MVP)

### Pillar 1: AI Companion

| Capability | Description |
|------------|-------------|
| **Onboarding** | GDS-style conversational questionnaire. Establishes patient stage and caregiver baseline (Zarit Burden Index). Creates initial reference point. |
| **Daily check-in (proactive)** | Companion initiates a morning check-in. Default: on. User can reduce frequency or set quiet hours. |
| **Patient log extraction** | Companion asks stage-sensitive questions in natural conversation. Extracts structured data (sleep, nutrition, mobility, behavioral changes) — no forms. |
| **Transition detection** | Cross-references patient log against GDS knowledge base (via RAG). Flags potential stage transitions with clinical framing + practical guidance. |
| **Burnout sensing** | Multi-signal: self-report, behavioral (logging gaps, night-time activity), periodic PHQ-9 / Zarit screening. Weighted over time. |
| **Coaching & relief** | Responds to rising burnout signals with specific interventions. Prepares caregiver when transition is near. Holds space when the caregiver needs to talk. |

### Pillar 2: Dashboard

Answers three questions at a glance:
1. **Where is the patient?** — Stage indicator, recent trajectory, transition risk (green / yellow / red)
2. **Where am I?** — Caregiver burnout gauge (green / amber / red)
3. **What's in front of me?** — Actionable items surfaced by the companion

### Knowledge Base (RAG)

The Obsidian vault (`obsidian/lantern/`) is the knowledge backbone:
- 7 stage notes (GDS Stages 1–7)
- 7 cross-cutting reference notes (communication, legal, medical, crisis, burnout, healthcare system, end-of-life)
- Vectorized and queried at inference time for stage-aware responses

---

## Out of Scope (MVP)

| Feature | Rationale |
|---------|-----------|
| Family coordination / activity feed / shared calendar | Dilutes the unique value proposition. Exists elsewhere. |
| Voice UI (beyond basic STT/TTS) | Text-first keeps MVP focused. Add in v2 if validated. |
| Clinical decision support / diagnostics | Hard legal/regulatory boundary. Lantern coaches; it does not diagnose. |
| Native iOS/Android app | Web app + PWA sufficient for MVP. |
| Multi-language / localization | US/English only for MVP. |
| User accounts / multi-user | Single-user demo for MVP. Auth added when scaling. |
| Payment / monetization layer | Validation-first. Add billing after PMF is demonstrated. |

---

## Constraints

### Budget
- **Shoestring / near-zero.** Prioritize free tiers and open tooling.
- LLM costs (Claude API or equivalent): design for minimal tokens per interaction. Cache aggressively.
- Hosting: free tier (Vercel, Railway, Supabase, or equivalent) until there's revenue to justify cost.
- Vector DB: free tier (Supabase pgvector, Chroma local, or Pinecone free) for MVP.

### Team
- **2 people** (founder + co-founder), both working part-time alongside full-time jobs.
- No dedicated QA, DevOps, or designer. Both founders cover everything.
- No hard deadline — but velocity matters. Every week of delay is a week without user feedback.

### Technical
- **LLM:** Claude API — Claude Sonnet 4.6. Long context window handles RAG-augmented prompts; tool use supports structured data extraction from conversation; cost manageable on low volume.
- RAG pipeline over the Obsidian vault is the backbone; quality of knowledge retrieval is a first-order concern.
- The app must work reliably on a single conversation thread before multi-user is considered.
- Accuracy on stage-sensitive guidance is critical — wrong information in this domain erodes trust immediately.
- **Coaching boundary:** Lantern offers stage-appropriate coping suggestions and validated self-care recommendations grounded in the knowledge base. It does not offer medical advice, treatment recommendations, or clinical guidance beyond what the RAG layer can source. This line is enforced in the system prompt.

### Regulatory / Legal
- **Hard boundary:** No diagnostic language. Lantern is a coaching and support tool, not a clinical decision-support system.
- **Crisis protocol:** If a user expresses a mental health crisis, the companion surfaces crisis resources (988 Suicide & Crisis Lifeline) and does not attempt to manage the situation. This behavior is non-negotiable and cannot be overridden by user settings.
- No PHI (Protected Health Information) stored in ways that would trigger HIPAA obligations at MVP stage — but design data layer with future compliance in mind.
- Disclaimer required on all clinical or stage-related output.

---

## Stakeholders & Roles

| Stakeholder | Role |
|-------------|------|
| **Founder (Theo)** | Product lead, AI/backend, strategy |
| **Co-founder** | Co-builder, domain knowledge, validation network |
| **Target user (caregiver)** | Primary feedback source during validation; recruit through co-founder's personal network + family and friends word of mouth. No paid acquisition at MVP stage. |

---

## Timeline

No hard deadline. Operating in **scrappy iteration mode**: build the smallest thing that can be tested with a real caregiver, learn, repeat.

Rough sequencing (not a committed sprint plan):

| Milestone | Description |
|-----------|-------------|
| **M1: RAG pipeline** | Vectorize the Obsidian vault. Confirm retrieval quality on stage-specific queries. **⚠️ Chunking:** chunk by Markdown heading (`##`), not token count — default RAG library behavior splits stage notes badly. Each `##` section must be one chunk. Verify the "Transition Warning Signs" section in Stage 4 is intact as a single chunk before running any retrieval tests. Run the Stage 4→5 retrieval test set (see Phase 2 workflows doc) before marking M1 complete. |
| **M2: Companion MVP** | Conversational interface with onboarding + daily check-in. Single-user, no auth. |
| **M3: Burnout layer** | Add caregiver state tracking and burnout signal detection. |
| **M4: Dashboard** | Minimal dashboard: stage indicator, burnout gauge, action items. |
| **M5: First real user** | Deploy to 1 caregiver from co-founder's network. Observe and learn. |
| **M6: 10-user validation** | Expand to 10 users. Measure retention and qualitative signal. |

---

## Known Risks & Assumptions

| Risk / Assumption | Mitigation |
|-------------------|------------|
| Caregivers are too exhausted to onboard with a new app | Zero-friction UX is a design principle, not an afterthought. Test onboarding first. |
| LLM gives hallucinated or inaccurate stage guidance | RAG grounds all stage-specific answers in the knowledge base. Add explicit disclaimers. |
| "Stage transition" detection is too early or too late | Start with soft flags ("this pattern is worth watching") rather than hard pronouncements. |
| Part-time team runs out of steam | Scope ruthlessly. Ship M1 before building M2. Don't parallelize. |
| HIPAA exposure | Avoid storing identifiable health data in MVP. Use anonymized patient IDs. |
| Users don't trust an AI with something this emotional | Tone, warmth, and design are load-bearing. Validate before scaling. |

---

## Human Review Checklist

- [ ] Goals are specific and measurable
- [ ] Success metrics are quantifiable
- [ ] Scope is clearly defined (in vs. out)
- [ ] Constraints documented
- [ ] Timeline realistic given part-time bandwidth
- [ ] Both founders agree on priorities
- [ ] No conflicting requirements

---

*Drafted: June 10, 2026 | Phase 1 of the Hybrid Product Development Workflow*
*Next: Phase 2 — Workflows & Use Cases*
