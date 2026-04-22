import { z } from 'zod';

import { RecoveryModeSchema } from '../types/recovery-mode';

export const RecoveryRestartDecisionSchema = z
  .object({
    universe_id: z.string().trim().min(1).max(256),
    blocked: z.boolean(),
    reason: z.string().trim().min(1).max(4096),
    mode: RecoveryModeSchema,
  })
  .strict();

export type RecoveryRestartDecision = z.infer<
  typeof RecoveryRestartDecisionSchema
>;

export function parseRecoveryRestartDecision(
  input: unknown,
): RecoveryRestartDecision {
  return RecoveryRestartDecisionSchema.parse(input);
}

export function validateRecoveryRestartDecision(input: unknown): boolean {
  return RecoveryRestartDecisionSchema.safeParse(input).success;
}

export function buildRecoveryRestartDecision(
  input: RecoveryRestartDecision,
): RecoveryRestartDecision {
  const parsed = parseRecoveryRestartDecision(input);

  return {
    universe_id: parsed.universe_id,
    blocked: parsed.blocked,
    reason: parsed.reason,
    mode: parsed.mode,
  };
}
