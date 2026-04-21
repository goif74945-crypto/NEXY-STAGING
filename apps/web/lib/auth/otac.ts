import { z } from 'zod';

import {
  OtacCreateInputSchema,
  OtacIdSchema,
  OtacNonceSchema,
  OtacPolicySchema,
  OtacRecordSchema,
  OtacSubjectSchema,
  createOtacRecord,
  verifyOtacAttempt,
  type OtacRecord,
} from '../../packages/auth/otac';

export const RequestOtacPayloadSchema = OtacCreateInputSchema;
export type RequestOtacPayload = z.infer<typeof RequestOtacPayloadSchema>;

export const VerifyOtacPayloadSchema = z
  .object({
    code: z.string().trim().regex(/^\d{6}$/),
    current_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type VerifyOtacPayload = z.infer<typeof VerifyOtacPayloadSchema>;

export const OtacPublicViewSchema = z
  .object({
    otac_id: OtacIdSchema,
    subject: OtacSubjectSchema,
    nonce: OtacNonceSchema,
    policy: OtacPolicySchema,
    attempts_used: z.number().int().nonnegative(),
    status: z.enum(['active', 'consumed', 'expired']),
    consumed_at_epoch_ms: z.number().int().nonnegative().optional(),
  })
  .strict();
export type OtacPublicView = z.infer<typeof OtacPublicViewSchema>;

export const OtacGateReasonSchema = z.enum([
  'verified',
  'invalid_code',
  'expired',
  'already_consumed',
  'attempt_limit_reached',
]);
export type OtacGateReason = z.infer<typeof OtacGateReasonSchema>;

export const OtacGateResultSchema = z
  .object({
    accepted: z.boolean(),
    reason: OtacGateReasonSchema,
    record: OtacPublicViewSchema,
  })
  .strict();
export type OtacGateResult = z.infer<typeof OtacGateResultSchema>;

export function buildOtacPublicView(recordInput: unknown): OtacPublicView {
  const record = OtacRecordSchema.parse(recordInput);

  return OtacPublicViewSchema.parse({
    otac_id: record.otac_id,
    subject: record.subject,
    nonce: record.nonce,
    policy: record.policy,
    attempts_used: record.attempts_used,
    status: record