import { z } from 'zod';

import { OutputClassSchema } from '@/lib/types/output-class';

export const ReleasePolicyInputSchema = z
  .object({
    validated: z.boolean(),
    verified: z.boolean(),
    has_open_incident: z.boolean(),
    output_class: OutputClassSchema,
  })
  .strict();

export const ReleasePolicyDecisionSchema = z
  .object({
    release_allowed: z.boolean(),
    reason: z.string().trim().min(1),
  })
  .strict();

export type ReleasePolicyInput = z.infer<typeof ReleasePolicyInputSchema>;
export type ReleasePolicyDecision = z.infer<typeof ReleasePolicyDecisionSchema>;

export function evaluateReleasePolicy(
  input: ReleasePolicyInput,
): ReleasePolicyDecision {
  const parsed = ReleasePolicyInputSchema.parse(input);

  if (!parsed.validated) {
    return ReleasePolicyDecisionSchema.parse({
      release_allowed: false,
      reason: 'not_validated',
    });
  }

  if (!parsed.verified) {
    return ReleasePolicyDecisionSchema.parse({
      release_allowed: false,
      reason: 'not_verified',
    });
  }

  if (parsed.has_open_incident) {
    return ReleasePolicyDecisionSchema.parse({
      release_allowed: false,
      reason: 'open_incident',
    });
  }

  if (parsed.output_class !== 'FINAL') {
    return ReleasePolicyDecisionSchema.parse({
      release_allowed: false,
      reason: 'output_class_not_final',
    });
  }

  return ReleasePolicyDecisionSchema.parse({
    release_allowed: true,
    reason: 'ok',
  });
}
