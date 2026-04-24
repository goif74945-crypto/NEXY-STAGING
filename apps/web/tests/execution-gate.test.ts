import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { evaluateExecutionGate } from '../packages/execution-gate.js';

describe('execution gate', () => {
  it('returns READY when all execution gates exist', () => {
    assert.deepEqual(
      evaluateExecutionGate({
        packageGateExists: true,
        tsconfigGateExists: true,
        testsGateExists: true,
      }),
      {
        status: 'READY',
        missing: [],
      },
    );
  });

  it('returns FREEZE and missing gates when any execution gate is absent', () => {
    assert.deepEqual(
      evaluateExecutionGate({
        packageGateExists: true,
        tsconfigGateExists: false,
        testsGateExists: false,
      }),
      {
        status: 'FREEZE',
        missing: ['tsconfig.json', 'tests'],
      },
    );
  });
});
