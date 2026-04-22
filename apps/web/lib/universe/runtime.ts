import { z } from 'zod';

export const UniverseRuntimeSchema = z
  .object({
    universe_id: z.string().trim().min(1).max(256),
    runtime_type: z.string().trim().min(1).max(128),
    execution_mode: z.string().trim().min(1).max(128),
    sealed_spec_hash: z.string().trim().min(1).max(256),
    active: z.boolean(),
  })
  .strict();

export type UniverseRuntime = z.infer<typeof UniverseRuntimeSchema>;

export function parseUniverseRuntime(input: unknown): UniverseRuntime {
  return UniverseRuntimeSchema.parse(input);
}

export function validateUniverseRuntime(input: unknown): boolean {
  return UniverseRuntimeSchema.safeParse(input).success;
}

export function buildUniverseRuntime(input: UniverseRuntime): UniverseRuntime {
  const parsed = parseUniverseRuntime(input);

  return {
    universe_id: parsed.universe_id,
    runtime_type: parsed.runtime_type,
    execution_mode: parsed.execution_mode,
    sealed_spec_hash: parsed.sealed_spec_hash,
    active: parsed.active,
  };
}
