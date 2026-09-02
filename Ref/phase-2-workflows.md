# Phase 2: Workflows & Use Cases — Lantern MVP

**Date:** June 14, 2026
**Status:** Draft — Phase 2 (Workflows & Use Cases)
**Version:** 0.1
**Input:** Phase 1 spec v0.2

---

## Primary Persona

**Sarah, 52** — managing her mother's Stage 4 dementia while working full-time. Her mother lives with her. Sarah doesn't know what's coming in Stage 5. She Googles at midnight. She needs orientation, not more information.

---

## Workflows

---

## Use Case 1: First-Time Onboarding

**Actor:** Sarah (new user, first session)
**Goal:** Establish her mother's current stage and her own baseline so Lantern can be immediately useful — not ask for data and then do nothing with it.

**Preconditions:**
- Sarah has opened Lantern for the first time (web app, no account required at MVP)
- She has roughly 10 minutes to complete setup

**Main Flow:**
1. Sarah lands on the home screen. A short framing message explains what Lantern is and what the next few minutes will involve ("I'm going to ask you some questions about where your mother is right now — this helps me give you guidance that actually fits your situation").
2. Companion begins a GDS-style conversational questionnaire — not a clinical form, but natural language questions about the patient's current abilities (finances, driving, memory, daily tasks, behavioral changes).
3. Sarah answers in her own words. Companion extracts structured data from responses — no checkboxes or dropdowns.
4. After ~6–8 exchanges, companion summarizes what it's heard: "Based on what you've described, your mother sounds like she's in Stage 4 — she's losing the ability to manage finances and familiar tasks, but she's still aware of herself and her surroundings." Sarah confirms or corrects.
5. Companion then shifts focus to Sarah: "Before we go further — how are *you* doing?" Runs a lightweight Zarit Burden Index screen through conversation (not a form).
6. Sarah answers. Companion acknowledges her state, sets a burnout baseline, and gives a brief framing of what to expect next.
7. Dashboard loads for the first time — stage indicator (Stage 4), burnout gauge (initial reading), one or two orientation items surfaced from the knowledge base.
8. Companion closes onboarding: "I'll check in with you tomorrow morning. You can always come back here to talk between then and now."

**Alternate Flows:**

**A1: Sarah doesn't know the stage**
- Companion asks behavioral questions instead of stage-based ones ("Has she stopped being able to pay bills on her own?", "Does she still drive?")
- Derives the stage from answers; makes the inference transparent ("Based on what you're describing, this sounds like Stage 4 — here's what that typically means")

**A2: Sarah is too exhausted to finish**
- After 3+ minutes with no response, companion offers: "We can pick this up when you have more space. I've saved where we are."
- Resumes from last completed question next session

**A3: Sarah corrects the stage estimate**
- Companion accepts the correction: "You know her better than I do. I'll use Stage 5 as our starting point."
- Adjusts knowledge retrieval accordingly

**A4: Burnout screen reveals acute distress**
- Companion pauses: "What you're describing sounds really hard. I want to make sure you're okay."
- If crisis indicators present: surfaces 988 Suicide & Crisis Lifeline; does not attempt to manage the situation
- If high burnout but not crisis: acknowledges, adjusts onboarding pace, notes burnout state as elevated baseline

**Postconditions:**
- Patient stage and caregiver burnout baseline stored in session
- RAG retrieval is now stage-scoped to Stage 4
- Dashboard shows initial orientation
- Daily check-in scheduled for next morning

---

## Use Case 2: Daily Check-in (Companion-Initiated)

**Actor:** Sarah (returning user)
**Goal:** Sarah gets a brief, grounded check-in that acknowledges her day before it starts — and surfaces anything useful from the previous day's log.

**Preconditions:**
- Sarah has completed onboarding
- It is the morning (default: 8am, configurable)
- At least one previous session exists

**Main Flow:**
1. Sarah receives a companion message (push notification or opens app to find it waiting): "Good morning. How did last night go?"
2. Sarah responds in her own words — could be one sentence, could be a paragraph.
3. Companion listens, extracts any patient-relevant signals (sleep, agitation, incidents) without making it feel like data collection.
4. If something clinically notable surfaces ("she was up three times last night and didn't recognize me"), companion acknowledges it and flags it for the log ("I'm noting that — night-time disorientation like this can be worth tracking. Has this happened before?").
5. Companion asks one or two light follow-up questions — enough to update the log, not enough to feel like an interview.
6. Check-in closes. Companion offers one relevant piece of orientation: either a practical tip, something to watch for today, or validation ("What you're doing is hard. Covering this level of care while working full-time is a lot.").
7. Dashboard updates with any new data.

**Alternate Flows:**

**A1: Sarah doesn't respond that morning**
- No follow-up notification until the next scheduled check-in (not pestering)
- Gap in log is tracked quietly as a behavioral signal (logging gaps = potential burnout indicator)

**A2: Sarah opens the app outside the check-in window**
- Companion greets her: "Hey — you're here early (or: later than usual). What's on your mind?"
- Treats it as an open conversation, not a check-in

**A3: Sarah reports a significant incident (fall, wandering, aggression)**
- Companion acknowledges the severity: "That sounds really frightening. Are you both okay now?"
- Logs the incident with explicit flag for the transition detection layer
- Surfaces relevant GDS knowledge: what incidents like this can signal at Stage 4, what to watch for next
- Does not diagnose or alarm; frames as "worth watching"

**A4: Burnout signals are elevated (terse responses, long delays, negative sentiment)**
- Companion checks in on Sarah directly: "Before we talk about your mom — how are *you* holding up?"
- Adjusts tone for the rest of the session; deprioritizes patient log extraction

**Postconditions:**
- Patient log updated with new data points
- Burnout signal updated (positive or negative direction)
- Dashboard reflects any changes
- Transition detection layer has new data to process

---

## Use Case 3: Transition Detection & Advance Warning

**Actor:** Sarah (after several weeks of use)
**Goal:** Sarah gets a heads-up before Stage 5 behaviors arrive — not a diagnosis, but enough warning to prepare.

**Preconditions:**
- Patient is currently at Stage 4
- Multiple check-ins have logged patient behavior over time
- RAG pipeline has the GDS Stage 4→5 transition knowledge indexed

**Main Flow:**
1. Companion cross-references the accumulated patient log against Stage 4→5 transition signals in the knowledge base.
2. A pattern emerges: three check-ins in the past two weeks have logged incidents consistent with emerging Stage 5 behaviors (ADL decline: dressing assistance needed, increased confusion in the afternoon, one episode of not recognizing Sarah's name).
3. Companion initiates a proactive message outside the normal check-in: "I've been noticing something in what you've been sharing with me, and I want to talk to you about it when you have a few minutes. Is now okay?"
4. When Sarah responds, companion explains what it's been observing: "Over the past few weeks, I've noticed a few things that are worth flagging — particularly the afternoon confusion and the help she needed getting dressed. These can be early signs that Stage 5 is starting to emerge."
5. Companion frames this carefully: "This doesn't mean you're there yet — it means it's worth watching. Stage 5 typically brings [X, Y, Z]. You don't have to be caught off guard by those."
6. Companion shares one or two practical preparation steps: what to expect, what support changes might be useful, what questions to raise with her doctor.
7. Sarah can ask follow-up questions. Companion answers from the knowledge base.
8. Dashboard transition risk indicator updates from green to yellow.

**Alternate Flows:**

**A1: Sarah is alarmed or upset by the flag**
- Companion acknowledges first: "I know this is hard to hear. It doesn't mean things are falling apart — it means we're paying attention together."
- Slows down, holds space, doesn't push more information

**A2: Sarah disputes the pattern**
- "Those incidents were flukes, she was just tired." Companion accepts it: "You know her best. I'll keep an eye on it — if I see more of these patterns, I'll mention it again."
- Logs Sarah's interpretation; doesn't escalate unless pattern continues

**A3: Stage progression unclear (mixed signals)**
- Companion does not flag a transition: "I'm seeing some patterns, but I want to watch for a bit longer before I say anything definitive. Keep checking in with me."
- Waits for more data

**Postconditions:**
- Dashboard transition risk updated (yellow)
- Stage 5 preparation content unlocked in companion's knowledge retrieval
- Sarah has context to raise with doctor if she chooses
- No alarm, no diagnosis — framing is "worth watching, here's what to expect"

---

## Use Case 4: Burnout Detection & Intervention

**Actor:** Sarah (ongoing use)
**Goal:** Lantern detects that Sarah is approaching burnout before she realizes it herself, and intervenes with something useful — not a hotline.

**Preconditions:**
- Sarah has been using Lantern for 2+ weeks
- Burnout baseline established at onboarding
- Multiple signals are accumulating

**Main Flow:**
1. Companion's burnout detection layer aggregates signals across sessions:
   - Self-report: Sarah's responses have been shorter and more negative ("exhausted," "can't keep doing this," "my siblings don't help at all")
   - Behavioral: two missed check-ins this week; one check-in at 11:47pm
   - Periodic screen: Zarit Burden Index re-administered two weeks after onboarding shows an increase
2. Burnout gauge crosses threshold from amber to red.
3. Companion initiates: "I want to check in on you — not about your mom, just about you. How are you actually doing?"
4. Sarah opens up ("I'm not sleeping, I had a fight with my brother, and I cried in my car before work twice this week").
5. Companion holds space first: "That sounds really hard. You're carrying a lot."
6. After Sarah feels heard, companion asks permission to share something: "Can I share a few things that other caregivers in your situation have found helpful?"
7. Companion surfaces evidence-based interventions from the knowledge base appropriate for high-burnout Stage 4 caregivers: respite strategies, sibling conversation frameworks, sleep hygiene adjustments, validation that her emotional response is normal.
8. Companion doesn't prescribe. It offers options: "Some of these might not fit right now. Is any of this useful to you?"
9. Dashboard burnout gauge shows red. A note appears: "Lantern has flagged high caregiver stress. This is worth paying attention to."

**Alternate Flows:**

**A1: Crisis indicators present**
- Sarah expresses suicidal ideation or acute crisis language
- Companion stops all other threads: "I hear you. What you're feeling matters. I want to make sure you're safe right now."
- Surfaces 988 Suicide & Crisis Lifeline immediately
- Does not attempt to manage the crisis; holds space and refers

**A2: Sarah dismisses the check-in**
- "I'm fine, just tired." Companion accepts it without pushing: "Okay. I'm here if that changes."
- Logs dismissal; continues monitoring; re-raises if signals continue to accumulate

**A3: Sarah wants to talk about her mother, not herself**
- Companion follows her lead but weaves in a single check-in at a natural pause: "Before we wrap up — are you taking care of yourself in all of this?"

**A4: Burnout improves**
- After a few better sessions (longer responses, positive tone, check-ins attended), burnout gauge moves from red to amber
- Companion acknowledges it: "You seem like you've had a bit more space this week. What's been different?"

**Postconditions:**
- Burnout gauge updated in dashboard
- Relevant self-care content surfaced and offered (not pushed)
- Sarah has been heard — not diagnosed, not lectured
- Next periodic Zarit screen scheduled

---

## Use Case 5: Dashboard Orientation

**Actor:** Sarah (ongoing use, quick session)
**Goal:** Sarah opens Lantern with 2 minutes — not for a conversation, just to orient herself and see if anything needs attention.

**Preconditions:**
- Onboarding complete
- At least one week of check-in data

**Main Flow:**
1. Sarah opens the app and lands on the dashboard (not the companion chat).
2. She sees three panels at a glance:
   - **Patient stage:** "Stage 4 — Moderate" with a trend indicator (stable / progressing / watch)
   - **Caregiver burnout gauge:** Green / Amber / Red with a label ("Holding steady" / "Watch yourself" / "High stress")
   - **What's in front of you:** 1–3 action items or companion observations surfaced from recent sessions
3. She scans the action items:
   - "Based on recent check-ins, look out for afternoon confusion — this is common at Stage 4 and tends to intensify."
   - "You mentioned your mother's doctor appointment is next week. It may help to bring a list of recent behavioral changes — I can help you prepare that."
4. She taps one item and it opens in the companion chat with context loaded.
5. She reads what she needs and closes the app.

**Alternate Flows:**

**A1: Nothing has changed since her last visit**
- Dashboard is calm. No new flags. The message: "Everything looks stable. Keep doing what you're doing."
- No manufactured urgency

**A2: A high-priority item needs attention**
- Dashboard opens with a highlighted card at the top: "Lantern flagged something worth your attention — tap to see it."
- Pulls her into the companion chat if she chooses

**A3: She hasn't had a check-in in 3+ days**
- Dashboard shows a soft nudge: "It's been a few days since we've talked. Nothing alarming — just check in when you have a few minutes."
- Not guilt-inducing; no streak mechanics

**Postconditions:**
- Sarah has orientation in under 2 minutes
- Any flagged items acknowledged or opened
- No friction — she can leave without having to do anything

---

## Human Review Checklist

- [ ] All major user scenarios are covered
- [ ] Workflows reflect how real users (Sarah) actually behave
- [ ] Alternate flows capture realistic edge cases
- [ ] No technical blockers identified
- [ ] Happy path is clear and intuitive
- [ ] Workflows map to the two MVP pillars (Companion + Dashboard)
- [ ] Burnout use case is distinct from transition detection
- [ ] Coaching boundary (no diagnosis, no clinical advice) is respected throughout

---

*Drafted: June 14, 2026 | Phase 2 of the Hybrid Product Development Workflow*
*Next: Phase 3 — Product Requirements Document (PRD)*
