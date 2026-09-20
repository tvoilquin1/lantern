// All user-facing strings live here. No hardcoded strings in JSX.
// Populated as features are built.
export const copy = {
  appName: "Lantern",
  chatEmptyState: "Ask your Lantern companion anything about caregiving — this conversation is always here.",
  chatInputPlaceholder: "Type a message…",
  chatSendButton: "Send",
  chatSendingLabel: "Sending…",
  chatErrorMessage: "Something went wrong reaching your companion. Please try again.",
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
} as const;
