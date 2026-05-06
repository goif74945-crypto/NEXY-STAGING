import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAuthFixtureNowEpochMs,
  getCurrentSessionFixture,
  listSessionFixtures,
} from '../src/lib/auth/session';
import { AppError } from '../src/lib/errors/app-errors';
import { rejectClientRunCreation } from '../src/lib/repositories/run-repository';
import {
  freezeRunWithAuthority,
  killRunWithAuthority,
  unfreezeRunWithAuthority,
} from '../src/lib/run/state-control';
import { assertRunTransitionAllowed } from '../src/lib/run/state-machine';

const OWNER_SESSION = getCurrentSessionFixture();

const OPERATOR_SESSION = listSessionFixtures().find(
  (session) => session.role === 'OPERATOR',
);

if (OPERATOR_SESSION === undefined) {
  throw new Error('Operator fixture session is required.');
}

test('freeze run_001 from stable to freeze with audit', () => {
  const result = freezeRunWithAuthority({
    run_id: 'run_001',
    session: OWNER_SESSION,
    now_epoch_ms: getAuthFixtureNowEpochMs(),
    actor_id: OWNER_SESSION.user_id,
    authority_source: 'LAW',
    reason_code: 'LAW_FREEZE',
    controlled_at_epoch_ms: 1_700_000_100_000,
  });

  assert.equal(result.run.run_id, 'run_001');
  assert.equal(result.run.status, 'freeze');
  assert.equal(result.run.freeze_reason, 'LAW_FREEZE');
  assert.equal(result.audit.action, 'run_freeze');
  assert.equal(result.audit.previous_status, 'stable');
  assert.equal(result.audit.next_status, 'freeze');
});

test('unfreeze from freeze returns verifying only', () => {
  const frozen = freezeRunWithAuthority({
    run_id: 'run_001',
    session: OWNER_SESSION,
    now_epoch_ms: getAuthFixtureNowEpochMs(),
    actor_id: OWNER_SESSION.user_id,
    authority_source: 'JUDGE',
    reason_code: 'JUDGE_FREEZE',
    controlled_at_epoch_ms: 1_700_000_110_000,
  });

  const unfrozen = unfreezeRunWithAuthority({
    run_id: 'run_001',
    session: OWNER_SESSION,
    now_epoch_ms: getAuthFixtureNowEpochMs(),
    actor_id: OWNER_SESSION.user_id,
    authority_source: 'RECOVERY_GATE',
    reason_code: 'RECOVERY_APPROVED',
    controlled_at_epoch_ms: 1_700_000_120_000,
    current_status: 'freeze',
  });

  assert.equal(unfrozen.run.status, 'verifying');
  assert.equal(unfrozen.run.freeze_reason, '');
  assert.equal(unfrozen.audit.previous_status, 'freeze');
  assert.equal(unfrozen.audit.next_status, 'verifying');
});

test('kill from freeze returns failed with audit', () => {
  const frozen = freezeRunWithAuthority({
    run_id: 'run_001',
    session: OWNER_SESSION,
    now_epoch_ms: getAuthFixtureNowEpochMs(),
    actor_id: OWNER_SESSION.user_id,
    authority_source: 'SECURITY',
    reason_code: 'SECURITY_FREEZE',
    controlled_at_epoch_ms: 1_700_000_130_000,
  });

  const killed = killRunWithAuthority({
    run_id: 'run_001',
    session: OWNER_SESSION,
    now_epoch_ms: getAuthFixtureNowEpochMs(),
    actor_id: OWNER_SESSION.user_id,
    authority_source: 'SECURITY',
    reason_code: 'SECURITY_KILL',
    controlled_at_epoch_ms: 1_700_000_140_000,
    current_status: 'freeze',
  });

  assert.equal(killed.run.status, 'failed');
  assert.equal(killed.run.freeze_reason, 'SECURITY_KILL');
  assert.equal(killed.audit.previous_status, 'freeze');
  assert.equal(killed.audit.next_status, 'failed');
});

test('unfreeze is denied if source is not RECOVERY_GATE', () => {
  assert.throws(
    () =>
      unfreezeRunWithAuthority({
        run_id: 'run_001',
        session: OWNER_SESSION,
        now_epoch_ms: getAuthFixtureNowEpochMs(),
        actor_id: OWNER_SESSION.user_id,
        authority_source: 'LAW',
        reason_code: 'LAW_FREEZE',
        controlled_at_epoch_ms: 1_700_000_150_000,
        current_status: 'freeze',
      }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, 'FORBIDDEN');
      return true;
    },
  );
});

test('unfreeze is denied if actor is not OWNER', () => {
  assert.throws(
    () =>
      unfreezeRunWithAuthority({
        run_id: 'run_001',
        session: OPERATOR_SESSION,
        now_epoch_ms: getAuthFixtureNowEpochMs(),
        actor_id: OPERATOR_SESSION.user_id,
        authority_source: 'RECOVERY_GATE',
        reason_code: 'RECOVERY_APPROVED',
        controlled_at_epoch_ms: 1_700_000_160_000,
        current_status: 'freeze',
      }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, 'FORBIDDEN');
      return true;
    },
  );
});

test('freeze is denied if authority source is invalid for freeze', () => {
  assert.throws(
    () =>
      freezeRunWithAuthority({
        run_id: 'run_001',
        session: OWNER_SESSION,
        now_epoch_ms: getAuthFixtureNowEpochMs(),
        actor_id: OWNER_SESSION.user_id,
        authority_source: 'OWNER_COMMAND',
        reason_code: 'OWNER_COMMAND',
        controlled_at_epoch_ms: 1_700_000_170_000,
      }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, 'FORBIDDEN');
      return true;
    },
  );
});

test('failed and cancelled statuses are terminal', () => {
  assert.throws(
    () => assertRunTransitionAllowed('failed', 'freeze'),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, 'STATE_TRANSITION_DENIED');
      return true;
    },
  );

  assert.throws(
    () => assertRunTransitionAllowed('cancelled', 'running'),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, 'STATE_TRANSITION_DENIED');
      return true;
    },
  );
});

test('runs POST client-truth path is rejected at helper level', () => {
  assert.throws(
    () => rejectClientRunCreation(),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, 'PIPELINE_CAP_EXCEEDED');
      assert.equal(error.statusCode, 409);
      return true;
    },
  );
});

test('repeated calls are deterministic deepEqual', () => {
  const first = freezeRunWithAuthority({
    run_id: 'run_001',
    session: OWNER_SESSION,
    now_epoch_ms: getAuthFixtureNowEpochMs(),
    actor_id: OWNER_SESSION.user_id,
    authority_source: 'VERIFY',
    reason_code: 'VERIFY_FREEZE',
    controlled_at_epoch_ms: 1_700_000_180_000,
  });

  const second = freezeRunWithAuthority({
    run_id: 'run_001',
    session: OWNER_SESSION,
    now_epoch_ms: getAuthFixtureNowEpochMs(),
    actor_id: OWNER_SESSION.user_id,
    authority_source: 'VERIFY',
    reason_code: 'VERIFY_FREEZE',
    controlled_at_epoch_ms: 1_700_000_180_000,
  });

  assert.deepEqual(first, second);
});

test('audit id is deterministic', () => {
  const first = freezeRunWithAuthority({
    run_id: 'run_001',
    session: OWNER_SESSION,
    now_epoch_ms: getAuthFixtureNowEpochMs(),
    actor_id: OWNER_SESSION.user_id,
    authority_source: 'LAW',
    reason_code: 'LAW_FREEZE',
    controlled_at_epoch_ms: 1_700_000_190_000,
  });

  const second = freezeRunWithAuthority({
    run_id: 'run_001',
    session: OWNER_SESSION,
    now_epoch_ms: getAuthFixtureNowEpochMs(),
    actor_id: OWNER_SESSION.user_id,
    authority_source: 'LAW',
    reason_code: 'LAW_FREEZE',
    controlled_at_epoch_ms: 1_700_000_190_000,
  });

  assert.equal(first.audit.audit_id, second.audit.audit_id);
}
);
