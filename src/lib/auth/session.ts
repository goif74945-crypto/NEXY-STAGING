import { z } from 'zod';

import {
  SESSION_ROLES,
  type SessionRole as RootSessionRole,
} from '@/lib/auth/session-types';

export const SESSION_COOKIE_NAME = 'nexy_session';

export const SessionRoleSchema = z.enum(SESSION_ROLES);

export const SessionSchema = z
  .object({
    session_id: z.string().trim().min(1).max(256),
    user_id: z.string().trim().min(1).max(256),
    email: z.string().trim().email().max(320),
    role: SessionRoleSchema,
    device_id: z.string().trim().min(1).max(256),
    issued_at_epoch_ms: z.number().int().nonnegative(),
    expires_at_epoch_ms: z.number().int().nonnegative(),
    revoked_at_epoch_ms: z.number().int().nonnegative().nullable(),
  })
  .strict();

export const SessionListSchema = z.array(SessionSchema);

export const SessionRevocationBodySchema = z
  .object({
    session_id: z.string().trim().min(1).max(256),
  })
  .strict();

export const SessionRevocationInputSchema = SessionRevocationBodySchema.extend({
  revoked_at_epoch_ms: z.number().int().nonnegative(),
}).strict();

export const RevokeAllOtherSessionsInputSchema = z
  .object({
    current_session_id: z.string().trim().min(1).max(256),
    revoked_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

export const OtacAuthModeSchema = z.literal(
  'deterministic_fixture_not_production',
);

export const OtacDeliveryStatusSchema = z.enum([
  'not_sent_deterministic_fixture',
  'fixture_identity_mismatch',
]);

export const OtacStorageModeSchema = z.literal('deterministic_static_fixture');

export const OtacRequestInputSchema = z
  .object({
    user_id: z.string().trim().min(1).max(256),
    email: z.string().trim().email().max(320),
    role: SessionRoleSchema,
    device_id: z.string().trim().min(1).max(256),
  })
  .strict();

export const OtacRecordSchema = OtacRequestInputSchema.extend({
  otac_id: z.string().trim().min(1).max(256),
  issued_at_epoch_ms: z.number().int().nonnegative(),
  expires_at_epoch_ms: z.number().int().nonnegative(),
  consumed_at_epoch_ms: z.number().int().nonnegative().nullable(),
  attempt_count: z.number().int().nonnegative(),
  max_attempts: z.number().int().positive(),
  code_hash: z.string().trim().min(1).max(256),
  salt: z.string().trim().min(1).max(256),
  delivery_status: z.literal('not_sent_deterministic_fixture'),
  storage_mode: OtacStorageModeSchema,
}).strict();

export const OtacPublicResponseSchema = z
  .object({
    otac_id: z.string().trim().min(1).max(256),
    user_id: z.string().trim().min(1).max(256),
    email: z.string().trim().email().max(320),
    role: SessionRoleSchema,
    device_id: z.string().trim().min(1).max(256),
    issued_at_epoch_ms: z.number().int().nonnegative(),
    expires_at_epoch_ms: z.number().int().nonnegative(),
    consumed_at_epoch_ms: z.number().int().nonnegative().nullable(),
    attempt_count: z.number().int().nonnegative(),
    max_attempts: z.number().int().positive(),
    accepted: z.boolean(),
    delivery_status: OtacDeliveryStatusSchema,
    auth_mode: OtacAuthModeSchema,
  })
  .strict();

const OtacServerRecordFieldSchema = z.enum([
  'code_hash',
  'salt',
  'issued_at_epoch_ms',
  'expires_at_epoch_ms',
  'consumed_at_epoch_ms',
  'attempt_count',
  'max_attempts',
]);

export const OtacServerDescriptorSchema = z
  .object({
    storage_mode: OtacStorageModeSchema,
    secret_material_returned: z.literal(false),
    server_record_fields: z.array(OtacServerRecordFieldSchema),
  })
  .strict();

export const OtacRequestResultSchema = z
  .object({
    public_response: OtacPublicResponseSchema,
    server_descriptor: OtacServerDescriptorSchema,
  })
  .strict();

export const OtacVerifyInputSchema = z
  .object({
    otac_id: z.string().trim().min(1).max(256),
    submitted_code_hash: z.string().trim().min(1).max(256),
  })
  .strict();

export const OtacVerifyResultSchema = z
  .object({
    verified: z.boolean(),
    reason: z.enum([
      'verified',
      'otac_not_found',
      'code_hash_mismatch',
      'otac_expired',
      'otac_consumed',
      'max_attempts_exceeded',
    ]),
    auth_mode: OtacAuthModeSchema,
    otac: OtacPublicResponseSchema,
    session: SessionSchema.nullable(),
  })
  .strict();

export type SessionRole = RootSessionRole;
export type Session = z.infer<typeof SessionSchema>;
export type SessionList = z.infer<typeof SessionListSchema>;
export type SessionRevocationBody = z.infer<typeof SessionRevocationBodySchema>;
export type SessionRevocationInput = z.infer<
  typeof SessionRevocationInputSchema
>;
export type RevokeAllOtherSessionsInput = z.infer<
  typeof RevokeAllOtherSessionsInputSchema
>;
export type OtacRequestInput = z.infer<typeof OtacRequestInputSchema>;
export type OtacRecord = z.infer<typeof OtacRecordSchema>;
export type OtacPublicResponse = z.infer<typeof OtacPublicResponseSchema>;
export type OtacServerDescriptor = z.infer<typeof OtacServerDescriptorSchema>;
export type OtacRequestResult = z.infer<typeof OtacRequestResultSchema>;
export type OtacVerifyInput = z.infer<typeof OtacVerifyInputSchema>;
export type OtacVerifyResult = z.infer<typeof OtacVerifyResultSchema>;

const AUTH_FIXTURE_NOW_EPOCH_MS = 1_700_000_000_000;
const SESSION_REVOKED_AT_EPOCH_MS = 1_700_000_020_000;
const ALL_OTHER_SESSIONS_REVOKED_AT_EPOCH_MS = 1_700_000_030_000;
const OTAC_ISSUED_AT_EPOCH_MS = 1_700_000_000_000;
const OTAC_EXPIRES_AT_EPOCH_MS = 1_700_000_300_000;
const OTAC_MAX_ATTEMPTS = 3;
const OTAC_SALT = 'deterministic_otac_fixture_salt_v1';

const CURRENT_SESSION_FIXTURE: Session = {
  session_id: 'session_owner_001',
  user_id: 'user_owner_001',
  email: 'owner@nexy.local',
  role: 'OWNER',
  device_id: 'device_owner_001',
  issued_at_epoch_ms: 1_699_999_000_000,
  expires_at_epoch_ms: 1_800_000_000_000,
  revoked_at_epoch_ms: null,
};

const SESSION_FIXTURES: Session[] = [
  CURRENT_SESSION_FIXTURE,
  {
    session_id: 'session_operator_001',
    user_id: 'user_owner_001',
    email: 'owner@nexy.local',
    role: 'OPERATOR',
    device_id: 'device_operator_001',
    issued_at_epoch_ms: 1_699_999_100_000,
    expires_at_epoch_ms: 1_800_000_000_000,
    revoked_at_epoch_ms: null,
  },
  {
    session_id: 'session_viewer_001',
    user_id: 'user_owner_001',
    email: 'owner@nexy.local',
    role: 'VIEWER',
    device_id: 'device_viewer_001',
    issued_at_epoch_ms: 1_699_999_200_000,
    expires_at_epoch_ms: 1_800_000_000_000,
    revoked_at_epoch_ms: null,
  },
];

const OTAC_FIXTURE_IDENTITY: OtacRequestInput = {
  user_id: CURRENT_SESSION_FIXTURE.user_id,
  email: CURRENT_SESSION_FIXTURE.email,
  role: CURRENT_SESSION_FIXTURE.role,
  device_id: CURRENT_SESSION_FIXTURE.device_id,
};

function assertSessionTiming(session: Session): void {
  if (session.expires_at_epoch_ms < session.issued_at_epoch_ms) {
    throw new Error(
      'expires_at_epoch_ms must be greater than or equal to issued_at_epoch_ms',
    );
  }

  if (
    session.revoked_at_epoch_ms !== null &&
    session.revoked_at_epoch_ms < session.issued_at_epoch_ms
  ) {
    throw new Error(
      'revoked_at_epoch_ms must be greater than or equal to issued_at_epoch_ms',
    );
  }
}

function cloneSession(session: Session): Session {
  return SessionSchema.parse({
    session_id: session.session_id,
    user_id: session.user_id,
    email: session.email,
    role: session.role,
    device_id: session.device_id,
    issued_at_epoch_ms: session.issued_at_epoch_ms,
    expires_at_epoch_ms: session.expires_at_epoch_ms,
    revoked_at_epoch_ms: session.revoked_at_epoch_ms,
  });
}

function deterministicHash(input: string): string {
  let hash = 2_166_136_261;

  for (const character of input) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619) >>> 0;
  }

  return `fnv1a32_${hash.toString(16).padStart(8, '0')}`;
}

function buildOtacId(input: OtacRequestInput): string {
  const seed = [
    input.user_id,
    input.email,
    input.role,
    input.device_id,
    OTAC_ISSUED_AT_EPOCH_MS.toString(),
  ].join('|');

  return `otac_${deterministicHash(seed).replace('fnv1a32_', '')}`;
}

function buildOtacCodeHash(otacId: string): string {
  return deterministicHash(`${OTAC_SALT}|${otacId}|deterministic_fixture`);
}

function isOtacFixtureIdentity(input: OtacRequestInput): boolean {
  return (
    input.user_id === OTAC_FIXTURE_IDENTITY.user_id &&
    input.email === OTAC_FIXTURE_IDENTITY.email &&
    input.role === OTAC_FIXTURE_IDENTITY.role &&
    input.device_id === OTAC_FIXTURE_IDENTITY.device_id
  );
}

function buildOtacPublicResponse(
  record: OtacRecord,
  accepted: boolean,
): OtacPublicResponse {
  return OtacPublicResponseSchema.parse({
    otac_id: record.otac_id,
    user_id: record.user_id,
    email: record.email,
    role: record.role,
    device_id: record.device_id,
    issued_at_epoch_ms: record.issued_at_epoch_ms,
    expires_at_epoch_ms: record.expires_at_epoch_ms,
    consumed_at_epoch_ms: record.consumed_at_epoch_ms,
    attempt_count: record.attempt_count,
    max_attempts: record.max_attempts,
    accepted,
    delivery_status: accepted
      ? 'not_sent_deterministic_fixture'
      : 'fixture_identity_mismatch',
    auth_mode: 'deterministic_fixture_not_production',
  });
}

function buildOtacServerDescriptor(): OtacServerDescriptor {
  return OtacServerDescriptorSchema.parse({
    storage_mode: 'deterministic_static_fixture',
    secret_material_returned: false,
    server_record_fields: [
      'code_hash',
      'salt',
      'issued_at_epoch_ms',
      'expires_at_epoch_ms',
      'consumed_at_epoch_ms',
      'attempt_count',
      'max_attempts',
    ],
  });
}

export function parseSession(input: unknown): Session {
  const parsed = SessionSchema.parse(input);

  assertSessionTiming(parsed);

  return cloneSession(parsed);
}

export function parseSessionList(input: unknown): SessionList {
  const parsed = SessionListSchema.parse(input);

  return parsed.map((session) => parseSession(session));
}

export function buildDeterministicSession(input: Session): Session {
  return parseSession(input);
}

export function buildDeterministicSessionList(input: SessionList): SessionList {
  const parsed = parseSessionList(input);

  return [...parsed]
    .map((session) => cloneSession(session))
    .sort((left, right) => {
      if (left.issued_at_epoch_ms !== right.issued_at_epoch_ms) {
        return left.issued_at_epoch_ms - right.issued_at_epoch_ms;
      }

      if (left.expires_at_epoch_ms !== right.expires_at_epoch_ms) {
        return left.expires_at_epoch_ms - right.expires_at_epoch_ms;
      }

      return left.session_id.localeCompare(right.session_id);
    });
}

export function getAuthFixtureNowEpochMs(): number {
  return AUTH_FIXTURE_NOW_EPOCH_MS;
}

export function getSessionRevokedAtEpochMs(): number {
  return SESSION_REVOKED_AT_EPOCH_MS;
}

export function getAllOtherSessionsRevokedAtEpochMs(): number {
  return ALL_OTHER_SESSIONS_REVOKED_AT_EPOCH_MS;
}

export function getCurrentSessionFixture(): Session {
  return cloneSession(CURRENT_SESSION_FIXTURE);
}

export function listSessionFixtures(): SessionList {
  return buildDeterministicSessionList(SESSION_FIXTURES);
}

export function getSessionFixtureById(sessionId: string): Session | null {
  const session =
    listSessionFixtures().find((item) => item.session_id === sessionId) ?? null;

  return session === null ? null : cloneSession(session);
}

export function logoutCurrentSessionFixture(): Session {
  return buildDeterministicSession({
    ...getCurrentSessionFixture(),
    revoked_at_epoch_ms: SESSION_REVOKED_AT_EPOCH_MS,
  });
}

export function revokeSessionFixture(
  input: SessionRevocationInput,
): Session | null {
  const parsed = SessionRevocationInputSchema.parse(input);
  const session = getSessionFixtureById(parsed.session_id);

  if (session === null) {
    return null;
  }

  return buildDeterministicSession({
    ...session,
    revoked_at_epoch_ms: parsed.revoked_at_epoch_ms,
  });
}

export function revokeAllOtherSessionFixtures(
  input: RevokeAllOtherSessionsInput,
): SessionList {
  const parsed = RevokeAllOtherSessionsInputSchema.parse(input);

  return buildDeterministicSessionList(
    listSessionFixtures()
      .filter((session) => session.session_id !== parsed.current_session_id)
      .map((session) => ({
        ...session,
        revoked_at_epoch_ms: parsed.revoked_at_epoch_ms,
      })),
  );
}

export function buildDeterministicOtacRecord(
  input: OtacRequestInput,
): OtacRecord {
  const parsed = OtacRequestInputSchema.parse(input);
  const otacId = buildOtacId(parsed);

  return OtacRecordSchema.parse({
    otac_id: otacId,
    user_id: parsed.user_id,
    email: parsed.email,
    role: parsed.role,
    device_id: parsed.device_id,
    issued_at_epoch_ms: OTAC_ISSUED_AT_EPOCH_MS,
    expires_at_epoch_ms: OTAC_EXPIRES_AT_EPOCH_MS,
    consumed_at_epoch_ms: null,
    attempt_count: 0,
    max_attempts: OTAC_MAX_ATTEMPTS,
    code_hash: buildOtacCodeHash(otacId),
    salt: OTAC_SALT,
    delivery_status: 'not_sent_deterministic_fixture',
    storage_mode: 'deterministic_static_fixture',
  });
}

export function getDeterministicOtacFixtureRecord(): OtacRecord {
  return buildDeterministicOtacRecord(OTAC_FIXTURE_IDENTITY);
}

export function requestDeterministicOtac(
  input: OtacRequestInput,
): OtacRequestResult {
  const parsed = OtacRequestInputSchema.parse(input);
  const accepted = isOtacFixtureIdentity(parsed);
  const record = accepted
    ? getDeterministicOtacFixtureRecord()
    : buildDeterministicOtacRecord(parsed);

  return OtacRequestResultSchema.parse({
    public_response: buildOtacPublicResponse(record, accepted),
    server_descriptor: buildOtacServerDescriptor(),
  });
}

export function verifyDeterministicOtac(
  input: OtacVerifyInput,
): OtacVerifyResult {
  const parsed = OtacVerifyInputSchema.parse(input);
  const record = getDeterministicOtacFixtureRecord();

  if (parsed.otac_id !== record.otac_id) {
    return OtacVerifyResultSchema.parse({
      verified: false,
      reason: 'otac_not_found',
      auth_mode: 'deterministic_fixture_not_production',
      otac: buildOtacPublicResponse(record, false),
      session: null,
    });
  }

  if (record.expires_at_epoch_ms <= AUTH_FIXTURE_NOW_EPOCH_MS) {
    return OtacVerifyResultSchema.parse({
      verified: false,
      reason: 'otac_expired',
      auth_mode: 'deterministic_fixture_not_production',
      otac: buildOtacPublicResponse(record, true),
      session: null,
    });
  }

  if (record.consumed_at_epoch_ms !== null) {
    return OtacVerifyResultSchema.parse({
      verified: false,
      reason: 'otac_consumed',
      auth_mode: 'deterministic_fixture_not_production',
      otac: buildOtacPublicResponse(record, true),
      session: null,
    });
  }

  if (record.attempt_count >= record.max_attempts) {
    return OtacVerifyResultSchema.parse({
      verified: false,
      reason: 'max_attempts_exceeded',
      auth_mode: 'deterministic_fixture_not_production',
      otac: buildOtacPublicResponse(record, true),
      session: null,
    });
  }

  if (parsed.submitted_code_hash !== record.code_hash) {
    return OtacVerifyResultSchema.parse({
      verified: false,
      reason: 'code_hash_mismatch',
      auth_mode: 'deterministic_fixture_not_production',
      otac: buildOtacPublicResponse(record, true),
      session: null,
    });
  }

  return OtacVerifyResultSchema.parse({
    verified: true,
    reason: 'verified',
    auth_mode: 'deterministic_fixture_not_production',
    otac: buildOtacPublicResponse(
      {
        ...record,
        consumed_at_epoch_ms: AUTH_FIXTURE_NOW_EPOCH_MS,
      },
      true,
    ),
    session: getCurrentSessionFixture(),
  });
}
