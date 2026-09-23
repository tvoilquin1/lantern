/**
 * Emergency-contact outreach behavioral tests (Phase 5 follow-up) — exercise
 * public interfaces and assert observable state.
 * Run with: node eval/test-emergency-contact-behavior.mjs
 */
import { createRequire } from "module";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Resolve relative to this script's own location so the test runs correctly
// regardless of which worktree/checkout it lives in.
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const _require = createRequire(import.meta.url);
const jitiFactory = _require(_require.resolve("jiti/lib/index.js", { paths: [PROJECT_ROOT] }));
const jiti = jitiFactory(PROJECT_ROOT + "/", {
  alias: { "@": PROJECT_ROOT },
  interopDefault: true,
});

let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, label) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    errors.push(label);
    console.log(`  FAIL  ${label}`);
  }
}

// ─── 1. sendEmergencyContactOutreachEmail — skips gracefully without a key ──
console.log("\n[1] sendEmergencyContactOutreachEmail — skip contract");

const previousApiKey = process.env.RESEND_API_KEY;
delete process.env.RESEND_API_KEY;

const { sendEmergencyContactOutreachEmail } = jiti(
  path.join(PROJECT_ROOT, "lib/notifications/emergencyContactEmail.ts")
);

{
  let threw = false;
  let result;
  try {
    result = await sendEmergencyContactOutreachEmail({
      contactEmail: "contact@example.com",
      contactName: "Sam",
      relationship: "sibling",
      missedCheckinStreak: 5,
    });
  } catch {
    threw = true;
  }
  assert(!threw, "does not throw when RESEND_API_KEY is unset");
  assert(result?.sent === false, "reports sent:false when RESEND_API_KEY is unset");
  assert(result?.reason === "missing_api_key", "reason is missing_api_key when RESEND_API_KEY is unset");
}

if (previousApiKey !== undefined) {
  process.env.RESEND_API_KEY = previousApiKey;
}

// ─── 2. 0006 migration — idempotent emergency-contact columns ─────────────
console.log("\n[2] 0006_add_emergency_contact.sql — idempotent column adds");

const migrationSQL = readFileSync(
  path.join(PROJECT_ROOT, "supabase/migrations/0006_add_emergency_contact.sql"),
  "utf-8"
);

assert(
  /alter table caregiver_state add column if not exists emergency_contact_name text/.test(migrationSQL),
  "migration idempotently adds emergency_contact_name"
);
assert(
  /alter table caregiver_state add column if not exists emergency_contact_email text/.test(migrationSQL),
  "migration idempotently adds emergency_contact_email"
);
assert(
  /alter table caregiver_state add column if not exists emergency_contact_phone text/.test(migrationSQL),
  "migration idempotently adds emergency_contact_phone (storage only, no SMS sending)"
);
assert(
  /alter table caregiver_state add column if not exists emergency_contact_relationship text/.test(
    migrationSQL
  ),
  "migration idempotently adds emergency_contact_relationship"
);

// ─── 3. Cron route — sends exactly once, skips gracefully with no contact ──
console.log("\n[3] daily-checkin cron — outreach wiring");

const cronRouteSource = readFileSync(
  path.join(PROJECT_ROOT, "app/api/cron/daily-checkin/route.ts"),
  "utf-8"
);

assert(
  /import { sendEmergencyContactOutreachEmail } from ["']@\/lib\/notifications\/emergencyContactEmail["']/.test(
    cronRouteSource
  ),
  "cron route imports sendEmergencyContactOutreachEmail"
);
assert(
  /state\.emergency_contact_outreach_triggered_at == null/.test(cronRouteSource),
  "cron route still guards outreach on emergency_contact_outreach_triggered_at (fires exactly once per streak)"
);
assert(
  /if \(state\.emergency_contact_email\)/.test(cronRouteSource),
  "cron route branches on emergency_contact_email presence before sending"
);
assert(
  /emergency_contact_outreach_triggered_at: new Date\(\)\.toISOString\(\)/.test(cronRouteSource),
  "cron route still records the trigger timestamp regardless of whether a contact is on file"
);

// ─── 4. Onboarding route — captures or allows skipping the contact ────────
console.log("\n[4] onboard route — emergency-contact capture step");

const onboardRouteSource = readFileSync(
  path.join(PROJECT_ROOT, "app/api/onboard/route.ts"),
  "utf-8"
);

assert(
  /'staging' \| 'lcws' \| 'emergency_contact' \| 'complete'/.test(onboardRouteSource),
  "OnboardingStep includes emergency_contact between lcws and complete"
);
assert(
  /EMERGENCY_CONTACT_SCHEMA = z\.object/.test(onboardRouteSource),
  "onboard route defines EMERGENCY_CONTACT_SCHEMA"
);
assert(
  /z\.string\(\)\.trim\(\)\.email\(\)\.safeParse/.test(onboardRouteSource),
  "onboard route validates the captured email with zod before persisting"
);
assert(
  /object\.ready && object\.skipped/.test(onboardRouteSource),
  "onboard route allows the caregiver to skip without breaking onboarding"
);
assert(
  /emergency_contact_name: object\.name/.test(onboardRouteSource) &&
    /emergency_contact_email: emailResult\.data/.test(onboardRouteSource) &&
    /emergency_contact_phone: object\.phone/.test(onboardRouteSource) &&
    /emergency_contact_relationship: object\.relationship/.test(onboardRouteSource),
  "onboard route persists name, validated email, phone, and relationship to caregiver_state"
);

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} checks — ${passed} passed, ${failed} failed`);
if (errors.length > 0) {
  console.log("\nFailed:");
  errors.forEach((e) => console.log(`  - ${e}`));
  process.exit(1);
}
