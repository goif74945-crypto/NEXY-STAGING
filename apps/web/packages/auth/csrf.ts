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

export const CsrfTokenSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/, 'CSRF token must be lower-case sha256 hex.');
export type CsrfToken = z.infer<typeof CsrfTokenSchema>;

export const CsrfTokenHashSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/, 'CSRF token hash must be lower-case sha256 hex.');
export type CsrfTokenHash = z.infer<typeof CsrfTokenHashSchema>;

export const CsrfSessionIdSchema = z.string().trim().min(1).max(128);
export type CsrfSessionId = z.infer<typeof CsrfSessionIdSchema>;

export const CsrfSubjectSchema = z.string().trim().min(1).max(256);
export type CsrfSubject = z.infer<typeof CsrfSubjectSchema>;

export const CsrfNonceSchema = z.string().trim().min(1).max(256);
export type CsrfNonce = z.infer<typeof CsrfNonceSchema>;

export const CsrfVersionSchema = z.string().trim().min(1).max(64);
export type CsrfVersion = z.infer<typeof CsrfVersionSchema>;

export const CsrfBindingSchema = z
  .object({
    session_id: CsrfSessionIdSchema,
    subject: CsrfSubjectSchema,
    nonce: CsrfNonceSchema,
    version: CsrfVersionSchema,
    token_hash: CsrfTokenHashSchema,
    issued_at_epoch_ms: z.number().int().nonnegative(),
    expires_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.expires_at_epoch_ms < value.issued_at_epoch_ms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'expires_at_epoch_ms must be greater than or equal to issued_at_epoch_ms.',
      });
    }
  });
export type CsrfBinding = z.infer<typeof CsrfBindingSchema>;

export const CsrfCreateInputSchema = z
  .object({
    session_id: CsrfSessionIdSchema,
    subject: CsrfSubjectSchema,
    nonce: CsrfNonceSchema,
    version: CsrfVersionSchema,
    token: CsrfTokenSchema,
    issued_at_epoch_ms: z.number().int().nonnegative(),
    expires_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type CsrfCreateInput = z.infer<typeof CsrfCreateInputSchema>;

export const CsrfVerificationInputSchema = z
  .object({
    binding: CsrfBindingSchema,
    token: CsrfTokenSchema,
    session_id: CsrfSessionIdSchema,
    subject: CsrfSubjectSchema,
    nonce: CsrfNonceSchema,
    version: CsrfVersionSchema,
    current_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type CsrfVerificationInput = z.infer<typeof CsrfVerificationInputSchema>;

export const CsrfVerificationResultSchema = z
  .object({
    accepted: z.boolean(),
    reason: z.enum(['verified', 'invalid_token', 'expired', 'session_mismatch', 'subject_mismatch', 'nonce_mismatch', 'version_mismatch']),
  })
  .strict();
export type CsrfVerificationResult = z.infer<typeof CsrfVerificationResultSchema>;

export function hashCsrfToken(input: unknown): CsrfTokenHash {
  const token = CsrfTokenSchema.parse(input);
  return CsrfTokenHashSchema.parse(createSha256Hex(token));
}

export function createCsrfBinding(input: unknown): CsrfBinding {
  const parsed = CsrfCreateInputSchema.parse(input);

  return CsrfBindingSchema.parse({
    session_id: parsed.session_id,
    subject: parsed.subject,
    nonce: parsed.nonce,
    version: parsed.version,
    token_hash: hashCsrfToken(parsed.token),
    issued_at_epoch_ms: parsed.issued_at_epoch_ms,
    expires_at_epoch_ms: parsed.expires_at_epoch_ms,
  });
}

export function verifyCsrfBinding(input: unknown): CsrfVerificationResult {
  const parsed = CsrfVerificationInputSchema.parse(input);

  if (parsed.binding.session_id !== parsed.session_id) {
    return CsrfVerificationResultSchema.parse({ accepted: false, reason: 'session_mismatch' });
  }

  if (parsed.binding.subject !== parsed.subject) {
    return CsrfVerificationResultSchema.parse({ accepted: false, reason: 'subject_mismatch' });
  }

  if (parsed.binding.nonce !== parsed.nonce) {
    return CsrfVerificationResultSchema.parse({ accepted: false, reason: 'nonce_mismatch' });
  }

  if (parsed.binding.version !== parsed.version) {
    return CsrfVerificationResultSchema.parse({ accepted: false, reason: 'version_mismatch' });
  }

  if (parsed.current_epoch_ms > parsed.binding.expires_at_epoch_ms) {
    return CsrfVerificationResultSchema.parse({ accepted: false, reason: 'expired' });
  }

  const presentedHash = hashCsrfToken(parsed.token);

  if (!safeEqualHex(parsed.binding.token_hash, presentedHash)) {
    return CsrfVerificationResultSchema.parse({ accepted: false, reason: 'invalid_token' });
  }

  return CsrfVerificationResultSchema.parse({ accepted: true, reason: 'verified' });
}

export function parseCsrfToken(input: unknown): CsrfToken {
  return CsrfTokenSchema.parse(input);
}

export function validateCsrfToken(input: unknown): boolean {
  return CsrfTokenSchema.safeParse(input).success;
}

export function parseCsrfBinding(input: unknown): CsrfBinding {
  return CsrfBindingSchema.parse(input);
}

export function validateCsrfBinding(input: unknown): boolean {
  return CsrfBindingSchema.safeParse(input).success;
}

export function parseCsrfVerificationResult(input: unknown): CsrfVerificationResult {
  return CsrfVerificationResultSchema.parse(input);
}

export function validateCsrfVerificationResult(input: unknown): boolean {
  return CsrfVerificationResultSchema.safeParse(input).success;
}
