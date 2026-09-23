import { Resend } from "resend";

// Placeholder sender — swap for a Resend-verified domain/address in
// production via RESEND_FROM_EMAIL. Resend rejects sends from an unverified
// domain, so this default only works once that domain is verified in the
// Resend dashboard.
const DEFAULT_FROM_EMAIL = "Lantern <notifications@lantern.app>";

export type EmergencyContactOutreachInput = {
  contactEmail: string;
  contactName: string | null;
  relationship: string | null;
  missedCheckinStreak: number;
};

export type EmergencyContactOutreachResult = { sent: true } | { sent: false; reason: string };

function buildEmailBody(input: EmergencyContactOutreachInput): { subject: string; text: string } {
  const greeting = input.contactName ? `Hi ${input.contactName},` : "Hello,";
  const relationshipNote = input.relationship
    ? ` (you're listed as their ${input.relationship})`
    : "";

  const subject = "A courtesy notice from Lantern";
  const text = [
    greeting,
    "",
    `You're listed as an emergency contact${relationshipNote} for someone using Lantern, an app that supports family caregivers of people with dementia. They haven't checked in for ${input.missedCheckinStreak} days in a row.`,
    "",
    "This is a courtesy notification only — it is not medical advice, and it is not a report of an emergency. It simply means Lantern hasn't heard from them through the app recently.",
    "",
    "If you're able to, it might help to reach out and see how they're doing.",
    "",
    "— Lantern",
  ].join("\n");

  return { subject, text };
}

/**
 * Fires once per missed-check-in streak (guarded by the caller via
 * caregiver_state.emergency_contact_outreach_triggered_at). Skips gracefully
 * — never throws — when RESEND_API_KEY is unset or the send fails, so a
 * notification-provider outage never breaks the cron.
 */
export async function sendEmergencyContactOutreachEmail(
  input: EmergencyContactOutreachInput
): Promise<EmergencyContactOutreachResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[notifications] RESEND_API_KEY not set — skipping emergency contact outreach email"
    );
    return { sent: false, reason: "missing_api_key" };
  }

  const { subject, text } = buildEmailBody(input);
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: input.contactEmail,
      subject,
      text,
    });

    if (error) {
      console.error("[notifications] failed to send emergency contact email", error);
      return { sent: false, reason: error.message };
    }

    return { sent: true };
  } catch (error) {
    console.error("[notifications] emergency contact email send threw", error);
    return { sent: false, reason: error instanceof Error ? error.message : "unknown_error" };
  }
}
