#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const FIXTURE_DIR = path.join(__dirname, 'golden-conversations');
const REQUIRED_TOP_FIELDS = ['id', 'description', 'conversation', 'expected_output'];
const REQUIRED_TURN_FIELDS = ['role', 'content'];
const VALID_ROLES = new Set(['user', 'assistant']);

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
}

let files;
try {
  files = fs.readdirSync(FIXTURE_DIR).filter(f => f.endsWith('.json'));
} catch (e) {
  console.error(`Cannot read fixture directory ${FIXTURE_DIR}: ${e.message}`);
  process.exit(1);
}

if (files.length === 0) {
  console.error(`No JSON fixture files found in ${FIXTURE_DIR}`);
  process.exit(1);
}

let passed = 0;
let failed = 0;

for (const file of files) {
  const filePath = path.join(FIXTURE_DIR, file);
  try {
    validateFixture(filePath);
    console.log(`  PASS  ${file}`);
    passed++;
  } catch (e) {
    console.error(`  FAIL  ${file}: ${e.message}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed out of ${files.length} fixtures`);
if (failed > 0) process.exit(1);
