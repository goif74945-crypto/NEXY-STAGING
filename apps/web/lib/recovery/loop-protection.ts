import { z } from 'zod';

export const RecoveryLoopProtectionSchema = z
  .object({
    universe_id: z.string().trim().min(1).max(256),
    attempt_count: z.number().int().nonnegative(),
    max_attempts: z.number().int().nonnegative(),
    blocked: z.boolean(),
  })
  .strict();

export type RecoveryLoopProtection = z.infer<
  typeof RecoveryLoopProtectionSchema
>;

export function parseRecoveryLoopProtection(
  input: unknown,
): RecoveryLoopProtection {
  return RecoveryLoopProtectionSchema.parse(input);
}

export function validateRecoveryLoopProtection(input: unknown): boolean {
  return RecoveryLoopProtectionSchema.safeParse(input).success;
}

export function evaluateRecoveryLoopProtection(
  input: RecoveryLoopProtection,
): RecoveryLoopProtection {
  const parsed = parseRecoveryLoopProtection(input);
  const blocked = parsed.attempt_count >= parsed.max_attempts;

  if (parsed.blocked !== blocked) {
    throw new Error('Illegal recovery loop protection contradiction.');
  }

  return {
    universe_id: parsed.universe_id,
    attempt_count: parsed.attempt_count,
    max_attempts: parsed.max_attempts,
    blocked,
  };
}
