import { z } from 'zod';

export const ReorgEventSchema = z
  .object({
    anchor_id: z.string().trim().min(1).max(256),
    detected: z.boolean(),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export type ReorgEvent = z.infer<typeof ReorgEventSchema>;

export function parseReorgEvent(input: unknown): ReorgEvent {
  return ReorgEventSchema.parse(input);
}

export function validateReorgEvent(input: unknown): boolean {
  return ReorgEventSchema.safeParse(input).success;
}
