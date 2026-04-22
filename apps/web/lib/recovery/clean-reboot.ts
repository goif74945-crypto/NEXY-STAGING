import { z } from 'zod';

export const CleanRebootRecordSchema = z
  .object({
    universe_id: z.string().trim().min(1).max(256),
    mode: z.literal('clean_reboot'),
    ready: z.boolean(),
    summary: z.string().trim().min(1).max(4096),
  })
  .strict();

export type CleanRebootRecord = z.infer<typeof CleanRebootRecordSchema>;

export function parseCleanRebootRecord(input: unknown): CleanRebootRecord {
  return CleanRebootRecordSchema.parse(input);
}

export function validateCleanRebootRecord(input: unknown): boolean {
  return CleanRebootRecordSchema.safeParse(input).success;
}

export function buildCleanRebootRecord(
  input: CleanRebootRecord,
): CleanRebootRecord {
  const parsed = parseCleanRebootRecord(input);

  return {
    universe_id: parsed.universe_id,
    mode: parsed.mode,
    ready: parsed.ready,
    summary: parsed.summary,
  };
}
