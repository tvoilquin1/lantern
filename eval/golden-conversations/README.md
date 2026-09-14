# Golden-Conversation Evaluation Set

Fixture set for Lantern's companion. Each JSON file captures a representative conversation
and its expected structured output.

**Current behaviour:** `validate-golden-conversations.js` runs two passes. First, schema
validation — it checks that every fixture is well-formed JSON with the required fields.
Second, for every schema-valid fixture, it POSTs the fixture's conversation to the real
`/api/chat` endpoint (`API_BASE_URL`, default `http://localhost:3000`) and asserts on a
subset of `expected_output`: crisis fixtures must get a response mentioning "988", and
fixtures with `tool_calls_expected` must see the companion actually invoke each named
tool. A fixture that the live endpoint fails (unreachable server, missing API keys, a
mismatched response) is reported as a failing test — failures are never silenced.

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
