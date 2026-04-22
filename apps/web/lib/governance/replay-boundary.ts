import { z } from 'zod';

export const ReplayBoundarySchema = z
  .object({
    universe_id: z.string().trim().min(1).max(256),
    last_state_hash: z.string().trim().min(1).max(256),
    monotonic_counter: z.number().int().nonnegative(),
    allowed: z.boolean(),
  })
  .strict();

export type ReplayBoundary = z.infer<typeof ReplayBoundarySchema>;

export function parseReplayBoundary(input: unknown): ReplayBoundary {
  return ReplayBoundarySchema.parse(input);
}

export function validateReplayBoundary(input: unknown): boolean {
  return ReplayBoundarySchema.safeParse(input).success;
}

export function buildReplayBoundary(input: ReplayBoundary): ReplayBoundary {
  const parsed = parseReplayBoundary(input);

  if (parsed.allowed === true && parsed.monotonic_counter === 0) {
    throw new Error('Illegal replay boundary state.');
  }

  return {
    universe_id: parsed.universe_id,
    last_state_hash: parsed.last_state_hash,
    monotonic_counter: parsed.monotonic_counter,
    allowed: parsed.allowed,
  };
}
