import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildDeterministicSession,
  getAuthFixtureNowEpochMs,
  getCurrentSessionFixture,
  getDeterministicOtacFixtureRecord,
  listSessionFixtures,
  requestDeterministicOtac,
  type Session,
  verifyDeterministicOtac,
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

test('getCurrentSessionFixture returns deterministic fixture session', () => {
  assert.deepEqual(getCurrentSessionFixture(), {
    session_id: 'session_owner_001',
    user_id: 'user_owner_001',
    email: 'owner@nexy.local',
    role: 'OWNER',
    device_id: 'device_owner_001',
    issued_at_epoch_ms: 1_699_999_000_000,
    expires_at_epoch_ms: 1_800_000_000_000,
    revoked_at_epoch_ms: null,
  });
});

test('listSessionFixtures returns deterministic server-owned fixtures', () => {
  const sessions = listSessionFixtures();

  assert.deepEqual(
    sessions.map((session) => session.session_id),
    ['session_owner_001', 'session_operator_001', 'session_viewer_001'],
  );
});

test('requestDeterministicOtac separates public response from server descriptor', () => {
  const result = requestDeterministicOtac({
    user_id: 'user_owner_001',
    email: 'owner@nexy.local',
    role: 'OWNER',
    device_id: 'device_owner_001',
  });

  const publicKeys = Object.keys(result.public_response);
  const serverKeys = Object.keys(result.server_descriptor);

  assert.equal(result.public_response.accepted, true);
  assert.equal(result.public_response.auth_mode, 'deterministic_fixture_not_production');
  assert.equal(result.server_descriptor.secret_material_returned, false);
  assert.equal(publicKeys.includes('code_hash'), false);
  assert.equal(publicKeys.includes('salt'), false);
  assert.equal(serverKeys.includes('secret_material_returned'), true);
});

test('requestDeterministicOtac does not accept non-fixture identity as server truth', () => {
  const result = requestDeterministicOtac({
    user_id: 'user_unknown',
    email: 'unknown@nexy.local',
    role: 'VIEWER',
    device_id: 'device_unknown',
  });

  assert.equal(result.public_response.accepted, false);
  assert.equal(result.public_response.delivery_status, 'fixture_identity_mismatch');
  assert.equal(result.server_descriptor.storage_mode, 'deterministic_static_fixture');
});

test('verifyDeterministicOtac verifies only server-owned fixture hash', () => {
  const record = getDeterministicOtacFixtureRecord();
  const result = verifyDeterministicOtac({
    otac_id: record.otac_id,
    submitted_code_hash: record.code_hash,
  });

  assert.equal(result.verified, true);
  assert.equal(result.reason, 'verified');
  assert.equal(result.auth_mode, 'deterministic_fixture_not_production');
  assert.equal(result.otac.consumed_at_epoch_ms, getAuthFixtureNowEpochMs());
  assert.equal(result.session?.session_id, 'session_owner_001');
});

test('verifyDeterministicOtac rejects missing otac id', () => {
  const record = getDeterministicOtacFixtureRecord();
  const result = verifyDeterministicOtac({
    otac_id: 'otac_missing',
    submitted_code_hash: record.code_hash,
  });

  assert.equal(result.verified, false);
  assert.equal(result.reason, 'otac_not_found');
  assert.equal(result.session, null);
});

test('verifyDeterministicOtac rejects mismatched hash', () => {
  const record = getDeterministicOtacFixtureRecord();
  const result = verifyDeterministicOtac({
    otac_id: record.otac_id,
    submitted_code_hash: 'fnv1a32_mismatch',
  });

  assert.equal(result.verified, false);
  assert.equal(result.reason, 'code_hash_mismatch');
  assert.equal(result.session, null);
});
