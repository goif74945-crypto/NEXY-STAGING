import { z } from 'zod';

import { AnchorStateSchema } from '../types/anchor-state';

export const AnchorBatchSchema = z
  .object({
    anchor_id: z.string().trim().min(1).max(256),
    batch_id: z.string().trim().min(1).max(256),
    state: AnchorStateSchema,
    region: z.string().trim().min(1).max(128),
    proposed_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

export type AnchorBatch = z.infer<typeof AnchorBatchSchema>;

export function parseAnchorBatch(input: unknown): AnchorBatch {
  return AnchorBatchSchema.parse(input);
}

export function validateAnchorBatch(input: unknown): boolean {
  return AnchorBatchSchema.safeParse(input).success;
}
