/**
 * Behavioral tests for two fixes in the Phase 5 commit range:
 *  1. chat/route.ts stream loop: orphaned tool_call parts for server-side tools
 *     (log_patient_observation, record_lcws_rescreen) must NOT be forwarded to
 *     the client data stream. useChat crashes on tool_call with no matching
 *     tool_result.
 *  2. checkin/route.ts flag-clearing order: gauge_crossed_red_pending and
 *     level2_support_pending must be cleared AFTER generateText succeeds, not
 *     before — an LLM error would silently drop the pending flags otherwise.
 *
 * Run with: node eval/test-stream-and-flag-fix.mjs
 */

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

// ─── 1. Stream loop — orphaned tool_call suppression ────────────────────────
//
// The loop in chat/route.ts:
//   for await (const part of result.fullStream) {
//     if (part.type === 'text-delta') dataStream.write(formatDataStreamPart('text', part.textDelta));
//     else if (part.type === 'tool-call' && part.toolName === 'flag_crisis') { write(CRISIS_RESPONSE); return; }
//     else if (part.type === 'error') throw part.error;
//   }
//
// We exercise this loop with a controlled stream and assert observable writes.
console.log('\n[1] Stream loop — orphaned tool_call suppression');

async function* makeStream(parts) {
  for (const p of parts) yield p;
}

// Minimal replica of the route's stream-forwarding loop, accepting the loop's
// three decision boundaries as arguments so we exercise the logic, not text.
async function runStreamLoop({ stream, onTextWrite, onCrisisWrite, crisisResponse }) {
  for await (const part of stream) {
    if (part.type === 'text-delta') {
      onTextWrite(part.textDelta);
    } else if (part.type === 'tool-call' && part.toolName === 'flag_crisis') {
      onCrisisWrite(crisisResponse);
      return 'crisis';
    } else if (part.type === 'error') {
      throw part.error;
    }
    // All other types (including tool-call for server-side tools) → dropped intentionally.
  }
  return 'done';
}

{
  // A stream with a log_patient_observation tool-call should produce no writes.
  const textWrites = [];
  const crisisWrites = [];
  const stream = makeStream([
    { type: 'text-delta', textDelta: 'How are you?' },
    { type: 'tool-call', toolCallId: 'tc1', toolName: 'log_patient_observation', args: { sleep: { quality: 'poor' } } },
    { type: 'text-delta', textDelta: ' Tell me more.' },
  ]);

  const outcome = await runStreamLoop({
    stream,
    onTextWrite: (t) => textWrites.push(t),
    onCrisisWrite: (t) => crisisWrites.push(t),
    crisisResponse: 'CRISIS_RESPONSE',
  });

  assert(outcome === 'done', 'stream loop completes normally when only server-side tools appear');
  assert(textWrites.length === 2, 'text deltas before and after the tool-call are still forwarded');
  assert(textWrites.join('') === 'How are you? Tell me more.', 'text content is correct');
  assert(crisisWrites.length === 0, 'no crisis write triggered by log_patient_observation');
}

{
  // A stream with a record_lcws_rescreen tool-call should also produce no writes.
  const textWrites = [];
  const crisisWrites = [];
  const stream = makeStream([
    { type: 'tool-call', toolCallId: 'tc2', toolName: 'record_lcws_rescreen', args: { scores: {} } },
    { type: 'text-delta', textDelta: 'Thank you for sharing.' },
  ]);

  const outcome = await runStreamLoop({
    stream,
    onTextWrite: (t) => textWrites.push(t),
    onCrisisWrite: (t) => crisisWrites.push(t),
    crisisResponse: 'CRISIS_RESPONSE',
  });

  assert(outcome === 'done', 'stream loop completes normally for record_lcws_rescreen tool');
  assert(crisisWrites.length === 0, 'no write triggered by record_lcws_rescreen tool-call');
  assert(textWrites.length === 1 && textWrites[0] === 'Thank you for sharing.', 'text after rescreen tool-call is still forwarded');
}

{
  // flag_crisis tool-call must still write the crisis response and halt.
  const textWrites = [];
  const crisisWrites = [];
  const stream = makeStream([
    { type: 'text-delta', textDelta: 'I hear you' },
    { type: 'tool-call', toolCallId: 'tc3', toolName: 'flag_crisis', args: {} },
    { type: 'text-delta', textDelta: 'should not appear' },
  ]);

  const outcome = await runStreamLoop({
    stream,
    onTextWrite: (t) => textWrites.push(t),
    onCrisisWrite: (t) => crisisWrites.push(t),
    crisisResponse: '__CRISIS_RESPONSE__',
  });

  assert(outcome === 'crisis', 'flag_crisis tool-call causes the loop to return early');
  assert(crisisWrites.length === 1 && crisisWrites[0] === '__CRISIS_RESPONSE__', 'crisis response is written exactly once');
  assert(!textWrites.includes('should not appear'), 'text after flag_crisis is suppressed (early return)');
}

{
  // error type must propagate — the loop's only other observable branch.
  const sentinelError = new Error('sentinel-error');
  const stream = makeStream([
    { type: 'error', error: sentinelError },
  ]);

  let threw = null;
  try {
    await runStreamLoop({
      stream,
      onTextWrite: () => {},
      onCrisisWrite: () => {},
      crisisResponse: '',
    });
  } catch (e) {
    threw = e;
  }

  assert(threw === sentinelError, 'error parts are rethrown from the stream loop');
}

// ─── 2. Flag-clearing order — must run AFTER generateText, not before ────────
//
// The fix in checkin/route.ts moves the flag-clearing DB write to after the
// generateText call.  If generateText throws before the write, the flags
// remain set so the next request still surfaces them.  This test exercises
// the ordering contract with a simple state machine that mimics the handler's
// critical section.
console.log('\n[2] Flag-clearing order — flags must survive a generateText failure');

async function simulateCheckinHandler({ generateTextThrows, clearFlagsBefore }) {
  let flagsCleared = false;
  let generateTextCalled = false;
  let responseReturned = false;

  async function clearFlags() {
    flagsCleared = true;
  }

  async function generateText() {
    generateTextCalled = true;
    if (generateTextThrows) throw new Error('LLM timeout');
    return { text: 'Good morning! How did you sleep?' };
  }

  try {
    if (clearFlagsBefore) await clearFlags(); // old (buggy) order

    const { text } = await generateText();

    if (!clearFlagsBefore) await clearFlags(); // new (correct) order

    responseReturned = true;
    return { ok: true, text, flagsCleared, generateTextCalled };
  } catch {
    return { ok: false, flagsCleared, generateTextCalled };
  }
}

{
  // With the fix (clear after): a generateText failure leaves flags intact.
  const result = await simulateCheckinHandler({
    generateTextThrows: true,
    clearFlagsBefore: false,
  });

  assert(result.ok === false, 'handler fails when generateText throws');
  assert(result.generateTextCalled === true, 'generateText was called');
  assert(result.flagsCleared === false, 'flags NOT cleared when generateText throws (correct — they survive for retry)');
}

{
  // Old order (clear before): generateText failure silently drops the flags.
  const result = await simulateCheckinHandler({
    generateTextThrows: true,
    clearFlagsBefore: true,
  });

  assert(result.flagsCleared === true, 'flags WERE cleared before the error (old, buggy behavior preserved as a regression reference)');
}

{
  // With the fix: a successful generateText still clears flags exactly once.
  const result = await simulateCheckinHandler({
    generateTextThrows: false,
    clearFlagsBefore: false,
  });

  assert(result.ok === true, 'handler succeeds when generateText succeeds');
  assert(result.flagsCleared === true, 'flags cleared after successful generateText');
  assert(result.text === 'Good morning! How did you sleep?', 'response text is returned');
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} checks — ${passed} passed, ${failed} failed`);
if (errors.length > 0) {
  console.log('\nFailed:');
  errors.forEach((e) => console.log(`  - ${e}`));
  process.exit(1);
}
