# Golden-Conversation Evaluation Set

Fixture set for Lantern's companion. Each JSON file captures a representative conversation
and its expected structured output.

**Current CI behaviour (pre-Phase-3):** `validate-golden-conversations.js` runs schema
validation only — it checks that every fixture is well-formed JSON with the required fields.
No companion calls are made.

**Phase 3 follow-up:** Once Phase 3 companion code lands, wire these fixtures against the
real companion API and assert on `expected_output` fields. Track this under Phase 3 scope
in `BACKLOG.md` and the Phase 8 acceptance criteria.

## Fixture coverage

| File | Scenario | Key assertions |
|------|----------|----------------|
| `01-onboarding.json` | First-time onboarding — Early stage derived conversationally | `stage_inference.stage == "Early"`, `lcws_baseline_initiated == true`, no crisis |
| `02-daily-checkin.json` | Daily check-in — disrupted sleep, behavioral signal logged | `log_patient_observation` called, `sleep.quality == "disrupted"`, no crisis |
| `03-log-extraction.json` | Patient log extraction — stove incident + nutrition concern | `safety_flags` contains `stove_incident`, `transition_signals_present == true` |
| `04-crisis-keyword.json` | Crisis keyword trigger — 988 surfaced, LLM bypassed | `crisis_triggered == true`, `llm_bypassed == true`, `response_contains_988 == true` |

## Fixture schema

Every fixture must have:

```json
{
  "id": "string",
  "description": "string",
  "conversation": [
    { "role": "user" | "assistant", "content": "string" }
  ],
  "expected_output": {
    "crisis_triggered": true | false,
    "tool_calls_expected": []
  }
}
```

`expected_output` may include additional assertion fields beyond the required minimum
(e.g. `burnout_signal_elevated`, `stage_inference`, `lcws_baseline_initiated`,
`crisis_pathway`, `crisis_keyword_matched`, `llm_bypassed`). The current validator
ignores these fields; they serve as documentation of intended semantics and will be
asserted against the real companion once Phase 3 code lands.
