import { z } from 'zod';

export const RegionKeySchema = z
  .object({
    region: z.string().trim().min(1).max(128),
    key_id: z.string().trim().min(1).max(256),
    active: z.boolean(),
    rotation_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

export type RegionKey = z.infer<typeof RegionKeySchema>;

export function parseRegionKey(input: unknown): RegionKey {
  return RegionKeySchema.parse(input);
}

export function validateRegionKey(input: unknown): boolean {
  return RegionKeySchema.safeParse(input).success;
}

export function buildRegionKey(input: RegionKey): RegionKey {
  const parsed = parseRegionKey(input);

  return {
    region: parsed.region,
    key_id: parsed.key_id,
    active: parsed.active,
    rotation_epoch_ms: parsed.rotation_epoch_ms,
  };
}
