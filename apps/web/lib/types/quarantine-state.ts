import { z } from 'zod';

export const QuarantineStateSchema = z
  .object({
    universe_id: z.string().trim().min(1).max(256),
    active: z.boolean(),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export type QuarantineState = z.infer<typeof QuarantineStateSchema>;

export function parseQuarantineState(input: unknown): QuarantineState {
  return QuarantineStateSchema.parse(input);
}

export function validateQuarantineState(input: unknown): boolean {
  return QuarantineStateSchema.safeParse(input).success;
}
