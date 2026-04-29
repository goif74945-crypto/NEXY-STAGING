import assert from 'node:assert/strict';
import test from 'node:test';

import { buildHttpError } from '../src/lib/http/errors';
import { evaluateReleasePolicy } from '../src/lib/http/release-policy';
import { parseMode } from '../src/lib/types/modes';
import { parseOutputClass } from '../src/lib/types/output-class';

test('parseMode accepts VIEW', () => {
  assert.equal(parseMode('VIEW'), 'VIEW');
});

test('parseOutputClass accepts FINAL', () => {
  assert.equal(parseOutputClass('FINAL'), 'FINAL');
});

test('buildHttpError returns deterministic http error descriptor', () => {
  const error = buildHttpError({
    code: 'NOT_FOUND',
    status: 404,
    message: 'Target was not found.',
    recoverable: false,
  });

  assert.deepEqual(error, {
    code: 'NOT_FOUND',
    status: 404,
    message: 'Target was not found.',
    recoverable: false,
  });
});

test('evaluateReleasePolicy allows verified FINAL output without open incident', () => {
  const decision = evaluateReleasePolicy({
    validated: true,
    verified: true,
    has_open_incident: false,
    output_class: 'FINAL',
  });

  assert.deepEqual(decision, {
    release_allowed: true,
    reason: 'ok',
  });
});
