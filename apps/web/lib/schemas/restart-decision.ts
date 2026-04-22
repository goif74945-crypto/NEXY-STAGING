import { z } from 'zod';

import { RecoveryModeSchema } from '../types/recovery-mode';

export const RestartDecisionSchema = z
  .object({
    universe_id: z.string().trim().min(1).max(256),
    blocked: z.boolean(),
    reason: z.string().trim().min(1).max(4096),
    mode: RecoveryModeSchema,
  })
  .strict();

export type RestartDecision = z.infer<typeof RestartDecisionSchema>;

export function parseRestartDecision(input: unknown): RestartDecision {
  return RestartDecisionSchema.parse(input);
}

export function validateRestartDecision(input: unknown): boolean {
  return RestartDecisionSchema.safeParse(input).success;
}
