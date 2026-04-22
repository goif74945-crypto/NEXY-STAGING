import { z } from 'zod';

export const UniverseTerminateRecordSchema = z
  .object({
    universe_id: z.string().trim().min(1).max(256),
    state: z.literal('terminated'),
    quota: z.string().trim().min(1).max(256),
    quarantined: z.boolean(),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export type UniverseTerminateRecord = z.infer<
  typeof UniverseTerminateRecordSchema
>;

export function parseUniverseTerminateRecord(
  input: unknown,
): UniverseTerminateRecord {
  return UniverseTerminateRecordSchema.parse(input);
}

export function validateUniverseTerminateRecord(input: unknown): boolean {
  return UniverseTerminateRecordSchema.safeParse(input).success;
}

export function buildUniverseTerminateRecord(
  input: UniverseTerminateRecord,
): UniverseTerminateRecord {
  const parsed = parseUniverseTerminateRecord(input);

  return {
    universe_id: parsed.universe_id,
    state: parsed.state,
    quota: parsed.quota,
    quarantined: parsed.quarantined,
    reason: parsed.reason,
  };
}
