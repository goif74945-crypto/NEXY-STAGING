import assert from 'node:assert/strict';
import test from 'node:test';

import { ValidationAppError } from '../src/lib/errors/app-errors';
import { assertBoolean, assertNonEmptyString, assertPositiveInteger } from '../src/lib/validation';

test('assertNonEmptyString returns trimmed string', () => {
  assert.equal(assertNonEmptyString('  hello  ', 'name'), 'hello');
});

test('assertNonEmptyString throws ValidationAppError on empty input', () => {
  assert.throws(() => assertNonEmptyString('   ', 'name'), ValidationAppError);
});

test('assertBoolean returns boolean values unchanged', () => {
  assert.equal(assertBoolean(true, 'flag'), true);
  assert.equal(assertBoolean(false, 'flag'), false);
});

test('assertPositiveInteger returns integer values', () => {
  assert.equal(assertPositiveInteger(5, 'count'), 5);
});

test('assertPositiveInteger throws on zero and decimals', () => {
  assert.throws(() => assertPositiveInteger(0, 'count'), ValidationAppError);
  assert.throws(() => assertPositiveInteger(1.5, 'count'), ValidationAppError);
});
