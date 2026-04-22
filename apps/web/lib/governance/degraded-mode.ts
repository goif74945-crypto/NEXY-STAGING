import { z } from 'zod';

export const DegradedModeSchema = z
  .object({
    enabled: z.boolean(),
    reason: z.string().trim().min(1).max(4096),
    boundary: z.string().trim().min(1).max(256),
  })
  .strict();

export type DegradedMode = z.infer<typeof DegradedModeSchema>;

export function parseDegradedMode(input: unknown): DegradedMode {
  return DegradedModeSchema.parse(input);
}

export function validateDegradedMode(input: unknown): boolean {
  return DegradedModeSchema.safeParse(input).success;
}

export function buildDegradedMode(input: DegradedMode): DegradedMode {
  const parsed = parseDegradedMode(input);

  return {
    enabled: parsed.enabled,
    reason: parsed.reason,
    boundary: parsed.boundary,
  };
}
