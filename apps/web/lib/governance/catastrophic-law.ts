import { z } from 'zod';

export const CatastrophicLawInputSchema = z
  .object({
    compromised: z.boolean(),
    recovery_possible: z.boolean(),
    quarantined: z.boolean(),
  })
  .strict();

export const CatastrophicLawResultSchema = z
  .object({
    freeze_required: z.boolean(),
    terminate_required: z.boolean(),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export type CatastrophicLawInput = z.infer<typeof CatastrophicLawInputSchema>;
export type CatastrophicLawResult = z.infer<typeof CatastrophicLawResultSchema>;

export function parseCatastrophicLawInput(
  input: unknown,
): CatastrophicLawInput {
  return CatastrophicLawInputSchema.parse(input);
}

export function evaluateCatastrophicLaw(
  input: CatastrophicLawInput,
): CatastrophicLawResult {
  const parsed = parseCatastrophicLawInput(input);
  const terminate_required = parsed.compromised && parsed.recovery_possible === false;
  const freeze_required = parsed.compromised || parsed.quarantined;

  let reason = 'system_stable';

  if (terminate_required) {
    reason = 'compromised_without_recovery_path';
  } else if (freeze_required && parsed.compromised) {
    reason = 'compromised_requires_freeze';
  } else if (freeze_required && parsed.quarantined) {
    reason = 'quarantine_requires_freeze';
  }

  return CatastrophicLawResultSchema.parse({
    freeze_required,
    terminate_required,
    reason,
  });
}
