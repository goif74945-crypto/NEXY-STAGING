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

function assertTimestampOrder(startLabel: string, start: string, endLabel: string, end: string): void {
  const startMs = parseIsoTimestampToMillis(startLabel, start);
  const endMs = parseIsoTimestampToMillis(endLabel, end);

  if (endMs < startMs) {
    throw new Error(`${endLabel} must be greater than or equal to ${startLabel}.`);
  }
}

function normalizeHex(input: string): string {
  return input.trim().toLowerCase();
}

function isSafeEqualHex(left: string, right: string): boolean {
  const normalizedLeft = normalizeHex(left);
  const normalizedRight = normalizeHex(right);

  const leftBuffer = Buffer.from(normalizedLeft, 'utf8');
  const rightBuffer = Buffer.from(normalizedRight, 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export const OtacEmailSchema = z.string().trim().email().max(320);
export type OtacEmail = z.infer<typeof OtacEmailSchema>;

export const OtacPurposeSchema = z.string().trim().min(1).max(128);
export type OtacPurpose = z.infer<typeof OtacPurposeSchema>;

export const OtacIdSchema = z.string().trim().min(1).max(128);
export type OtacId = z.infer<typeof OtacIdSchema>;

export const OtacSecretSchema = z.string().trim().min(1).max(512);
export type OtacSecret = z.infer<typeof OtacSecretSchema>;

export const OtacIssuedAtSchema = z.string().trim().regex(ISO_TIMESTAMP_PATTERN);
export type OtacIssuedAt = z.infer<typeof OtacIssuedAtSchema>;

export const OtacExpiresAtSchema = z.string().trim().regex(ISO_TIMESTAMP_PATTERN);
export type OtacExpiresAt = z.infer<typeof OtacExpiresAtSchema>;

export const OtacAttemptedAtSchema = z.string().trim().regex(ISO_TIMESTAMP_PATTERN);
export type OtacAttemptedAt = z.infer<typeof OtacAttemptedAtSchema>;

export const OtacCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'OTAC code must be exactly 6 digits.');
export type OtacCode = z.infer<typeof OtacCodeSchema>;

export const OtacCodeHashSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/, 'OTAC code hash must be a lower-case 64-char sha256 hex string.');
export type OtacCodeHash = z.infer<typeof OtacCodeHashSchema>;

export const OtacStatusSchema = z.enum(['active', 'consumed', 'expired']);
export type OtacStatus = z.infer<typeof OtacStatusSchema>;

export const OtacDerivationInputSchema = z
  .object({
    secret: OtacSecretSchema,
    email: OtacEmailSchema,
    purpose: OtacPurposeSchema,
    issued_at: OtacIssuedAtSchema,
    expires_at: OtacExpiresAtSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    try {
      assertTimestampOrder('issued_at', value.issued_at, 'expires_at', value.expires_at);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : 'Invalid OTAC timestamp order.',
      });
    }
  });
export type OtacDerivationInput = z.infer<typeof OtacDerivationInputSchema>;

export const OtacRecordSchema = z
  .object({
    otac_id: OtacIdSchema,
    email: OtacEmailSchema,
    purpose: OtacPurposeSchema,
    issued_at: OtacIssuedAtSchema,
    expires_at: OtacExpiresAtSchema,
    code_hash: OtacCodeHashSchema,
    consumed_at: OtacAttemptedAtSchema.optional(),
    status: OtacStatusSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    try {
      assertTimestampOrder('issued_at', value.issued_at, 'expires_at', value.expires_at);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : 'Invalid OTAC record timestamp order.',
      });
    }

    if (value.consumed_at) {
      try {
        assertTimestampOrder('issued_at', value.issued_at, 'consumed_at', value.consumed_at);
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error instanceof Error ? error.message : 'Invalid OTAC consumed_at timestamp.',
        });
      }
    }

    if (value.status === 'consumed' && !value.consumed_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Consumed OTAC records must include consumed_at.',
      });
    }

    if (value.status !== 'consumed' && value.consumed_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only consumed OTAC records may include consumed_at.',
      });
    }
  });
export type OtacRecord = z.infer<typeof OtacRecordSchema>;

export const OtacCreateInputSchema = z
  .object({
    otac_id: OtacIdSchema,
    derivation: OtacDerivationInputSchema,
  })
  .strict();
export type OtacCreateInput = z.infer<typeof OtacCreateInputSchema>;

export const OtacVerifyInputSchema = z
  .object({
    record: OtacRecordSchema,
    code: OtacCodeSchema,
    attempted_at: OtacAttemptedAtSchema,
  })
  .strict();
export type OtacVerifyInput = z.infer<typeof OtacVerifyInputSchema>;

export const OtacVerificationResultSchema = z
  .object({
    accepted: z.boolean(),
    status: OtacStatusSchema,
    reason: z.enum(['verified', 'invalid_code', 'expired', 'already_consumed']),
    next_record: OtacRecordSchema,
  })
  .strict();
export type OtacVerificationResult = z.infer<typeof OtacVerificationResultSchema>;

export function normalizeOtacEmail(input: unknown): OtacEmail {
  return OtacEmailSchema.parse(z.string().parse(input).trim().toLowerCase());
}

export function hashOtacCode(input: unknown): OtacCodeHash {
  const code = OtacCodeSchema.parse(input);
  const digest = createHash('sha256').update(code, 'utf8').digest('hex');
  return OtacCodeHashSchema.parse(digest);
}

export function deriveOtacCode(input: unknown): OtacCode {
  const parsed = OtacDerivationInputSchema.parse(input);
  const canonical = [
    parsed.secret,
    normalizeOtacEmail(parsed.email),
    parsed.purpose,
    parsed.issued_at,
    parsed.expires_at,
  ].join('|');

  const digest = createHmac('sha256', parsed.secret).update(canonical, 'utf8').digest('hex');
  const numeric = BigInt(`0x${digest}`) % 1_000_000n;
  const code = numeric.toString().padStart(6, '0');

  return OtacCodeSchema.parse(code);
}

export function createOtacRecord(input: unknown): OtacRecord {
  const parsed = OtacCreateInputSchema.parse(input);
  const code = deriveOtacCode(parsed.derivation);

  return OtacRecordSchema.parse({
    otac_id: parsed.otac_id,
    email: normalizeOtacEmail(parsed.derivation.email),
    purpose: parsed.derivation.purpose,
    issued_at: parsed.derivation.issued_at,
    expires_at: parsed.derivation.expires_at,
    code_hash: hashOtacCode(code),
    status: 'active',
  });
}

export function verifyOtac(input: unknown): OtacVerificationResult {
  const parsed = OtacVerifyInputSchema.parse(input);
  const attemptedAtMs = parseIsoTimestampToMillis('attempted_at', parsed.attempted_at);
  const expiresAtMs = parseIsoTimestampToMillis('expires_at', parsed.record.expires_at);

  if (parsed.record.status === 'consumed') {
    return OtacVerificationResultSchema.parse({
      accepted: false,
      status: 'consumed',
      reason: 'already_consumed',
      next_record: parsed.record,
    });
  }

  if (attemptedAtMs > expiresAtMs || parsed.record.status === 'expired') {
    const expiredRecord = OtacRecordSchema.parse({
      ...parsed.record,
      status: 'expired',
    });

    return OtacVerificationResultSchema.parse({
      accepted: false,
      status: 'expired',
      reason: 'expired',
      next_record: expiredRecord,
    });
  }

  const presentedHash = hashOtacCode(parsed.code);

  if (!isSafeEqualHex(parsed.record.code_hash, presentedHash)) {
    return OtacVerificationResultSchema.parse({
      accepted: false,
      status: 'active',
      reason: 'invalid_code',
      next_record: parsed.record,
    });
  }

  const consumedRecord = OtacRecordSchema.parse({
    ...parsed.record,
    consumed_at: parsed.attempted_at,
    status: 'consumed',
  });

  return OtacVerificationResultSchema.parse({
    accepted: true,
    status: 'consumed',
    reason: 'verified',
    next_record: consumedRecord,
  });
}

export function parseOtacEmail(input: unknown): OtacEmail {
  return normalizeOtacEmail(input);
}

export function validateOtacEmail(input: unknown): boolean {
  const raw = z.string().safeParse(input);

  if (!raw.success) {
    return false;
  }

  return OtacEmailSchema.safeParse(raw.data.trim().toLowerCase()).success;
}

export function parseOtacCode(input: unknown): OtacCode {
  return OtacCodeSchema.parse(input);
}

export function validateOtacCode(input: unknown): boolean {
  return OtacCodeSchema.safeParse(input).success;
}

export function parseOtacRecord(input: unknown): OtacRecord {
  return OtacRecordSchema.parse(input);
}

export function validateOtacRecord(input: unknown): boolean {
  return OtacRecordSchema.safeParse(input).success;
}

export function parseOtacVerificationResult(input: unknown): OtacVerificationResult {
  return OtacVerificationResultSchema.parse(input);
}

export function validateOtacVerificationResult(input: unknown): boolean {
  return OtacVerificationResultSchema.safeParse(input).success;
}
