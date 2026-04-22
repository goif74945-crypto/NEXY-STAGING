import { z } from 'zod';

export const UniverseIsolationSchema = z
  .object({
    container_sandbox: z.boolean(),
    namespace_isolation: z.boolean(),
    syscall_filter: z.boolean(),
    memory_isolation: z.boolean(),
    wasm_mode: z.boolean(),
  })
  .strict();

export type UniverseIsolation = z.infer<typeof UniverseIsolationSchema>;

export function parseUniverseIsolation(input: unknown): UniverseIsolation {
  return UniverseIsolationSchema.parse(input);
}

export function validateUniverseIsolation(input: unknown): boolean {
  return UniverseIsolationSchema.safeParse(input).success;
}

export function evaluateUniverseIsolationReady(
  input: UniverseIsolation,
): boolean {
  const parsed = parseUniverseIsolation(input);

  return (
    parsed.container_sandbox &&
    parsed.namespace_isolation &&
    parsed.syscall_filter &&
    parsed.memory_isolation
  );
}
