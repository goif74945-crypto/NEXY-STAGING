import assert from 'node:assert/strict';
import test from 'node:test';

import { createEntityId, createRequestId } from '../src/lib/utils/ids';
import { makeEnvelope } from '../src/lib/http/envelope';
import { FAILURE_MAP } from '../src/lib/errors/failure-map';

test('createRequestId prefixes generated ids', () => {
  const id = createRequestId('pack1');

  assert.match(id, /^pack1_[a-f0-9]+$/);
});

test('createEntityId prefixes generated ids', () => {
  const id = createEntityId('run');

  assert.match(id, /^run_[a-f0-9]+$/);
});

test('makeEnvelope returns normalized payload shape', () => {
  const result = makeEnvelope({
    status: 'OK',
    requestId: 'req_1',
    data: { ok: true },
  });

  assert.deepEqual(result, {
    status: 'OK',
    requestId: 'req_1',
    data: { ok: true },
    error: null,
  });
});

test('failure map keeps internal error retryable', () => {
  assert.equal(FAILURE_MAP.INTERNAL_ERROR.httpStatus, 500);
  assert.equal(FAILURE_MAP.INTERNAL_ERROR.retryable, true);
});
