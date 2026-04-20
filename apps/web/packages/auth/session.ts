import { createHash, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

function createSha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex').toLowerCase();
}

function safeEqualHex(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, 'utf8');
  const rightBuffer = Buffer.from(right, 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export const SessionIdSchema = z.string().trim().min(1).max(128);
export type SessionId = z.infer<typeof SessionIdSchema>;

export const SessionTokenSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/, 'Session token must be lower-case sha256 hex.');
export type SessionToken = z.infer<typeof SessionTokenSchema>;

export const SessionTokenHashSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/, 'Session token hash must be lower-case sha256 hex.');
export type SessionTokenHash = z.infer<typeof SessionTokenHashSchema>;

export const SessionRoleSchema = z.enum(['owner', 'operator', 'viewer']);
export type SessionRole = z.infer<typeof SessionRoleSchema>;

export const SessionStatusSchema = z.enum(['active', 'revoked', 'expired']);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionSubjectSchema = z.string().trim().min(1).max(256);
export type SessionSubject = z.infer<typeof SessionSubjectSchema>;

export const SessionRecordSchema = z
  .object({
    session_id: SessionIdSchema,
    subject: SessionSubjectSchema,
    role: SessionRoleSchema,
    token_hash: SessionTokenHashSchema,
    issued_at_epoch_ms: z.number().int().nonnegative(),
    expires_at_epoch_ms: z.number().int().nonnegative(),
    status: SessionStatusSchema,
    revoked_at_epoch_ms: z.number().int().nonnegative().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.expires_at_epoch_ms < value.issued_at_epoch_ms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'expires_at_epoch_ms must be greater than or equal to issued_at_epoch_ms.',
      });
    }

    if (value.status === 'revoked' && value.revoked_at_epoch_ms === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Revoked sessions must include revoked_at_epoch_ms.',
      });
    }

    if (value.status !== 'revoked' && value.revoked_at_epoch_ms !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only revoked sessions may include revoked_at_epoch_ms.',
      });
    }
  });
export type SessionRecord = z.infer<typeof SessionRecordSchema>;

export const SessionRecordListSchema = z.array(SessionRecordSchema);
export type SessionRecordList = z.infer<typeof SessionRecordListSchema>;

export const SessionCreateInputSchema = z
  .object({
    session_id: SessionIdSchema,
    subject: SessionSubjectSchema,
    role: SessionRoleSchema,
    token: SessionTokenSchema,
    issued_at_epoch_ms: z.number().int().nonnegative(),
    expires_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type SessionCreateInput = z.infer<typeof SessionCreateInputSchema>;

export const SessionVerificationInputSchema = z
  .object({
    record: SessionRecordSchema,
    token: SessionTokenSchema,
    current_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type SessionVerificationInput = z.infer<typeof SessionVerificationInputSchema>;

export const SessionVerificationResultSchema = z
  .object({
    accepted: z.boolean(),
    reason: z.enum(['verified', 'invalid_token', 'revoked', 'expired']),
    next_record: SessionRecordSchema,
  })
  .strict();
export type SessionVerificationResult = z.infer<typeof SessionVerificationResultSchema>;

export const SessionRevokeInputSchema = z
  .object({
    record: SessionRecordSchema,
    revoked_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type SessionRevokeInput = z.infer<typeof SessionRevokeInputSchema>;

export const RevokeAllOtherSessionsInputSchema = z
  .object({
    records: SessionRecordListSchema,
    keep_session_id: SessionIdSchema,
    revoked_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type RevokeAllOtherSessionsInput = z.infer<typeof RevokeAllOtherSessionsInputSchema>;

export function hashSessionToken(input: unknown): SessionTokenHash {
  const token = SessionTokenSchema.parse(input);
  return SessionTokenHashSchema.parse(createSha256Hex(token));
}

export function createSessionRecord(input: unknown): SessionRecord {
  const parsed = SessionCreateInputSchema.parse(input);

  return SessionRecordSchema.parse({
    session_id: parsed.session_id,
    subject: parsed.subject,
    role: parsed.role,
    token_hash: hashSessionToken(parsed.token),
    issued_at_epoch_ms: parsed.issued_at_epoch_ms,
    expires_at_epoch_ms: parsed.expires_at_epoch_ms,
    status: 'active',
  });
}

export function isSessionActive(recordInput: unknown, currentEpochMsInput: unknown): boolean {
  const record = SessionRecordSchema.parse(recordInput);
  const current_epoch_ms = z.number().int().nonnegative().parse(currentEpochMsInput);

  return (
    record.status === 'active' &&
    current_epoch_ms >= record.issued_at_epoch_ms &&
    current_epoch_ms <= record.expires_at_epoch_ms
  );
}

export function verifySessionToken(input: unknown): SessionVerificationResult {
  const parsed = SessionVerificationInputSchema.parse(input);

  if (parsed.record.status === 'revoked') {
    return SessionVerificationResultSchema.parse({
      accepted: false,
      reason: 'revoked',
      next_record: parsed.record,
    });
  }

  if (!isSessionActive(parsed.record, parsed.current_epoch_ms)) {
    const expiredRecord = SessionRecordSchema.parse({
      ...parsed.record,
      status: 'expired',
    });

    return SessionVerificationResultSchema.parse({
      accepted: false,
      reason: 'expired',
      next_record: expiredRecord,
    });
  }

  const presentedHash = hashSessionToken(parsed.token);

  if (!safeEqualHex(parsed.record.token_hash, presentedHash)) {
    return SessionVerificationResultSchema.parse({
      accepted: false,
      reason: 'invalid_token',
      next_record: parsed.record,
    });
  }

  return SessionVerificationResultSchema.parse({
    accepted: true,
    reason: 'verified',
    next_record: parsed.record,
  });
}

export function revokeSession(input: unknown): SessionRecord {
  const parsed = SessionRevokeInputSchema.parse(input);

  if (parsed.record.status === 'revoked') {
    return parsed.record;
  }

  return SessionRecordSchema.parse({
    ...parsed.record,
    status: 'revoked',
    revoked_at_epoch_ms: parsed.revoked_at_epoch_ms,
  });
}

export function revokeAllOtherSessions(input: unknown): SessionRecordList {
  const parsed = RevokeAllOtherSessionsInputSchema.parse(input);

  return SessionRecordListSchema.parse(
    parsed.records.map((record) =>
      record.session_id === parsed.keep_session_id
        ? record
        : revokeSession({
            record,
            revoked_at_epoch_ms: parsed.revoked_at_epoch_ms,
          }),
    ),
  );
}

export function parseSessionId(input: unknown): SessionId {
  return SessionIdSchema.parse(input);
}

export function validateSessionId(input: unknown): boolean {
  return SessionIdSchema.safeParse(input).success;
}

export function parseSessionToken(input: unknown): SessionToken {
  return SessionTokenSchema.parse(input);
}

export function validateSessionToken(input: unknown): boolean {
  return SessionTokenSchema.safeParse(input).success;
}

export function parseSessionTokenHash(input: unknown): SessionTokenHash {
  return SessionTokenHashSchema.parse(input);
}

export function validateSessionTokenHash(input: unknown): boolean {
  return SessionTokenHashSchema.safeParse(input).success;
}

export function parseSessionRole(input: unknown): SessionRole {
  return SessionRoleSchema.parse(input);
}

export function validateSessionRole(input: unknown): boolean {
  return SessionRoleSchema.safeParse(input).success;
}

export function parseSessionRecord(input: unknown): SessionRecord {
  return SessionRecordSchema.parse(input);
}

export function validateSessionRecord(input: unknown): boolean {
  return SessionRecordSchema.safeParse(input).success;
}

export function parseSessionVerificationResult(input: unknown): SessionVerificationResult {
  return SessionVerificationResultSchema.parse(input);
}

export function validateSessionVerificationResult(input: unknown): boolean {
  return SessionVerificationResultSchema.safeParse(input).success;
}
