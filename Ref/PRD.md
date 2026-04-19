# Product Requirements Document (PRD): Lantern

**Version:** 1.0.0
**Status:** Draft
**Author:** Senior Product Manager & Solutions Architect
**Last Updated:** March 2026
**Reviewers:** Engineering Lead, Clinical Advisor, UX Lead

---

## 1. Overview & Vision

**Problem Statement:**
Family caregivers of loved ones with Alzheimer's disease and related dementias (ADRD) face immense emotional, physical, and logistical burdens. They struggle to coordinate care across multiple family members, track unpredictable behavioral changes, find stage-appropriate resources, and maintain their own mental wellbeing.

**Product Purpose and Positioning:**
Lantern is a responsive web application designed to be the central "operating system" for dementia caregiving households. It shifts the burden of coordination, tracking, and education from the caregiver's memory to a shared, intelligent platform. 

**Success for this Version:**
Success for the MVP is defined by successful adoption within multi-caregiver households, demonstrated by daily active use of the Shift Handoff and Behavioral Log features, and completion of the Caregiver Wellbeing Check-In.

---

## 2. Target Users & Personas

**Primary User: Family Caregiver**
*   **The Primary Caregiver (e.g., Spouse or Co-habitating Adult Child):** Overwhelmed, time-poor, highly stressed. Needs fast logging, immediate answers, and emotional validation.
*   **The Secondary/Remote Family Member:** Wants to help but lacks daily context. Needs structured updates, clear tasks, and visibility into the primary caregiver's load.
*   **The Professional Respite Caregiver:** Paraprofessional stepping in for a few hours a week. Needs quick onboarding to the patient's current state, preferences, and recent behaviors.

**User Pain Points Addressed:**
*   "I have to repeat the same updates to my sister and brother every day."
*   "I don't know if this new aggressive behavior is a phase or a permanent decline."
*   "I feel completely isolated and don't know who to ask for help."

**Jobs-to-be-Done:**
*   Help me smoothly hand off care context so I can take a break without worrying.
*   Help me spot patterns in my loved one's behavior so I can prevent crises.
*   Tell me what to expect next so I can prepare emotionally and logistically.

---

## 3. Assumptions & Constraints

*   **Technical Assumptions:** Users have modern smartphones with standard web browsers.
*   **Clinical/Regulatory:** ⚠️ REVIEW NEEDED. This is NOT a medical device. It provides wellness tracking and education only. No diagnostic claims can be made.
*   **Data Privacy:** HIPAA-adjacent. While not strictly a covered entity in all jurisdictions, the app handles sensitive health data. Strict access controls (RLS) and encryption at rest are required.
*   **Platform Assumptions:** Responsive web app. Must feel native on mobile browsers (touch targets, no hover-only states).
*   **Vibe Coding Constraints:** Features involving Row Level Security (RLS) and real-time subscriptions require explicit human review before deployment to prevent data leaks.

---

## RECOMMENDED TECH STACK

This product is built using **vibe coding** (AI-assisted, iterative development). Modularity, strict separation of concerns, and zero hardcoding are non-negotiable.

### Frontend
*   **Framework:** Next.js (React) App Router. Highly documented, perfect for AI assistants.
*   **Styling:** Tailwind CSS. All design tokens must live in `tailwind.config.js` or `/styles/tokens.css`.
*   **Components:** shadcn/ui. Copy-paste components that live in the codebase.
*   **State Management:** Zustand or React Context.
*   **Rule:** All UI strings must live in `/constants/copy.ts`. All config data in `/data`.

### Backend / API
*   **Platform:** Supabase. Combines Postgres, Auth, Realtime, and Storage. Free tier (500MB DB, 1GB Storage, 50k MAU) is sufficient for MVP.
*   **Rule:** All Supabase calls must go through `/lib/supabase/` helpers.

### Authentication
*   **Provider:** Supabase Auth (Email/Password, Magic Link). 
*   **Rule:** Handles multi-user care groups natively via RLS policies.

### Real-Time / Notifications
*   **In-App:** Supabase Realtime.
*   **Email:** Resend (Free tier: 3,000 emails/month). Templates must be React Email components in `/emails`.
*   **Push:** Web Push API (Browser native).

### AI / LLM Features (v1.1)
*   **Provider:** OpenAI API (GPT-4o-mini) or Anthropic Claude API.
*   **Rule:** All prompt templates must live in `/data/prompts`.

### Voice-to-Text (v1.1)
*   **MVP:** Web Speech API.
*   **Production:** Whisper API (OpenAI).

### File / Media Storage
*   **Provider:** Supabase Storage.

### Hosting / Deployment
*   **Provider:** Vercel (Hobby tier).

### Geolocation / Resource Finder
*   **Provider:** Google Places API ($200/mo free credit).

### Analytics & Error Monitoring
*   **Analytics:** PostHog (Free tier: 1M events/month).
*   **Errors:** Sentry (Free tier: 5,000 errors/month).

---

## PROJECT FILE STRUCTURE CONVENTION

Every AI coding session must be initiated with this structure as context:

```text
/app                  → Next.js App Router pages and layouts
/components           → Reusable UI components (JSX/TSX, no inline styles)
/components/ui        → shadcn/ui base components
/features             → Feature modules (one folder per feature)
  /features/[feature] 
    /components       → Feature-specific UI components
    /hooks            → Feature-specific React hooks
    /utils            → Feature-specific utility functions
    /types.ts         → TypeScript types for this feature
    /constants.ts     → Feature-specific copy and config
/lib                  → Shared utilities, Supabase client, API helpers
/data                 → Static config data (stages, symptoms, etc.)
/constants            → Global copy, labels, error messages
/styles               → Global CSS, CSS custom properties/tokens
/hooks                → Shared React hooks
/types                → Global TypeScript types
/.env.local           → Environment variables
```

---

# SECTION 1: MVP (MUST-HAVE)

## 1. Stage Assessment
**Summary:** Simplified CDR-based onboarding questionnaire to determine the patient's current dementia stage.
**User Story:** As a primary caregiver, I want to assess my loved one's current stage so that the app can personalize content and symptom tracking.

| Given | When | Then |
| :--- | :--- | :--- |
| A new user signs up | They navigate to onboarding | They are presented with a 12-question assessment |
| The user completes the assessment | They submit the form | The system calculates the stage and saves it to the care group profile |

*   **Module Boundary:** Owns: Assessment UI, scoring logic. Reads: `/data/assessment.ts`. Exposes: Current stage ID to global state/DB.
*   **Separation of Concerns Checklist:**
    *   [x] No inline styles anywhere in JSX
    *   [x] No hardcoded copy, labels, or messages in components
    *   [x] No hardcoded config values in components
    *   [x] No API calls or Supabase queries inline in JSX or page files
    *   [x] No environment-specific values outside of .env files
    *   [x] All prompt templates (v1.1) in /data/prompts
*   **Supabase Tables:** `care_groups` (column: `current_stage_id`), `assessment_history`
*   **Required Files:** `/data/assessment.ts`
*   **Next.js Route:** `/onboarding/assessment`
*   **Build Sequence:** Requires Auth and Care Group DB setup (Milestone 0).
*   **Forward Compatibility Note:** Must save assessment history (not just overwrite current stage) to allow AI analysis of decline rate in v1.1. Must capture attributes for v1.1 peer matching.

## 2. Stage-Adaptive Content Hub
**Summary:** Curated educational articles organized by stage and theme.
**User Story:** As a caregiver, I want to read articles relevant to my loved one's current stage so I don't get overwhelmed by irrelevant information.

| Given | When | Then |
| :--- | :--- | :--- |
| A user visits the Hub | The app knows their stage | Content is filtered to match the current stage |

*   **Module Boundary:** Owns: Content rendering, filtering UI. Reads: User stage, `/data/content.ts`. Exposes: Read status.
*   **Separation of Concerns Checklist:** [x] Enforced. 🔀 **SEPARATION RISK:** Do not hardcode article content in JSX.
*   **Supabase Tables:** `user_content_reads` (to track read state)
*   **Required Files:** `/data/content.ts`
*   **Next.js Route:** `/learn`
*   **Forward Compatibility Note:** Content schema must support `type` (article, resilience_module, life_story) for v1.1 expansion.

## 3. Stage Transition Alerts
**Summary:** Proactive notifications when reports suggest approaching a transition.
**User Story:** As a caregiver, I want to be alerted if my logs indicate a stage transition so I can consult a doctor.

| Given | When | Then |
| :--- | :--- | :--- |
| A user logs symptoms | Thresholds in `/data/alerts.ts` are met | An in-app alert is generated |

*   **Module Boundary:** Owns: Alert evaluation logic, Alert UI. Reads: Observation logs, `/data/alerts.ts`. Exposes: Alert state.
*   **Separation of Concerns Checklist:** [x] Enforced.
*   **Supabase Tables:** `alerts`
*   **Required Files:** `/data/alerts.ts`, `/constants/copy.ts`
*   **Next.js Route:** `/dashboard` (rendered as a banner)
*   **Forward Compatibility Note:** Trigger logic must be abstracted so v1.1 AI Pattern Analysis can easily inject new alert triggers.

## 4. Multi-Caregiver Shift Handoff Notes
**Summary:** Structured shift note templates for care handoffs.
**User Story:** As a respite caregiver, I want to read a structured handoff note so I know exactly what happened before my shift.

| Given | When | Then |
| :--- | :--- | :--- |
| A caregiver ends a shift | They fill out a handoff note | Other care group members receive a real-time notification |

*   **Module Boundary:** Owns: Shift note CRUD, Handoff UI. Reads: `/data/shifts.ts`. Exposes: Shift note data.
*   **Separation of Concerns Checklist:** [x] Enforced. 🤖 **VIBE CODING CAUTION:** Real-time subscriptions must be cleaned up in `useEffect` returns.
*   **Supabase Tables:** `shift_notes`
*   **Required Files:** `/data/shifts.ts`
*   **Next.js Route:** `/shifts`
*   **Forward Compatibility Note:** Schema must support linking to `recurring_tasks` in v1.1.

## 5. Behavioral Observation Log
**Summary:** One-tap symptom entry with free-text annotation.
**User Story:** As a primary caregiver, I want to quickly log a behavioral incident so I have a record for the neurologist.

| Given | When | Then |
| :--- | :--- | :--- |
| A caregiver observes a behavior | They tap a symptom tag and add a note | The log is saved with a timestamp and context |

*   **Module Boundary:** Owns: Log entry UI, Log history view. Reads: `/data/symptoms.ts`. Exposes: Log data.
*   **Separation of Concerns Checklist:** [x] Enforced. 🔀 **SEPARATION RISK:** Symptom lists must not be hardcoded in the UI component.
*   **Supabase Tables:** `observation_logs` (columns: `symptom_id`, `notes`, `voice_input` (bool), `activity_context`)
*   **Required Files:** `/data/symptoms.ts`
*   **Next.js Route:** `/log`
*   **Forward Compatibility Note:** `voice_input` boolean and `activity_context` text field MUST be in the MVP schema to feed the v1.1 LLM prompt directly.

## 6. Family Coordination Feed
**Summary:** Shared update feed with structured post templates.
**User Story:** As a remote family member, I want to see a feed of updates so I feel connected to the daily care routine.

| Given | When | Then |
| :--- | :--- | :--- |
| Any care group member posts | They use a template (e.g., "Good Day") | It appears in the shared feed in real-time |

*   **Module Boundary:** Owns: Feed UI, Post creation. Reads: `/data/feedTemplates.ts`. Exposes: Feed data.
*   **Separation of Concerns Checklist:** [x] Enforced.
*   **Supabase Tables:** `feed_posts`
*   **Required Files:** `/data/feedTemplates.ts`
*   **Next.js Route:** `/feed`
*   **Forward Compatibility Note:** Feed data structure must be easily queryable by date range for the v1.1 Weekly Care Summary generation.

## 7. Caregiver Wellbeing Check-In
**Summary:** Weekly 3-question wellness check-in.
**User Story:** As a caregiver, I want to track my own wellbeing so I can recognize when I am approaching burnout.

| Given | When | Then |
| :--- | :--- | :--- |
| It is a new week | The user logs in | They are prompted with a 3-question check-in |

*   **Module Boundary:** Owns: Check-in UI, Trend visualization. Reads: `/data/wellbeing.ts`. Exposes: Wellbeing scores.
*   **Separation of Concerns Checklist:** [x] Enforced.
*   **Supabase Tables:** `wellbeing_logs`
*   **Required Files:** `/data/wellbeing.ts`
*   **Next.js Route:** `/wellbeing`
*   **Forward Compatibility Note:** Scoring logic must be designed to trigger v1.1 Resilience Module recommendations.

## 8. Resource Finder
**Summary:** Geolocated care resource directory.
**User Story:** As a caregiver, I want to find adult day programs near me so I can arrange for respite care.

| Given | When | Then |
| :--- | :--- | :--- |
| A user opens the finder | They allow location access | They see filtered resources on a map/list |

*   **Module Boundary:** Owns: Map UI, Search/Filter UI. Reads: `/data/resources.ts`, Google Places API. Exposes: Nothing.
*   **Separation of Concerns Checklist:** [x] Enforced.
*   **Supabase Tables:** None (relies on external API and static categories).
*   **Required Files:** `/data/resources.ts`
*   **Next.js Route:** `/resources`
*   **Forward Compatibility Note:** Must capture user's rough geolocation (zip code) to enable v1.1 local peer group matching.

---

# SECTION 2: SHOULD-HAVE (VERSION 1.1)

## 1. AI Behavioral Pattern Analysis
**Summary:** LLM pattern surfacing from observation logs.
*   **Dependencies:** MVP Behavioral Log (`observation_logs` table).
*   **Module Boundary:** Owns: AI Analysis trigger, Insights UI. Reads: `observation_logs`, `/data/prompts/patternAnalysis.ts`. Exposes: Insights.
*   **Separation of Concerns Checklist:** [x] Enforced. All prompts in `/data/prompts`. All LLM calls via `/lib/ai`.

## 2. Voice Logging
**Summary:** Voice-to-text observation entry.
*   **Dependencies:** MVP Behavioral Log UI.
*   **Module Boundary:** Owns: Audio capture, Whisper API call. Reads: Whisper API Key. Exposes: Transcribed text to Log UI.
*   **Separation of Concerns Checklist:** [x] Enforced.

## 3. Caregiver-to-Caregiver Peer Groups
**Summary:** Stage-matched async peer support.
*   **Dependencies:** MVP Stage Assessment, MVP Resource Finder (location).
*   **Module Boundary:** Owns: Group matching logic, Group Chat UI. Reads: User profiles. Exposes: Group memberships.
*   **Separation of Concerns Checklist:** [x] Enforced. Matching logic strictly in `/features/peerGroups/utils`.

## 4. Recurring Shift Task Checklists
**Summary:** Customizable checklists auto-populated in shift notes.
*   **Dependencies:** MVP Shift Handoff Notes.
*   **Module Boundary:** Owns: Checklist CRUD. Reads: `/data/shifts.ts`. Exposes: Task lists to Shift Notes.
*   **Separation of Concerns Checklist:** [x] Enforced.

## 5. Weekly Care Summary
**Summary:** Auto-generated summary from shift notes and logs.
*   **Dependencies:** MVP Shift Notes, MVP Feed, MVP Logs.
*   **Module Boundary:** Owns: Summary generation cron/trigger, Summary UI. Reads: `/data/prompts/weeklySummary.ts`. Exposes: Summary document.
*   **Separation of Concerns Checklist:** [x] Enforced. Rendering component receives data only — no generation logic in JSX.

## 6. Caregiver Resilience Modules
**Summary:** Self-paced content on stress, sleep, grief.
*   **Dependencies:** MVP Content Hub, MVP Wellbeing Check-In.
*   **Module Boundary:** Owns: Module progress tracking. Reads: `/data/resilienceModules.ts`. Exposes: Completion status.
*   **Separation of Concerns Checklist:** [x] Enforced. Recommendation trigger logic in `/features/wellbeing/utils`.

## 7. Life Story Module (Mosaic Integration)
**Summary:** Patient biographical profile with media.
*   **Dependencies:** Supabase Storage.
*   **Module Boundary:** Owns: Profile UI, Media Upload UI. Reads: `/data/lifeStory.ts`. Exposes: Shareable profile link.
*   **Separation of Concerns Checklist:** [x] Enforced. Media uploads through `/lib/storage` wrapper only.

---

## 5. Data Architecture

**Core Supabase Tables:**
*   `users` (id, email, role)
*   `care_groups` (id, patient_name, current_stage_id, join_code)
*   `user_care_groups` (user_id, care_group_id, role)
*   `observation_logs` (id, care_group_id, user_id, symptom_id, notes, voice_input, activity_context, created_at)
*   `shift_notes` (id, care_group_id, user_id, shift_type, content, created_at)
*   `wellbeing_logs` (id, user_id, score_data, created_at)

**Row Level Security (RLS) Policy Summary:**
🤖 **VIBE CODING CAUTION:** 
*   Users can only read/write data where `care_group_id` matches a group they belong to in `user_care_groups`.
*   Wellbeing logs are strictly private to the `user_id`.

**Lookup Data:**
All enum values (stages, symptoms, templates) must be seeded into the DB from `/data` files or referenced strictly via code constants. Never hardcoded in logic.

---

## 6. Non-Functional Requirements

*   **Performance:** Core Web Vitals passing. LCP < 2.5s.
*   **Accessibility:** WCAG 2.1 AA. High contrast, large touch targets, low cognitive load design.
*   **Responsive:** Mobile-first Tailwind implementation.
*   **Security:** RLS enforced on all tables. Environment variables for all secrets.
*   **Code Quality:** ESLint rules configured in Milestone 0 to reject inline styles and hardcoded strings.

---

## 7. Build Sequence & Sprint Scaffolding

| Milestone | Focus | Complexity | Vibe Coding Notes |
| :--- | :--- | :--- | :--- |
| **0. Scaffolding** | Next.js, Supabase, Auth, RLS, Folder Structure, ESLint, Constants bootstrap | High | ⚠️ Must be airtight before feature work. Human review required for RLS. |
| **1. MVP Core** | Stage Assessment, Content Hub, Wellbeing | Low | Highly modular. Safe for rapid AI generation. |
| **1. MVP Social** | Shift Notes, Feed, Observation Log | Medium | Requires careful state management and Realtime subscription cleanup. |
| **1. MVP External** | Resource Finder, Transition Alerts | Medium | API integrations require strict environment variable management. |
| **2. v1.1 AI** | Pattern Analysis, Voice Logging, Weekly Summary | High | 🔀 Strict separation of prompts from UI required. |
| **2. v1.1 Social** | Peer Groups, Resilience Modules, Life Story | Medium | Storage bucket policies require human review. |

---

## 8. Success Metrics & KPIs

*   **Activation:** % of users who complete the Stage Assessment within 24 hours.
*   **Engagement:** Average number of Observation Logs and Shift Notes created per care group per week.
*   **Outcome Proxies:** Week-over-week retention of the Wellbeing Check-In; % of users clicking out to Resource Finder links.

---

## 9. Dependencies & Risks

*   **Third-Party:** Supabase uptime, Google Places API billing limits.
*   **Clinical:** ⚠️ REVIEW NEEDED. Content Hub and Assessment logic must be reviewed by a gerontologist or dementia care specialist to ensure no medical advice is inadvertently given.
*   **Vibe Coding Risks:** 
    *   AI assistants bypassing `/constants` and hardcoding strings. Mitigation: Strict ESLint rules.
    *   AI assistants writing insecure RLS policies. Mitigation: Human review of all `.sql` migrations.

---

## 10. Future Considerations (Out of Scope)

*   Native iOS/Android applications (Capacitor/Expo wrapper planned for v2.0).
*   Direct integration with EHR/EMR systems (Epic, Cerner).
*   Telehealth booking directly within the app.
*   Financial/Legal document vault (requires higher compliance tier).
