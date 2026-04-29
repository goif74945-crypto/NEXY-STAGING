import assert from 'node:assert/strict';
import test from 'node:test';

import { buildTextDiff } from '../src/lib/utils/text-diff';
import { buildValidationFailure, buildValidationSuccess } from '../src/lib/validation';
import { evaluateChecklist } from '../src/lib/verify/checklist';

test('buildValidationSuccess returns deterministic success result', () => {
  const result = buildValidationSuccess();

  assert.deepEqual(result, {
    valid: true,
    issues: [],
  });
});

test('buildValidationFailure returns deterministic failure result', () => {
  const result = buildValidationFailure([
    {
      path: ['root', 'field'],
      message: 'Missing required field.',
      code: 'missing_required_field',
    },
  ]);

  assert.deepEqual(result, {
    valid: false,
    issues: [
      {
        path: ['root', 'field'],
        message: 'Missing required field.',
        code: 'missing_required_field',
      },
    ],
  });
});

test('evaluateChecklist returns failed ids when one item fails', () => {
  const result = evaluateChecklist([
    {
      id: 'schema',
      label: 'Schema is valid',
      passed: true,
    },
    {
      id: 'release-gate',
      label: 'Release gate is satisfied',
      passed: false,
    },
  ]);

  assert.deepEqual(result, {
    items: [
      {
        id: 'schema',
        label: 'Schema is valid',
        passed: true,
      },
      {
        id: 'release-gate',
        label: 'Release gate is satisfied',
        passed: false,
      },
    ],
    all_passed: false,
    failed_ids: ['release-gate'],
  });
});

test('buildTextDiff returns deterministic text diff result', () => {
  const result = buildTextDiff('alpha', 'alpine');

  assert.deepEqual(result, {
    same: false,
    left_length: 5,
    right_length: 6,
    first_difference_index: 2,
  });
});
