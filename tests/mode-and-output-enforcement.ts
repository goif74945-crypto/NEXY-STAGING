import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateModeAccess } from '../src/lib/auth/mode-access';
import { formatOutputClass } from '../src/lib/ui/format';
import { parseOutputClass } from '../src/lib/types/output-class';

test('evaluateModeAccess allows owner to forge', () => {
  const decision = evaluateModeAccess({
    mode: 'FORGE',
    role: 'OWNER',
  });

  assert.equal(decision.allowed, true);
  assert.equal(decision.reason, 'allowed');
});

test('evaluateModeAccess blocks viewer from run mode', () => {
  const decision = evaluateModeAccess({
    mode: 'RUN',
    role: 'VIEWER',
  });

  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, 'insufficient_role');
});

test('formatOutputClass formats canonical output class values', () => {
  assert.equal(formatOutputClass('RAW'), 'RAW');
  assert.equal(formatOutputClass('CLEAN'), 'CLEAN');
  assert.equal(formatOutputClass('FINAL'), 'FINAL');
  assert.equal(formatOutputClass('REJECT'), 'REJECT');
});

test('parseOutputClass accepts FINAL', () => {
  assert.equal(parseOutputClass('FINAL'), 'FINAL');
});

test('parseOutputClass rejects invalid output class values', () => {
  assert.throws(() => parseOutputClass('verified'));
});
