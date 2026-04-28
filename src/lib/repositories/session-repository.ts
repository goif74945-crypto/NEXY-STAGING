import { z } from 'zod';

export const SessionRepositoryRecordSchema = z
  .object({
    session_id: z.string().trim().min(1),
    user_id: z.string().trim().min(1),
    email: z.string().trim().min(1),
    role: z.string().trim().min(1),
    device_id: z.string().trim().min(1),
    issued_at_epoch_ms: z.number().int().nonnegative(),
    expires_at_epoch_ms: z.number().int().nonnegative(),
    revoked_at_epoch_ms: z.number().int().nonnegative().nullable(),
  })
  .strict();

export type SessionRepositoryRecord = z.infer<
  typeof SessionRepositoryRecordSchema
>;

function buildSessionRecords(): SessionRepositoryRecord[] {
  return [
    SessionRepositoryRecordSchema.parse({
      session_id: 'session_owner_001',
      user_id: 'user_owner_001',
      email: 'owner@nexy.local',
      role: 'OWNER',
      device_id: 'device_owner_001',
      issued_at_epoch_ms: 1699999000000,
      expires_at_epoch_ms: 1800000000000,
      revoked_at_epoch_ms: null,
    }),
    SessionRepositoryRecordSchema.parse({
      session_id: 'session_operator_001',
      user_id: 'user_operator_001',
      email: 'operator@nexy.local',
      role: 'OPERATOR',
      device_id: 'device_operator_001',
      issued_at_epoch_ms: 1699999100000,
      expires_at_epoch_ms: 1800000000000,
      revoked_at_epoch_ms: null,
    }),
  ];
}

function cloneSessionRecord(
  record: SessionRepositoryRecord,
): SessionRepositoryRecord {
  return SessionRepositoryRecordSchema.parse({
    session_id: record.session_id,
    user_id: record.user_id,
    email: record.email,
    role: record.role,
    device_id: record.device_id,
    issued_at_epoch_ms: record.issued_at_epoch_ms,
    expires_at_epoch_ms: record.expires_at_epoch_ms,
    revoked_at_epoch_ms: record.revoked_at_epoch_ms,
  });
}

export function listSessions(): SessionRepositoryRecord[] {
  return buildSessionRecords().map(cloneSessionRecord);
}

export function getSessionById(
  sessionId: string,
): SessionRepositoryRecord | null {
  const session = buildSessionRecords().find(
    (record) => record.session_id === sessionId,
  );

  return session === undefined ? null : cloneSessionRecord(session);
}
