import { z } from 'zod';

export const QuorumBatchSchema = z
  .object({
    anchor_id: z.string().trim().min(1).max(256),
    required_signers: z.array(z.string().trim().min(1).max(256)),
    signed_signers: z.array(z.string().trim().min(1).max(256)),
    quorum_reached: z.boolean(),
  })
  .strict();

export type QuorumBatch = z.infer<typeof QuorumBatchSchema>;

export function parseQuorumBatch(input: unknown): QuorumBatch {
  return QuorumBatchSchema.parse(input);
}

export function validateQuorumBatch(input: unknown): boolean {
  return QuorumBatchSchema.safeParse(input).success;
}
