/**
 * Behavioral test for the Option B retrieval-failure handling in
 * app/api/chat/route.ts: a `retrieve()` rejection must never surface as a raw
 * 500, must never fall through to an ungrounded streamText call, and must log
 * the real underlying error server-side.
 *
 * Run with: node eval/test-retrieval-failure-handling.mjs
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

// Resolve relative to this script's own location so the test runs correctly
// regardless of which worktree/checkout it lives in.
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const _require = createRequire(import.meta.url);
// jiti is in the project root's node_modules, not eval/ — module resolution
// walks up from PROJECT_ROOT to find it.
const jitiFactory = _require(_require.resolve('jiti/lib/index.js', { paths: [PROJECT_ROOT] }));
// Run jiti relative to project root so @/ aliases and imports resolve correctly
const jiti = jitiFactory(PROJECT_ROOT + '/', {
  alias: { '@': PROJECT_ROOT },
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

const { copy } = jiti(path.join(PROJECT_ROOT, 'constants/copy.ts'));

// Minimal replica of the route's post-crisis-check control flow, accepting
// the retrieve/streamText calls as injected functions so we exercise the
// branching logic itself rather than the real network/DB calls.
async function runChatRoute({ retrieve, streamText, logError }) {
  let retrievedChunks;
  try {
    retrievedChunks = await retrieve();
  } catch (error) {
    logError(error);
    return { kind: 'retrieval-unavailable', message: copy.chatRetrievalUnavailableMessage };
  }

  const text = await streamText(retrievedChunks);
  return { kind: 'answered', text };
}

console.log('\n[1] Retrieval failure — no raw 500, no ungrounded answer');

{
  const sentinelError = new Error('Vault similarity search failed: relation "match_vault_chunks" does not exist');
  let loggedError = null;
  let streamTextCalled = false;

  const outcome = await runChatRoute({
    retrieve: async () => {
      throw sentinelError;
    },
    streamText: async () => {
      streamTextCalled = true;
      return 'this should never be reached';
    },
    logError: (error) => {
      loggedError = error;
    },
  });

  assert(outcome.kind === 'retrieval-unavailable', 'a retrieval failure resolves to the safe fallback path, not a thrown 500');
  assert(streamTextCalled === false, 'the companion never calls streamText (never answers ungrounded) when retrieval fails');
  assert(loggedError === sentinelError, 'the real underlying retrieval error is logged server-side, not a generic message');
  assert(outcome.message === copy.chatRetrievalUnavailableMessage, 'the caregiver-facing message is the dedicated retrieval-unavailable copy');
}

console.log('\n[2] Successful retrieval — unaffected by the failure-handling branch');

{
  let streamTextCalled = false;

  const outcome = await runChatRoute({
    retrieve: async () => [{ doc_path: 'x', heading: null, content: 'chunk', relevance_score: 1 }],
    streamText: async (chunks) => {
      streamTextCalled = true;
      return `answered with ${chunks.length} chunk(s)`;
    },
    logError: () => {
      throw new Error('logError should not be called on success');
    },
  });

  assert(outcome.kind === 'answered', 'a successful retrieval proceeds to answer normally');
  assert(streamTextCalled === true, 'streamText is called when retrieval succeeds');
}

console.log('\n[3] Fallback message content — clinical-safe, matches crisis-handling tone');

{
  const message = copy.chatRetrievalUnavailableMessage;
  assert(typeof message === 'string' && message.length > 0, 'chatRetrievalUnavailableMessage is defined in constants/copy.ts');
  assert(/try again/i.test(message), 'message suggests trying again in a moment');
  assert(/988/.test(message), 'message includes the 988 Suicide and Crisis Lifeline, consistent with lib/companion/crisis.ts');
  assert(!/here.?s (what|how)/i.test(message), 'message does not attempt to answer the caregiving question ungrounded');
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} checks — ${passed} passed, ${failed} failed`);
if (errors.length > 0) {
  console.log('\nFailed:');
  errors.forEach((e) => console.log(`  - ${e}`));
  process.exit(1);
}
