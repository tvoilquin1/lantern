/**
 * Behavioral test for the Option B retrieval-failure handling in
 * app/api/chat/route.ts: a retrieve() rejection must never surface as a raw
 * 500, must never fall through to an ungrounded streamText call, and must log
 * the real underlying error server-side.
 *
 * Imports the real POST handler via jiti; retrieve() and streamText are
 * redirected to controllable stubs via jiti aliases so both paths are driven
 * through the actual route code without real network or DB calls.
 *
 * Run with: node eval/test-retrieval-failure-handling.mjs
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const _require = createRequire(import.meta.url);
const jitiFactory = _require(_require.resolve('jiti/lib/index.js', { paths: [PROJECT_ROOT] }));

const RETRIEVE_STUB = path.join(PROJECT_ROOT, 'eval/__stubs__/retrieve-stub.ts');
const AI_STUB = path.join(PROJECT_ROOT, 'eval/__stubs__/ai-stub.ts');
const ANTHROPIC_STUB = path.join(PROJECT_ROOT, 'eval/__stubs__/anthropic-stub.ts');

// More-specific aliases must appear before the generic '@' fallback so jiti
// applies the longest matching prefix first.
const jiti = jitiFactory(PROJECT_ROOT + '/', {
  alias: {
    '@/lib/retrieval/retrieve': RETRIEVE_STUB,
    'ai': AI_STUB,
    '@ai-sdk/anthropic': ANTHROPIC_STUB,
    '@': PROJECT_ROOT,
  },
  interopDefault: true,
});

// Load stubs before the route so jiti's module cache holds the same instances
// the route will receive when it resolves these aliased imports.
const retrieveStub = jiti(RETRIEVE_STUB);
const aiStub = jiti(AI_STUB);

// Load the real route handler. Its imports of retrieve, ai, and @ai-sdk/anthropic
// are redirected to the stubs above via the jiti alias configuration.
const { POST } = jiti(path.join(PROJECT_ROOT, 'app/api/chat/route.ts'));

const { copy } = jiti(path.join(PROJECT_ROOT, 'constants/copy.ts'));

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

function makeRequest(body) {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Parse AI SDK data stream format: lines like `0:"text content"\n` → plain text
function extractTextFromDataStream(raw) {
  return raw
    .split('\n')
    .filter((line) => line.startsWith('0:'))
    .map((line) => JSON.parse(line.slice(2)))
    .join('');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[1] Retrieval failure — real route streams the safe fallback message');

{
  const sentinelError = new Error(
    'Vault similarity search failed: relation "match_vault_chunks" does not exist',
  );
  retrieveStub.__setRetrieveBehavior('throw', sentinelError);
  aiStub.__resetStreamTextCallCount();

  let capturedErrorArg = null;
  const origConsoleError = console.error;
  console.error = (...args) => {
    capturedErrorArg = args[1]; // route logs: console.error("...", error)
  };

  const req = makeRequest({
    messages: [{ role: 'user', content: 'How do I manage sundowning behaviour?' }],
  });
  const response = await POST(req);
  console.error = origConsoleError;

  const streamedText = extractTextFromDataStream(await response.text());

  assert(
    streamedText === copy.chatRetrievalUnavailableMessage,
    'failure-path response body equals copy.chatRetrievalUnavailableMessage delivered through the real streaming response',
  );
  assert(
    capturedErrorArg === sentinelError,
    'the real underlying retrieval error is logged via console.error, not a generic message',
  );
  assert(
    aiStub.__getStreamTextCallCount() === 0,
    'streamText is never called (companion never answers ungrounded) when retrieval fails',
  );
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[2] Successful retrieval — real route streams model text, not the fallback');

{
  retrieveStub.__setRetrieveBehavior('success');
  aiStub.__resetStreamTextCallCount();

  const req = makeRequest({
    messages: [{ role: 'user', content: 'How do I manage sundowning behaviour?' }],
  });
  const response = await POST(req);

  const streamedText = extractTextFromDataStream(await response.text());

  assert(
    !streamedText.includes(copy.chatRetrievalUnavailableMessage),
    'success-path response body does not contain the retrieval-unavailable fallback message',
  );
  assert(
    aiStub.__getStreamTextCallCount() === 1,
    'streamText is called exactly once when retrieval succeeds',
  );
  assert(
    streamedText.includes(aiStub.MOCK_STREAM_TEXT_RESPONSE),
    'success-path response body contains the text yielded by the mock streamText',
  );
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} checks — ${passed} passed, ${failed} failed`);
if (errors.length > 0) {
  console.log('\nFailed:');
  errors.forEach((e) => console.log(`  - ${e}`));
  process.exit(1);
}
