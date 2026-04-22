import { z } from 'zod';

export const UniverseQuotaSchema = z
  .object({
    cpu_limit: z.string().trim().min(1).max(128),
    memory_limit: z.string().trim().min(1).max(128),
    disk_limit: z.string().trim().min(1).max(128),
    network_limit: z.string().trim().min(1).max(128),
    execution_timeout: z.string().trim().min(1).max(128),
  })
  .strict();

export type UniverseQuota = z.infer<typeof UniverseQuotaSchema>;

export function parseUniverseQuota(input: unknown): UniverseQuota {
  return UniverseQuotaSchema.parse(input);
}

export function validateUniverseQuota(input: unknown): boolean {
  return UniverseQuotaSchema.safeParse(input).success;
}

export function buildUniverseQuota(input: UniverseQuota): UniverseQuota {
  const parsed = parseUniverseQuota(input);

  return {
    cpu_limit: parsed.cpu_limit,
    memory_limit: parsed.memory_limit,
    disk_limit: parsed.disk_limit,
    network_limit: parsed.network_limit,
    execution_timeout: parsed.execution_timeout,
  };
}
