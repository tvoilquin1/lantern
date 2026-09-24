// All user-facing strings live here. No hardcoded strings in JSX.
// Populated as features are built.
export const copy = {
  appName: "Lantern",
  chatEmptyState: "Ask your Lantern companion anything about caregiving — this conversation is always here.",
  chatInputPlaceholder: "Type a message…",
  chatSendButton: "Send",
  chatSendingLabel: "Sending…",
  chatErrorMessage: "Something went wrong reaching your companion. Please try again.",
  chatRetrievalUnavailableMessage:
    "I'm having trouble reaching my reference material right now, so I don't want to guess at something this important. Please try again in a moment. If this feels urgent or you're in crisis, the 988 Suicide and Crisis Lifeline is available 24/7 — call or text 988.",
  onboardingCompleteMessage:
    "Onboarding is already complete — head back to the main conversation to keep talking with your Lantern companion.",
  checkinCompanionName: "Lantern",
  checkinScheduleNote: "Check-ins each morning · adjustable",
  checkinTodayPill: "Today",
  checkinPrivacyReassurance: "Nothing here goes to anyone else.",
  checkinLoadingState: "Getting things ready…",
  checkinNothingScheduled: "Nothing waiting for you right now — I'll check in again tomorrow morning.",
  checkinAlreadyDone: "Today's check-in is done. I'll be back tomorrow morning.",
  checkinInputPlaceholder: "Message…",
  checkinSendingLabel: "Sending…",
  checkinErrorMessage: "Something went wrong reaching your companion. Please try again.",
  checkinQuickReplies: [
    { title: "Pretty good night", detail: "Nothing out of the ordinary" },
    { title: "Rough night", detail: "Up more than usual, or unsettled" },
    { title: "About the same", detail: "No real change either way" },
  ],
  checkinDoneButtonLabel: "Done for today",
  checkinEndingLabel: "Wrapping up…",
  checkinEndedMessage: "Thanks for checking in. I'll see you tomorrow morning.",

  // Gauge (Phase 5) — plain language over bare scores; color follows the word.
  gaugeLabelGreen: "Steady",
  gaugeLabelAmber: "Feeling the strain",
  gaugeLabelRed: "Under real pressure",
  gaugeSupportingGreen: "Things seem manageable right now.",
  gaugeSupportingAmber: "It's been a harder stretch lately.",
  gaugeSupportingRed: "This has been weighing on you for a while now.",
  gaugeNoDataMessage: "Nothing to show yet — this fills in once onboarding is complete.",
  gaugeLevel2Message:
    "You've mentioned feeling overwhelmed for a few days in a row now. That's worth more than what I can offer here — would it help to see some human support options?",
  gaugeCrossedToRedAcknowledgment:
    "I want to name that things have felt heavier lately. I'm glad you're here.",

  // Gauge preview (Phase 5 dev scaffold only — not the Phase 6 dashboard)
  gaugePreviewTitle: "Gauge preview",
  gaugePreviewSubtitle: "Internal scaffold for Phase 5 — the caregiver-facing dashboard is Phase 6.",
  gaugePreviewHistoryHeading: "Recent history",
  gaugePreviewLoading: "Loading…",
  gaugePreviewMissedStreakLabel: "Missed check-in streak",
  gaugePreviewErrorMessage: "Couldn't load gauge state.",
} as const;
