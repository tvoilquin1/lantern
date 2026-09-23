import { NextResponse } from "next/server";
import { createSupabaseRestClient } from "@/lib/supabase/rest-client";
import {
  MISSED_CHECKIN_ESCALATION_DAYS,
  computeMissedCheckinStreak,
} from "@/lib/companion/burnout";
import { sendEmergencyContactOutreachEmail } from "@/lib/notifications/emergencyContactEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SessionRow = { id: string; status: string; kind: string; scheduled_for: string };
type CaregiverStateRow = {
  id: string;
  missed_checkin_streak: number;
  emergency_contact_outreach_triggered_at: string | null;
  emergency_contact_name: string | null;
  emergency_contact_email: string | null;
  emergency_contact_relationship: string | null;
};

/**
 * Vercel cron target (see vercel.json) — writes a pending daily check-in
 * record to `sessions` each morning. The app shows it as a waiting message
 * next time the caregiver opens /checkin (Ref/phase-3-prd.md §P0-3 notes:
 * "a Vercel cron writes a pending check-in record; the app shows it as a
 * waiting message when the caregiver opens the app" — no push notification).
 *
 * MVP default check-in time is a literal 8am UTC (see vercel.json); timezone-
 * aware scheduling is P1 (P1-2), not built here.
 */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const isDeployed = process.env.VERCEL_ENV != null || process.env.NODE_ENV === "production";
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else if (isDeployed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const scheduledFor = new Date().toISOString().slice(0, 10);
  const supabase = createSupabaseRestClient();

  const { data: existing, error: selectError } = await supabase
    .from<SessionRow>("sessions")
    .eq("kind", "daily_checkin")
    .eq("scheduled_for", scheduledFor)
    .select("id");

  if (selectError) {
    console.error("[cron/daily-checkin] failed to check for existing session", selectError);
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  let status: "already_scheduled" | "scheduled" = "already_scheduled";
  let sessionId: string | null = existing?.[0]?.id ?? null;

  if (!existing || existing.length === 0) {
    const { data: inserted, error: insertError } = await supabase
      .from<SessionRow>("sessions")
      .insert({
        status: "pending",
        kind: "daily_checkin",
        scheduled_for: scheduledFor,
      });

    if (insertError) {
      // The partial unique index (sessions_daily_checkin_once_per_day) can reject
      // a duplicate insert from a near-simultaneous cron retry — treat that as success.
      if (insertError.code !== "23505") {
        console.error("[cron/daily-checkin] failed to write pending check-in session", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    } else {
      status = "scheduled";
      sessionId = inserted?.[0]?.id ?? null;
    }
  }

  await updateMissedCheckinStreak(supabase, scheduledFor);

  return NextResponse.json({ status, scheduledFor, sessionId });
}

/**
 * Missed-check-in tracking for the Level-2 human-escalation path
 * (Ref/phase-3-prd.md Feature 4): 5+ consecutive missed check-ins triggers
 * emergency-contact outreach — a real email via Resend to the
 * caregiver-designated contact (0006_add_emergency_contact.sql), captured
 * during onboarding. The outreach fires exactly once per streak, guarded by
 * emergency_contact_outreach_triggered_at; when no contact is on file the
 * timestamp still records the trigger, but the send is skipped.
 */
async function updateMissedCheckinStreak(
  supabase: ReturnType<typeof createSupabaseRestClient>,
  scheduledFor: string
) {
  const { data: allCheckins, error: checkinsError } = await supabase
    .from<SessionRow>("sessions")
    .eq("kind", "daily_checkin")
    .select("id,status,kind,scheduled_for");

  const { data: states, error: stateError } = await supabase
    .from<CaregiverStateRow>("caregiver_state")
    .select(
      "id,missed_checkin_streak,emergency_contact_outreach_triggered_at,emergency_contact_name,emergency_contact_email,emergency_contact_relationship"
    );

  if (checkinsError || stateError || !states || states.length === 0) {
    if (checkinsError)
      console.error("[cron/daily-checkin] failed to load session history", checkinsError);
    if (stateError)
      console.error("[cron/daily-checkin] failed to load caregiver_state", stateError);
    return;
  }

  const streak = computeMissedCheckinStreak(allCheckins ?? [], scheduledFor);
  const state = states[0]!;

  const shouldTriggerOutreach =
    streak >= MISSED_CHECKIN_ESCALATION_DAYS &&
    state.emergency_contact_outreach_triggered_at == null;

  if (shouldTriggerOutreach) {
    if (state.emergency_contact_email) {
      const result = await sendEmergencyContactOutreachEmail({
        contactEmail: state.emergency_contact_email,
        contactName: state.emergency_contact_name,
        relationship: state.emergency_contact_relationship,
        missedCheckinStreak: streak,
      });
      if (!result.sent) {
        console.warn("[burnout] emergency contact outreach email not sent", {
          reason: result.reason,
          caregiverStateId: state.id,
        });
      }
    } else {
      console.warn(
        "[burnout] emergency contact outreach triggered — no emergency contact on file; recording only",
        { missedCheckinStreak: streak, caregiverStateId: state.id }
      );
    }
  }

  await supabase
    .from<CaregiverStateRow>("caregiver_state")
    .eq("id", state.id)
    .update({
      missed_checkin_streak: streak,
      ...(shouldTriggerOutreach
        ? { emergency_contact_outreach_triggered_at: new Date().toISOString() }
        : {}),
    });
}
