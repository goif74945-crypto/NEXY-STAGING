import { z } from 'zod';

export const ForkDetectionInputSchema = z
  .object({
    expected_state_hash: z.string().trim().min(1).max(256),
    observed_state_hash: z.string().trim().min(1).max(256),
    wal_state_hash: z.string().trim().min(1).max(256),
  })
  .strict();

export const ForkDetectionResultSchema = z
  .object({
    fork_detected: z.boolean(),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export type ForkDetectionInput = z.infer<typeof ForkDetectionInputSchema>;
export type ForkDetectionResult = z.infer<typeof ForkDetectionResultSchema>;

export function parseForkDetectionInput(input: unknown): ForkDetectionInput {
  return ForkDetectionInputSchema.parse(input);
}

export function detectRecoveryFork(
  input: ForkDetectionInput,
): ForkDetectionResult {
  const parsed = parseForkDetectionInput(input);
  const observedMismatch =
    parsed.observed_state_hash !== parsed.expected_state_hash;
  const walMismatch = parsed.wal_state_hash !== parsed.expected_state_hash;

  if (observedMismatch && walMismatch) {
    return ForkDetectionResultSchema.parse({
      fork_detected: true,
      reason: 'observed_and_wal_state_hash_mismatch',
    });
  }

  if (observedMismatch) {
    return ForkDetectionResultSchema.parse({
      fork_detected: true,
      reason: 'observed_state_hash_mismatch',
    });
  }

  if (walMismatch) {
    return ForkDetectionResultSchema.parse({
      fork_detected: true,
      reason: 'wal_state_hash_mismatch',
    });
  }

  return ForkDetectionResultSchema.parse({
    fork_detected: false,
    reason: 'no_fork_detected',
  });
}
