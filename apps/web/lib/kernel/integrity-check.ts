import { z } from 'zod';

export const IntegrityCheckInputSchema = z
  .object({
    last_state_hash: z.string().trim().min(1).max(256),
    current_state_hash: z.string().trim().min(1).max(256),
    build_hash: z.string().trim().min(1).max(256),
    expected_build_hash: z.string().trim().min(1).max(256),
  })
  .strict();

export const IntegrityCheckResultSchema = z
  .object({
    state_hash_match: z.boolean(),
    build_hash_match: z.boolean(),
    ok: z.boolean(),
  })
  .strict();

export type IntegrityCheckInput = z.infer<typeof IntegrityCheckInputSchema>;
export type IntegrityCheckResult = z.infer<typeof IntegrityCheckResultSchema>;

export function parseIntegrityCheckInput(input: unknown): IntegrityCheckInput {
  return IntegrityCheckInputSchema.parse(input);
}

export function runIntegrityCheck(
  input: IntegrityCheckInput,
): IntegrityCheckResult {
  const parsed = parseIntegrityCheckInput(input);
  const state_hash_match = parsed.last_state_hash === parsed.current_state_hash;
  const build_hash_match = parsed.build_hash === parsed.expected_build_hash;

  return IntegrityCheckResultSchema.parse({
    state_hash_match,
    build_hash_match,
    ok: state_hash_match && build_hash_match,
  });
}
