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

export const CsrfSecretSchema = z.string().trim().min(1).max(512);
export type CsrfSecret = z.infer<typeof CsrfSecretSchema>;

export const CsrfSessionIdSchema = z.string().trim().min(1).max(128);
export type CsrfSessionId = z.infer<typeof CsrfSessionIdSchema>;

export const CsrfScopeSchema = z.string().trim().min(1).max(128);
export type CsrfScope = z.infer<typeof CsrfScopeSchema>;

export const CsrfIssuedAtSchema = z.string().trim().regex(ISO_TIMESTAMP_PATTERN);
export type CsrfIssuedAt = z.infer<typeof CsrfIssuedAtSchema>;

export const CsrfExpiresAtSchema = z.string().trim().regex(ISO_TIMESTAMP_PATTERN);
export type CsrfExpiresAt = z.infer<typeof CsrfExpiresAtSchema>;

export const CsrfCheckedAtSchema = z.string().trim().regex(ISO_TIMESTAMP_PATTERN);
export type CsrfCheckedAt = z.infer<typeof CsrfCheckedAtSchema>;

export const CsrfTokenSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/, 'CSRF token must be a lower-case 64-char hex string.');
export type CsrfToken = z.infer<typeof CsrfTokenSchema>;

export const CsrfTokenHashSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/, 'CSRF token hash must be a lower-case 64-char hex string.');
export type CsrfTokenHash = z.infer<typeof CsrfTokenHashSchema>;

export const CsrfRecordSchema = z
  .object({
    session_id: CsrfSessionIdSchema,
    scope: CsrfScopeSchema,
    issued_at: CsrfIssuedAtSchema,
    expires_at: CsrfExpiresAtSchema,
    token_hash: CsrfTokenHashSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    try {
      assertChronology('issued_at', value.issued_at, 'expires_at', value.expires_at);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : 'Invalid CSRF record timestamps.',
      });
    }
  });
export type CsrfRecord = z.infer<typeof CsrfRecordSchema>;

export const CsrfDerivationInputSchema = z
  .object({
    secret: CsrfSecretSchema,
    session_id: CsrfSessionIdSchema,
    scope: CsrfScopeSchema,
    issued_at: CsrfIssuedAtSchema,
    expires_at: CsrfExpiresAtSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    try {
      assertChronology('issued_at', value.issued_at, 'expires_at', value.expires_at);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : 'Invalid CSRF derivation timestamps.',
      });
    }
  });
export type CsrfDerivationInput = z.infer<typeof CsrfDerivationInputSchema>;

export const CsrfCreateInputSchema = z
  .object({
    derivation: CsrfDerivationInputSchema,
  })
  .strict();
export type CsrfCreateInput = z.infer<typeof CsrfCreateInputSchema>;

export const CsrfVerificationInputSchema = z
  .object({
    record: CsrfRecordSchema,
    token: CsrfTokenSchema,
    checked_at: CsrfCheckedAtSchema,
    scope: CsrfScopeSchema,
    session_id: CsrfSessionIdSchema,
  })
  .strict();
export type CsrfVerificationInput = z.infer<typeof CsrfVerificationInputSchema>;

export const CsrfVerificationResultSchema = z
  .object({
    accepted: z.boolean(),
    reason: z.enum(['verified', 'invalid_token', 'expired', 'scope_mismatch', 'session_mismatch']),
  })
  .strict();
export type CsrfVerificationResult = z.infer<typeof CsrfVerificationResultSchema>;

export function deriveCsrfToken(input: unknown): CsrfToken {
  const parsed = CsrfDerivationInputSchema.parse(input);
  const canonical = [
    parsed.session_id,
    parsed.scope,
    parsed.issued_at,
    parsed.expires_at,
  ].join('|');

  const token = createHmac('sha256', parsed.secret).update(canonical, 'utf8').digest('hex');
  return CsrfTokenSchema.parse(token);
}

export function hashCsrfToken(input: unknown): CsrfTokenHash {
  const token = CsrfTokenSchema.parse(input);
  const digest = createHash('sha256').update(token, 'utf8').digest('hex');
  return CsrfTokenHashSchema.parse(digest);
}

export function createCsrfRecord(input: unknown): CsrfRecord {
  const parsed = CsrfCreateInputSchema.parse(input);
  const token = deriveCsrfToken(parsed.derivation);

  return CsrfRecordSchema.parse({
    session_id: parsed.derivation.session_id,
    scope: parsed.derivation.scope,
    issued_at: parsed.derivation.issued_at,
    expires_at: parsed.derivation.expires_at,
    token_hash: hashCsrfToken(token),
  });
}

export function verifyCsrfToken(input: unknown): CsrfVerificationResult {
  const parsed = CsrfVerificationInputSchema.parse(input);

  if (parsed.record.session_id !== parsed.session_id) {
    return CsrfVerificationResultSchema.parse({
      accepted: false,
      reason: 'session_mismatch',
    });
  }

  if (parsed.record.scope !== parsed.scope) {
    return CsrfVerificationResultSchema.parse({
      accepted: false,
      reason: 'scope_mismatch',
    });
  }

  const checkedAtMs = parseIsoTimestampToMillis('checked_at', parsed.checked_at);
  const expiresAtMs = parseIsoTimestampToMillis('expires_at', parsed.record.expires_at);

  if (checkedAtMs > expiresAtMs) {
    return CsrfVerificationResultSchema.parse({
      accepted: false,
      reason: 'expired',
    });
  }

  const presentedHash = hashCsrfToken(parsed.token);

  if (!safeEqualHex(parsed.record.token_hash, presentedHash)) {
    return CsrfVerificationResultSchema.parse({
      accepted: false,
      reason: 'invalid_token',
    });
  }

  return CsrfVerificationResultSchema.parse({
    accepted: true,
    reason: 'verified',
  });
}

export function parseCsrfToken(input: unknown): CsrfToken {
  return CsrfTokenSchema.parse(input);
}

export function validateCsrfToken(input: unknown): boolean {
  return CsrfTokenSchema.safeParse(input).success;
}

export function parseCsrfRecord(input: unknown): CsrfRecord {
  return CsrfRecordSchema.parse(input);
}

export function validateCsrfRecord(input: unknown): boolean {
  return CsrfRecordSchema.safeParse(input).success;
}

export function parseCsrfVerificationResult(input: unknown): CsrfVerificationResult {
  return CsrfVerificationResultSchema.parse(input);
}

export function validateCsrfVerificationResult(input: unknown): boolean {
  return CsrfVerificationResultSchema.safeParse(input).success;
}
