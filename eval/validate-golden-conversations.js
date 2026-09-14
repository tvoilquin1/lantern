#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const FIXTURE_DIR = path.join(__dirname, 'golden-conversations');
const REQUIRED_TOP_FIELDS = ['id', 'description', 'conversation', 'expected_output'];
const REQUIRED_TURN_FIELDS = ['role', 'content'];
const VALID_ROLES = new Set(['user', 'assistant']);

// The real /api/chat endpoint to validate fixtures against. Override with
// API_BASE_URL for CI or a non-default dev server port.
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

function validateFixture(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let fixture;
  try {
    fixture = JSON.parse(raw);
  } catch (e) {
    throw new Error(`JSON parse error: ${e.message}`);
  }

  for (const field of REQUIRED_TOP_FIELDS) {
    if (!(field in fixture)) throw new Error(`Missing required top-level field: "${field}"`);
  }

  if (typeof fixture.id !== 'string' || !fixture.id.trim()) {
    throw new Error('"id" must be a non-empty string');
  }
  if (typeof fixture.description !== 'string' || !fixture.description.trim()) {
    throw new Error('"description" must be a non-empty string');
  }

  if (!Array.isArray(fixture.conversation) || fixture.conversation.length === 0) {
    throw new Error('"conversation" must be a non-empty array');
  }
  for (const [i, turn] of fixture.conversation.entries()) {
    for (const field of REQUIRED_TURN_FIELDS) {
      if (!(field in turn)) {
        throw new Error(`conversation[${i}] missing required field: "${field}"`);
      }
    }
    if (!VALID_ROLES.has(turn.role)) {
      throw new Error(`conversation[${i}].role must be one of: ${[...VALID_ROLES].join(', ')} — got "${turn.role}"`);
    }
    if (typeof turn.content !== 'string' || !turn.content.trim()) {
      throw new Error(`conversation[${i}].content must be a non-empty string`);
    }
  }

  const eo = fixture.expected_output;
  if (typeof eo !== 'object' || eo === null || Array.isArray(eo)) {
    throw new Error('"expected_output" must be a plain object');
  }
  if (typeof eo.crisis_triggered !== 'boolean') {
    throw new Error('"expected_output.crisis_triggered" must be a boolean');
  }
  if (!Array.isArray(eo.tool_calls_expected)) {
    throw new Error('"expected_output.tool_calls_expected" must be an array');
  }

  // Validate tool_calls_expected entries have at minimum a "tool" field
  for (const [i, call] of eo.tool_calls_expected.entries()) {
    if (typeof call.tool !== 'string' || !call.tool.trim()) {
      throw new Error(`expected_output.tool_calls_expected[${i}].tool must be a non-empty string`);
    }
  }

  // Crisis-pathway fields: when crisis_triggered is true, crisis-specific fields should be present
  if (eo.crisis_triggered) {
    if (typeof eo.response_contains_988 !== 'boolean') {
      throw new Error('"expected_output.response_contains_988" must be a boolean when crisis_triggered is true');
    }
  }

  return fixture;
}

// Parses the Vercel AI SDK data stream protocol (one `<code>:<json>\n` part per line)
// into concatenated text output and any tool calls that were made.
// See: node_modules/@ai-sdk/ui-utils — text = '0', tool_call = '9', error = '3'.
function parseDataStream(rawText) {
  let fullText = '';
  const toolCalls = [];
  let errorMessage = null;

  for (const line of rawText.split('\n')) {
    if (!line.trim()) continue;
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) continue;

    const code = line.slice(0, separatorIndex);
    const jsonPart = line.slice(separatorIndex + 1);

    let value;
    try {
      value = JSON.parse(jsonPart);
    } catch {
      continue;
    }

    if (code === '0') {
      fullText += value;
    } else if (code === '9') {
      toolCalls.push({ tool: value.toolName, args: value.args });
    } else if (code === '3') {
      errorMessage = value;
    }
  }

  return { fullText, toolCalls, errorMessage };
}

async function validateAgainstLiveEndpoint(fixture) {
  const messages = fixture.conversation.map((turn) => ({ role: turn.role, content: turn.content }));
  const endpoint = `${API_BASE_URL}/api/chat`;

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
  } catch (e) {
    throw new Error(`Could not reach ${endpoint}: ${e.message}`);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`${endpoint} responded with ${response.status}: ${body.slice(0, 300)}`);
  }

  const rawText = await response.text();
  const { fullText, toolCalls, errorMessage } = parseDataStream(rawText);

  if (errorMessage) {
    throw new Error(`Companion stream reported an error: ${errorMessage}`);
  }

  const eo = fixture.expected_output;

  if (eo.crisis_triggered) {
    if (eo.response_contains_988 && !fullText.includes('988')) {
      throw new Error(
        `Expected the crisis response to mention "988", but got: ${JSON.stringify(fullText.slice(0, 200))}`,
      );
    }
  }

  for (const expectedCall of eo.tool_calls_expected || []) {
    const match = toolCalls.find((call) => call.tool === expectedCall.tool);
    if (!match) {
      const seen = toolCalls.map((call) => call.tool).join(', ') || '(none)';
      throw new Error(`Expected tool call "${expectedCall.tool}" was not made by the companion. Tool calls seen: ${seen}`);
    }
  }

  if (!eo.crisis_triggered && (!eo.tool_calls_expected || eo.tool_calls_expected.length === 0) && !fullText.trim()) {
    throw new Error('Companion returned an empty response');
  }
}

async function main() {
  let files;
  try {
    files = fs.readdirSync(FIXTURE_DIR).filter((f) => f.endsWith('.json'));
  } catch (e) {
    console.error(`Cannot read fixture directory ${FIXTURE_DIR}: ${e.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`No JSON fixture files found in ${FIXTURE_DIR}`);
    process.exit(1);
  }

  console.log('Schema validation:');
  let schemaPassed = 0;
  let schemaFailed = 0;
  const validFixtures = [];

  for (const file of files) {
    const filePath = path.join(FIXTURE_DIR, file);
    try {
      const fixture = validateFixture(filePath);
      console.log(`  PASS  ${file}`);
      schemaPassed++;
      validFixtures.push({ file, fixture });
    } catch (e) {
      console.error(`  FAIL  ${file}: ${e.message}`);
      schemaFailed++;
    }
  }

  console.log(`\n${schemaPassed} passed, ${schemaFailed} failed out of ${files.length} fixtures (schema)\n`);

  console.log(`Live endpoint validation (POST ${API_BASE_URL}/api/chat):`);
  let livePassed = 0;
  let liveFailed = 0;

  for (const { file, fixture } of validFixtures) {
    try {
      await validateAgainstLiveEndpoint(fixture);
      console.log(`  PASS  ${file}`);
      livePassed++;
    } catch (e) {
      console.error(`  FAIL  ${file}: ${e.message}`);
      liveFailed++;
    }
  }

  console.log(`\n${livePassed} passed, ${liveFailed} failed out of ${validFixtures.length} fixtures (live)`);

  if (schemaFailed > 0 || liveFailed > 0) {
    process.exit(1);
  }
}

main();
