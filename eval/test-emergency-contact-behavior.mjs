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

const { sendEmergencyContactOutreachEmail, buildEmailBody } = jiti(
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

// Normalize: strip SQL line comments, lowercase, collapse whitespace so
// commented-out statements cannot satisfy the assertions.
const normalizedSQL = migrationSQL
  .replace(/--[^\n]*/g, "")
  .toLowerCase()
  .replace(/\s+/g, " ")
  .trim();

assert(
  normalizedSQL.includes("alter table caregiver_state add column if not exists emergency_contact_name text"),
  "migration idempotently adds emergency_contact_name"
);
assert(
  normalizedSQL.includes("alter table caregiver_state add column if not exists emergency_contact_email text"),
  "migration idempotently adds emergency_contact_email"
);
assert(
  normalizedSQL.includes("alter table caregiver_state add column if not exists emergency_contact_phone text"),
  "migration idempotently adds emergency_contact_phone (storage only, no SMS sending)"
);
assert(
  normalizedSQL.includes(
    "alter table caregiver_state add column if not exists emergency_contact_relationship text"
  ),
  "migration idempotently adds emergency_contact_relationship"
);

// ─── 3. buildEmailBody — observable email content ─────────────────────────
console.log("\n[3] buildEmailBody — email content");

{
  const body = buildEmailBody({
    contactEmail: "sam@example.com",
    contactName: "Sam",
    relationship: "sibling",
    missedCheckinStreak: 7,
  });
  assert(typeof body.subject === "string" && body.subject.length > 0, "produces a non-empty subject");
  assert(body.text.includes("Sam"), "body addresses the named contact");
  assert(body.text.includes("sibling"), "body includes the relationship");
  assert(body.text.includes("7"), "body includes the missed-checkin streak count");
  assert(
    /not medical advice/i.test(body.text),
    "body includes the no-medical-advice disclaimer"
  );
  assert(
    /reach out/i.test(body.text),
    "body suggests the contact reach out to the caregiver"
  );
}

{
  const body = buildEmailBody({
    contactEmail: "anon@example.com",
    contactName: null,
    relationship: null,
    missedCheckinStreak: 3,
  });
  assert(!body.text.includes("null"), "anonymous body does not render the word 'null'");
  assert(body.text.includes("3"), "anonymous body includes the streak count");
}

// ─── 4. EMERGENCY_CONTACT_SCHEMA — validation behavior ────────────────────
console.log("\n[4] EMERGENCY_CONTACT_SCHEMA — zod validation");

const { EMERGENCY_CONTACT_SCHEMA } = jiti(path.join(PROJECT_ROOT, "app/api/onboard/route.ts"));

{
  const r = EMERGENCY_CONTACT_SCHEMA.safeParse({
    ready: true,
    skipped: true,
    name: null,
    email: null,
    phone: null,
    relationship: null,
  });
  assert(r.success, "schema accepts a skipped-contact response");
}

{
  const r = EMERGENCY_CONTACT_SCHEMA.safeParse({
    ready: true,
    skipped: false,
    name: "Sam",
    email: "sam@example.com",
    phone: "555-1234",
    relationship: "sibling",
  });
  assert(r.success, "schema accepts a complete contact with all fields");
  assert(r.data?.email === "sam@example.com", "schema preserves the email value");
}

{
  const r = EMERGENCY_CONTACT_SCHEMA.safeParse({
    ready: true,
    skipped: false,
    name: "Sam",
    email: "sam@example.com",
    phone: null,
    relationship: "sibling",
  });
  assert(r.success, "schema accepts a contact without phone (phone is optional)");
}

{
  const r = EMERGENCY_CONTACT_SCHEMA.safeParse({
    ready: false,
    skipped: false,
    name: null,
    email: null,
    phone: null,
    relationship: null,
  });
  assert(r.success, "schema accepts an in-progress response (ready:false)");
}

{
  const r = EMERGENCY_CONTACT_SCHEMA.safeParse({ ready: "yes", skipped: false });
  assert(!r.success, "schema rejects a non-boolean ready field");
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} checks — ${passed} passed, ${failed} failed`);
if (errors.length > 0) {
  console.log("\nFailed:");
  errors.forEach((e) => console.log(`  - ${e}`));
  process.exit(1);
}
