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

export const OtacCodeSchema = z.string().trim().regex(/^\d{6}$/, 'OTAC code must be exactly 6 digits.');
export type OtacCode = z.infer<typeof OtacCodeSchema>;

export const OtacSubjectSchema = z.string().trim().min(1).max(256);
export type OtacSubject = z.infer<typeof OtacSubjectSchema>;

export const OtacNonceSchema = z.string().trim().min(1).max(256);
export type OtacNonce = z.infer<typeof OtacNonceSchema>;

export const OtacIdSchema = z.string().trim().min(1).max(128);
export type OtacId = z.infer<typeof OtacIdSchema>;

export const OtacCodeHashSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/, 'OTAC code hash must be lower-case sha256 hex.');
export type OtacCodeHash = z.infer<typeof OtacCodeHashSchema>;

export const OtacStatusSchema = z.enum(['active', 'consumed', 'expired']);
export type OtacStatus = z.infer<typeof OtacStatusSchema>;

export const OtacPolicySchema = z
  .object({
    issued_at_epoch_ms: z.number().int().nonnegative(),
    expires_at_epoch_ms: z.number().int().nonnegative(),
    max_attempts: z.number().int().positive(),
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
export type OtacPolicy = z.infer<typeof OtacPolicySchema>;

export const OtacRecordSchema = z
  .object({
    otac_id: OtacIdSchema,
    subject: OtacSubjectSchema,
    nonce: OtacNonceSchema,
    policy: OtacPolicySchema,
    code_hash: OtacCodeHashSchema,
    attempts_used: z.number().int().nonnegative(),
    status: OtacStatusSchema,
    consumed_at_epoch_ms: z.number().int().nonnegative().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.attempts_used > value.policy.max_attempts) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'attempts_used cannot exceed policy.max_attempts.',
      });
    }

    if (value.status === 'consumed' && value.consumed_at_epoch_ms === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'consumed status requires consumed_at_epoch_ms.',
      });
    }

    if (value.status !== 'consumed' && value.consumed_at_epoch_ms !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only consumed records may include consumed_at_epoch_ms.',
      });
    }
  });
export type OtacRecord = z.infer<typeof OtacRecordSchema>;

export const OtacCreateInputSchema = z
  .object({
    otac_id: OtacIdSchema,
    subject: OtacSubjectSchema,
    nonce: OtacNonceSchema,
    code: OtacCodeSchema,
    policy: OtacPolicySchema,
  })
  .strict();
export type OtacCreateInput = z.infer<typeof OtacCreateInputSchema>;

export const OtacAttemptInputSchema = z
  .object({
    record: OtacRecordSchema,
    code: OtacCodeSchema,
    current_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type OtacAttemptInput = z.infer<typeof OtacAttemptInputSchema>;

export const OtacVerificationResultSchema = z
  .object({
    accepted: z.boolean(),
    reason: z.enum(['verified', 'invalid_code', 'expired', 'already_consumed', 'attempt_limit_reached']),
    next_record: OtacRecordSchema,
  })
  .strict();
export type OtacVerificationResult = z.infer<typeof OtacVerificationResultSchema>;

export const OtacConsumeInputSchema = z
  .object({
    record: OtacRecordSchema,
    consumed_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type OtacConsumeInput = z.infer<typeof OtacConsumeInputSchema>;

export function hashOtacCode(input: unknown): OtacCodeHash {
  const code = OtacCodeSchema.parse(input);
  return OtacCodeHashSchema.parse(createSha256Hex(code));
}

export function isOtacExpired(recordInput: unknown, currentEpochMsInput: unknown): boolean {
  const record = OtacRecordSchema.parse(recordInput);
  const current_epoch_ms = z.number().int().nonnegative().parse(currentEpochMsInput);

  return current_epoch_ms > record.policy.expires_at_epoch_ms || record.status === 'expired';
}

export function createOtacRecord(input: unknown): OtacRecord {
  const parsed = OtacCreateInputSchema.parse(input);

  return OtacRecordSchema.parse({
    otac_id: parsed.otac_id,
    subject: parsed.subject,
    nonce: parsed.nonce,
    policy: parsed.policy,
    code_hash: hashOtacCode(parsed.code),
    attempts_used: 0,
    status: 'active',
  });
}

export function consumeOtacRecord(input: unknown): OtacRecord {
  const parsed = OtacConsumeInputSchema.parse(input);

  if (parsed.consumed_at_epoch_ms < parsed.record.policy.issued_at_epoch_ms) {
    throw new Error('consumed_at_epoch_ms must be greater than or equal to policy.issued_at_epoch_ms.');
  }

  return OtacRecordSchema.parse({
    ...parsed.record,
    status: 'consumed',
    consumed_at_epoch_ms: parsed.consumed_at_epoch_ms,
  });
}

export function verifyOtacAttempt(input: unknown): OtacVerificationResult {
  const parsed = OtacAttemptInputSchema.parse(input);

  if (parsed.record.status === 'consumed') {
    return OtacVerificationResultSchema.parse({
      accepted: false,
      reason: 'already_consumed',
      next_record: parsed.record,
    });
  }

  if (parsed.record.attempts_used >= parsed.record.policy.max_attempts) {
    const exhaustedRecord = OtacRecordSchema.parse({
      ...parsed.record,
      status: 'expired',
    });

    return OtacVerificationResultSchema.parse({
      accepted: false,
      reason: 'attempt_limit_reached',
      next_record: exhaustedRecord,
    });
  }

  if (isOtacExpired(parsed.record, parsed.current_epoch_ms)) {
    const expiredRecord = OtacRecordSchema.parse({
      ...parsed.record,
      status: 'expired',
    });

    return OtacVerificationResultSchema.parse({
      accepted: false,
      reason: 'expired',
      next_record: expiredRecord,
    });
  }

  const presentedHash = hashOtacCode(parsed.code);

  if (!safeEqualHex(parsed.record.code_hash, presentedHash)) {
    const incrementedRecord = OtacRecordSchema.parse({
      ...parsed.record,
      attempts_used: parsed.record.attempts_used + 1,
    });

    return OtacVerificationResultSchema.parse({
      accepted: false,
      reason: 'invalid_code',
      next_record: incrementedRecord,
    });
  }

  const consumedRecord = consumeOtacRecord({
    record: parsed.record,
    consumed_at_epoch_ms: parsed.current_epoch_ms,
  });

  return OtacVerificationResultSchema.parse({
    accepted: true,
    reason: 'verified',
    next_record: consumedRecord,
  });
}

export function parseOtacCode(input: unknown): OtacCode {
  return OtacCodeSchema.parse(input);
}

export function validateOtacCode(input: unknown): boolean {
  return OtacCodeSchema.safeParse(input).success;
}

export function parseOtacSubject(input: unknown): OtacSubject {
  return OtacSubjectSchema.parse(input);
}

export function validateOtacSubject(input: unknown): boolean {
  return OtacSubjectSchema.safeParse(input).success;
}

export function parseOtacNonce(input: unknown): OtacNonce {
  return OtacNonceSchema.parse(input);
}

export function validateOtacNonce(input: unknown): boolean {
  return OtacNonceSchema.safeParse(input).success;
}

export function parseOtacPolicy(input: unknown): OtacPolicy {
  return OtacPolicySchema.parse(input);
}

export function validateOtacPolicy(input: unknown): boolean {
  return OtacPolicySchema.safeParse(input).success;
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
