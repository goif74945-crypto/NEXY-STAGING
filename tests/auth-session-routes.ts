import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildDeterministicSession,
  type Session,
} from '../src/lib/auth/session';
import { requireOwner } from '../src/lib/auth/require-owner';
import { requireSession } from '../src/lib/auth/require-session';
import { AppError } from '../src/lib/errors/app-errors';

const ACTIVE_OWNER_SESSION: Session = buildDeterministicSession({
  session_id: 'session_owner_001',
  user_id: 'user_owner_001',
  email: 'owner@nexy.local',
  role: 'OWNER',
  device_id: 'device_owner_001',
  issued_at_epoch_ms: 1_700_000_000_000,
  expires_at_epoch_ms: 1_800_000_000_000,
  revoked_at_epoch_ms: null,
});

const REVOKED_OWNER_SESSION: Session = buildDeterministicSession({
  session_id: 'session_owner_revoked_001',
  user_id: 'user_owner_001',
  email: 'owner@nexy.local',
  role: 'OWNER',
  device_id: 'device_owner_001',
  issued_at_epoch_ms: 1_700_000_000_000,
  expires_at_epoch_ms: 1_800_000_000_000,
  revoked_at_epoch_ms: 1_700_000_100_000,
});

test('buildDeterministicSession returns a validated session', () => {
  assert.deepEqual(ACTIVE_OWNER_SESSION, {
    session_id: 'session_owner_001',
    user_id: 'user_owner_001',
    email: 'owner@nexy.local',
    role: 'OWNER',
    device_id: 'device_owner_001',
    issued_at_epoch_ms: 1_700_000_000_000,
    expires_at_epoch_ms: 1_800_000_000_000,
    revoked_at_epoch_ms: null,
  });
});

test('requireSession accepts an active session', () => {
  const result = requireSession({
    session: ACTIVE_OWNER_SESSION,
    now_epoch_ms: 1_700_000_500_000,
  });

  assert.equal(result.session.session_id, 'session_owner_001');
  assert.equal(result.session.role, 'OWNER');
});

test('requireSession rejects a revoked session', () => {
  assert.throws(
    () =>
      requireSession({
        session: REVOKED_OWNER_SESSION,
        now_epoch_ms: 1_700_000_500_000,
      }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, 'SESSION_REVOKED');
      return true;
    },
  );
});

test('requireOwner accepts an owner session', () => {
  const session = requireOwner({
    session: ACTIVE_OWNER_SESSION,
    now_epoch_ms: 1_700_000_500_000,
  });

  assert.equal(session.role, 'OWNER');
  assert.equal(session.session_id, 'session_owner_001');
});
