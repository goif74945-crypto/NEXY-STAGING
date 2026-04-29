import assert from 'node:assert/strict';
import test from 'node:test';

import { createEntityId, createRequestId } from '../src/lib/utils/ids';

test('createRequestId returns deterministic lowercase normalized id', () => {
  assert.equal(createRequestId('req', 'Alpha 001'), 'req_alpha_001');
});

test('createEntityId returns deterministic lowercase normalized id', () => {
  assert.equal(createEntityId('run', 'RUN 001'), 'run_run_001');
});

test('createRequestId rejects empty prefix', () => {
  assert.throws(
    () => createRequestId('   ', 'Alpha 001'),
    /Request id prefix must be a non-empty string\./,
  );
});

test('createEntityId rejects empty value', () => {
  assert.throws(
    () => createEntityId('run', '   '),
    /Entity id value must be a non-empty string\./,
  );
});

test('repeated calls with same input produce same output', () => {
  const first = createRequestId('REQ', 'Alpha 001');
  const second = createRequestId('REQ', 'Alpha 001');

  assert.equal(first, second);
});

test('normalized output contains no spaces and no uppercase characters', () => {
  const requestId = createRequestId('REQ ID', 'Alpha 001');
  const entityId = createEntityId('RUN ID', 'RUN 001');

  assert.equal(requestId.includes(' '), false);
  assert.equal(entityId.includes(' '), false);
  assert.equal(/[A-Z]/.test(requestId), false);
  assert.equal(/[A-Z]/.test(entityId), false);
});

test('normalized output does not use uuid shape', () => {
  const requestId = createRequestId('req', 'Alpha 001');
  const entityId = createEntityId('run', 'RUN 001');

  assert.doesNotMatch(
    requestId,
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  );
  assert.doesNotMatch(entityId, /^[0-9a-f]{32}$/);
});
