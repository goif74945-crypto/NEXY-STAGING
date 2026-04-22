import { z } from 'zod';

export const AnchorTimePolicySchema = z
  .object({
    anchor_id: z.string().trim().min(1).max(256),
    tsa_epoch_ms: z.number().int().nonnegative(),
    time_policy: z.string().trim().min(1).max(256),
  })
  .strict();

export type AnchorTimePolicy = z.infer<typeof AnchorTimePolicySchema>;

export function parseAnchorTimePolicy(input: unknown): AnchorTimePolicy {
  return AnchorTimePolicySchema.parse(input);
}

export function validateAnchorTimePolicy(input: unknown): boolean {
  return AnchorTimePolicySchema.safeParse(input).success;
}
