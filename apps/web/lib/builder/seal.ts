import { z } from 'zod';

export const SealInputSchema = z
  .object({
    spec_hash: z.string().trim().min(1).max(256),
    artifact_hash: z.string().trim().min(1).max(256),
    sealed: z.boolean(),
  })
  .strict();

export const SealRecordSchema = z
  .object({
    spec_hash: z.string().trim().min(1).max(256),
    artifact_hash: z.string().trim().min(1).max(256),
    sealed: z.boolean(),
  })
  .strict();

export type SealInput = z.infer<typeof SealInputSchema>;
export type SealRecord = z.infer<typeof SealRecordSchema>;

export function buildSealRecord(input: SealInput): SealRecord {
  const parsed = SealInputSchema.parse(input);

  return SealRecordSchema.parse({
    spec_hash: parsed.spec_hash,
    artifact_hash: parsed.artifact_hash,
    sealed: parsed.sealed,
  });
}

export function parseSealInput(input: unknown): SealInput {
  return SealInputSchema.parse(input);
}
