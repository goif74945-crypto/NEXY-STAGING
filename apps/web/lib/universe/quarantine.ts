import { z } from 'zod';

export const UniverseQuarantineRecordSchema = z
  .object({
    universe_id: z.string().trim().min(1).max(256),
    state: z.literal('quarantined'),
    quota: z.string().trim().min(1).max(256),
    quarantined: z.literal(true),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export type UniverseQuarantineRecord = z.infer<
  typeof UniverseQuarantineRecordSchema
>;

export function parseUniverseQuarantineRecord(
  input: unknown,
): UniverseQuarantineRecord {
  return UniverseQuarantineRecordSchema.parse(input);
}

export function validateUniverseQuarantineRecord(input: unknown): boolean {
  return UniverseQuarantineRecordSchema.safeParse(input).success;
}

export function buildUniverseQuarantineRecord(
  input: UniverseQuarantineRecord,
): UniverseQuarantineRecord {
  const parsed = parseUniverseQuarantineRecord(input);

  return {
    universe_id: parsed.universe_id,
    state: parsed.state,
    quota: parsed.quota,
    quarantined: parsed.quarantined,
    reason: parsed.reason,
  };
}
