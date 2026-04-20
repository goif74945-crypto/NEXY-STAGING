import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+\-]\d{2}:\d{2})$/;

function parseIsoTimestampToMillis(label: string, value: string): number {
  const parsed = Date.parse(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`${label} must be a valid ISO timestamp.`);
  }

  return parsed;
}

function assertChronology(startLabel: string, start: string, endLabel: string, end: string): void {
  const startMs = parseIsoTimestampToMillis(startLabel, start);
  const endMs = parseIsoTimestampToMillis(endLabel, end);

  if (endMs < startMs) {
    throw new Error(`${endLabel} must be greater than or equal to ${startLabel}.`);
  }
}

function safeEqualHex(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left.trim().toLowerCase(), 'utf8');
  const rightBuffer = Buffer.from(right.trim().toLowerCase(), 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export const SessionIdSchema = z.string().trim().min(1).max(128);
export type SessionId = z.infer<typeof SessionIdSchema>;

export const SessionSubjectSchema = z.string().trim().min(1).max(256);
export type SessionSubject = z.infer<typeof SessionSubjectSchema>;

export const SessionDeviceIdSchema = z.string().trim().min(1).max(256);
export type SessionDeviceId = z.infer<typeof SessionDeviceIdSchema>;

export const SessionSecretSchema = z.string().trim().min(1).max(512);
export type SessionSecret = z.infer<typeof SessionSecretSchema>;

export const SessionIssuedAtSchema = z.string().trim().regex(ISO_TIMESTAMP_PATTERN);
export type SessionIssuedAt = z.infer<typeof SessionIssuedAtSchema>;

export const SessionExpiresAtSchema = z.string().trim().regex(ISO_TIMESTAMP_PATTERN);
export type SessionExpiresAt = z.infer<typeof SessionExpiresAtSchema>;

export const SessionCheckedAtSchema = z.string().trim().regex(ISO_TIMESTAMP_PATTERN);
export type SessionCheckedAt = z.infer<typeof SessionCheckedAtSchema>;

export const SessionTokenSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/, 'Session token must be a lower-case 64-char hex string.');
export type SessionToken = z.infer<typeof SessionTokenSchema>;

export const SessionTokenHashSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/, 'Session token hash must be a lower-case 64-char hex string.');
export type SessionTokenHash = z.infer<typeof SessionTokenHashSchema>;

export const SessionStatusSchema = z.enum(['active', 'revoked', 'expired']);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionDerivationInputSchema = z
  .object({
    secret: SessionSecretSchema,
    session_id: SessionIdSchema,
    subject: SessionSubjectSchema,
    device_id: SessionDeviceIdSchema,
    issued_at: SessionIssuedAtSchema,
    expires_at: SessionExpiresAtSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    try {
      assertChronology('issued_at', value.issued_at, 'expires_at', value.expires_at);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : 'Invalid session derivation timestamps.',
      });
    }
  });
export type SessionDerivationInput = z.infer<typeof SessionDerivationInputSchema>;

export const SessionRecordSchema = z
  .object({
    session_id: SessionIdSchema,
    subject: SessionSubjectSchema,
    device_id: SessionDeviceIdSchema,
    issued_at: SessionIssuedAtSchema,
    expires_at: SessionExpiresAtSchema,
    token_hash: SessionTokenHashSchema,
    status: SessionStatusSchema,
    revoked_at: SessionCheckedAtSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    try {
      assertChronology('issued_at', value.issued_at, 'expires_at', value.expires_at);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : 'Invalid session record timestamps.',
      });
    }

    if (value.revoked_at) {
      try {
        assertChronology('issued_at', value.issued_at, 'revoked_at', value.revoked_at);
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error instanceof Error ? error.message : 'Invalid revoked_at timestamp.',
        });
      }
    }

    if (value.status === 'revoked' && !value.revoked_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Revoked sessions must include revoked_at.',
      });
    }

    if (value.status !== 'revoked' && value.revoked_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only revoked sessions may include revoked_at.',
      });
    }
  });
export type SessionRecord = z.infer<typeof SessionRecordSchema>;

export const SessionCreateInputSchema = z
  .object({
    derivation: SessionDerivationInputSchema,
  })
  .strict();
export type SessionCreateInput = z.infer<typeof SessionCreateInputSchema>;

export const SessionVerificationInputSchema = z
  .object({
    record: SessionRecordSchema,
    token: SessionTokenSchema,
    checked_at: SessionCheckedAtSchema,
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
    revoked_at: SessionCheckedAtSchema,
  })
  .strict();
export type SessionRevokeInput = z.infer<typeof SessionRevokeInputSchema>;

export function deriveSessionToken(input: unknown): SessionToken {
  const parsed = SessionDerivationInputSchema.parse(input);
  const canonical = [
    parsed.session_id,
    parsed.subject,
    parsed.device_id,
    parsed.issued_at,
    parsed.expires_at,
  ].join('|');

  const token = createHmac('sha256', parsed.secret).update(canonical, 'utf8').digest('hex');
  return SessionTokenSchema.parse(token);
}

export function hashSessionToken(input: unknown): SessionTokenHash {
  const token = SessionTokenSchema.parse(input);
  const digest = createHash('sha256').update(token, 'utf8').digest('hex');
  return SessionTokenHashSchema.parse(digest);
}

export function createSessionRecord(input: unknown): SessionRecord {
  const parsed = SessionCreateInputSchema.parse(input);
  const token = deriveSessionToken(parsed.derivation);

  return SessionRecordSchema.parse({
    session_id: parsed.derivation.session_id,
    subject: parsed.derivation.subject,
    device_id: parsed.derivation.device_id,
    issued_at: parsed.derivation.issued_at,
    expires_at: parsed.derivation.expires_at,
    token_hash: hashSessionToken(token),
    status: 'active',
  });
}

export function revokeSessionRecord(input: unknown): SessionRecord {
  const parsed = SessionRevokeInputSchema.parse(input);

  if (parsed.record.status === 'revoked') {
    return parsed.record;
  }

  const revokedRecord = SessionRecordSchema.parse({
    ...parsed.record,
    status: 'revoked',
    revoked_at: parsed.revoked_at,
  });

  return revokedRecord;
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

  const checkedAtMs = parseIsoTimestampToMillis('checked_at', parsed.checked_at);
  const expiresAtMs = parseIsoTimestampToMillis('expires_at', parsed.record.expires_at);

  if (checkedAtMs > expiresAtMs || parsed.record.status === 'expired') {
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

export function parseSessionToken(input: unknown): SessionToken {
  return SessionTokenSchema.parse(input);
}

export function validateSessionToken(input: unknown): boolean {
  return SessionTokenSchema.safeParse(input).success;
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
