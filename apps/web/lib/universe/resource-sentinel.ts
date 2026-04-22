import { z } from 'zod';

export const ResourceSentinelSchema = z
  .object({
    cpu_ok: z.boolean(),
    memory_ok: z.boolean(),
    disk_ok: z.boolean(),
    network_ok: z.boolean(),
    healthy: z.boolean(),
  })
  .strict();

export type ResourceSentinel = z.infer<typeof ResourceSentinelSchema>;

export function parseResourceSentinel(input: unknown): ResourceSentinel {
  return ResourceSentinelSchema.parse(input);
}

export function validateResourceSentinel(input: unknown): boolean {
  return ResourceSentinelSchema.safeParse(input).success;
}

export function buildResourceSentinel(
  input: ResourceSentinel,
): ResourceSentinel {
  const parsed = parseResourceSentinel(input);
  const healthy =
    parsed.cpu_ok && parsed.memory_ok && parsed.disk_ok && parsed.network_ok;

  if (parsed.healthy !== healthy) {
    throw new Error('Illegal resource sentinel contradiction.');
  }

  return {
    cpu_ok: parsed.cpu_ok,
    memory_ok: parsed.memory_ok,
    disk_ok: parsed.disk_ok,
    network_ok: parsed.network_ok,
    healthy,
  };
}
