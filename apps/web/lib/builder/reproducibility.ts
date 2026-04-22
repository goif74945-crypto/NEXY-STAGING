import { z } from 'zod';

export const ReproducibilityCheckInputSchema = z
  .object({
    spec_hash: z.string().trim().min(1).max(256),
    artifact_hash: z.string().trim().min(1).max(256),
    expected_artifact_hash: z.string().trim().min(1).max(256),
  })
  .strict();

export const ReproducibilityCheckResultSchema = z
  .object({
    spec_hash: z.string().trim().min(1).max(256),
    artifact_hash: z.string().trim().min(1).max(256),
    expected_artifact_hash: z.string().trim().min(1).max(256),
    reproducible: z.boolean(),
  })
  .strict();

export type ReproducibilityCheckInput = z.infer<typeof ReproducibilityCheckInputSchema>;
export type ReproducibilityCheckResult = z.infer<typeof ReproducibilityCheckResultSchema>;

export function checkReproducibility(
  input: ReproducibilityCheckInput,
): ReproducibilityCheckResult {
  const parsed = ReproducibilityCheckInputSchema.parse(input);

  return ReproducibilityCheckResultSchema.parse({
    spec_hash: parsed.spec_hash,
    artifact_hash: parsed.artifact_hash,
    expected_artifact_hash: parsed.expected_artifact_hash,
    reproducible: parsed.artifact_hash === parsed.expected_artifact_hash,
  });
}

export function parseReproducibilityCheckInput(
  input: unknown,
): ReproducibilityCheckInput {
  return ReproducibilityCheckInputSchema.parse(input);
}
