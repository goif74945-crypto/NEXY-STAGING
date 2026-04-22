import { z } from 'zod';

export const RecoveryRootSchema = z
  .object({
    recovery_id: z.string().trim().min(1).max(256),
    host_survival_required: z.boolean(),
    resurrection_enabled: z.boolean(),
    freeze_on_mismatch: z.boolean(),
  })
  .strict();

export type RecoveryRoot = z.infer<typeof RecoveryRootSchema>;

export function parseRecoveryRoot(input: unknown): RecoveryRoot {
  return RecoveryRootSchema.parse(input);
}

export function validateRecoveryRoot(input: unknown): boolean {
  return RecoveryRootSchema.safeParse(input).success;
}

export function buildRecoveryRoot(input: RecoveryRoot): RecoveryRoot {
  const parsed = parseRecoveryRoot(input);

  return {
    recovery_id: parsed.recovery_id,
    host_survival_required: parsed.host_survival_required,
    resurrection_enabled: parsed.resurrection_enabled,
    freeze_on_mismatch: parsed.freeze_on_mismatch,
  };
}
