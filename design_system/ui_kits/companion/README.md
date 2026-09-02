# Companion app — UI kit

Three screens from the Lantern MVP, recreated from the `1a Lamplight` direction in
`Lantern UI Explorations.dc.html` (the origin design in this project).

| Screen | File | Notes |
|---|---|---|
| Conversation (home) | `Conversation.jsx` | The app opens here. Daily check-in in progress, with visible log extraction and suggestion chips. The dashboard is reached from the `Today ›` chip in the header. |
| Today (dashboard) | `Dashboard.jsx` | Answers the three questions in fixed order: where is the patient, where am I, what's in front of me. Tapping the patient card opens the transition brief. |
| Transition brief | `TransitionBrief.jsx` | Stage-transition detection, framed as "something to know". Evidence → clinical framing → three actions → a quiet way out. |

`PhoneFrame.jsx` is the 390×812 device shell — layout only, no status bar and no mock clock.

## Interactions wired
- Header chip → dashboard; Lantern mark / composer → back to conversation.
- Patient card → transition brief; back arrow, primary CTA and "Not now" → return.
- Suggestion chips post the caregiver's reply into the thread.

## Deliberately absent
No tab bar (the companion is home, not one of four peers), no notification badges, no streak or
completion metrics, no red alert state. See `../../readme.md` → Product principles.
