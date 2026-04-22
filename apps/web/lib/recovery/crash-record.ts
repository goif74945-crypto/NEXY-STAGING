import { z } from 'zod';

export const CrashRecordSchema = z
  .object({
    crash_id: z.string().trim().min(1).max(256),
    universe_id: z.string().trim().min(1).max(256),
    before_state_hash: z.string().trim().min(1).max(256),
    after_state_hash: z.string().trim().min(1).max(256),
    summary: z.string().trim().min(1).max(4096),
  })
  .strict();

export type CrashRecord = z.infer<typeof CrashRecordSchema>;

export function parseCrashRecord(input: unknown): CrashRecord {
  return CrashRecordSchema.parse(input);
}

export function validateCrashRecord(input: unknown): boolean {
  return CrashRecordSchema.safeParse(input).success;
}

export function buildCrashRecord(input: CrashRecord): CrashRecord {
  const parsed = parseCrashRecord(input);

  return {
    crash_id: parsed.crash_id,
    universe_id: parsed.universe_id,
    before_state_hash: parsed.before_state_hash,
    after_state_hash: parsed.after_state_hash,
    summary: parsed.summary,
  };
}
