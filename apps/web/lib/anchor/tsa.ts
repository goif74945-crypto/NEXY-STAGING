import { z } from 'zod';

export const TsaRecordSchema = z
  .object({
    anchor_id: z.string().trim().min(1).max(256),
    tsa_epoch_ms: z.number().int().nonnegative(),
    time_policy: z.string().trim().min(1).max(256),
  })
  .strict();

export type TsaRecord = z.infer<typeof TsaRecordSchema>;

export function parseTsaRecord(input: unknown): TsaRecord {
  return TsaRecordSchema.parse(input);
}

export function validateTsaRecord(input: unknown): boolean {
  return TsaRecordSchema.safeParse(input).success;
}

export function buildTsaRecord(input: unknown): TsaRecord {
  const parsed = parseTsaRecord(input);

  return {
    anchor_id: parsed.anchor_id,
    tsa_epoch_ms: parsed.tsa_epoch_ms,
    time_policy: parsed.time_policy,
  };
}
