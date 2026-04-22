import { z } from 'zod';

export const MemoryGuardSchema = z
  .object({
    limit_bytes: z.number().int().nonnegative(),
    used_bytes: z.number().int().nonnegative(),
    hard_stop: z.boolean(),
    ok: z.boolean(),
  })
  .strict();

export type MemoryGuard = z.infer<typeof MemoryGuardSchema>;

export function parseMemoryGuard(input: unknown): MemoryGuard {
  return MemoryGuardSchema.parse(input);
}

export function validateMemoryGuard(input: unknown): boolean {
  return MemoryGuardSchema.safeParse(input).success;
}

export function buildMemoryGuard(input: MemoryGuard): MemoryGuard {
  const parsed = parseMemoryGuard(input);
  const ok = parsed.used_bytes <= parsed.limit_bytes;

  if (parsed.ok !== ok) {
    throw new Error('Illegal memory guard contradiction.');
  }

  return {
    limit_bytes: parsed.limit_bytes,
    used_bytes: parsed.used_bytes,
    hard_stop: parsed.hard_stop,
    ok,
  };
}
