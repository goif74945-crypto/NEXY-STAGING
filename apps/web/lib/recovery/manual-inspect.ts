import { z } from 'zod';

export const ManualInspectRecordSchema = z
  .object({
    universe_id: z.string().trim().min(1).max(256),
    mode: z.literal('manual_inspect'),
    required: z.boolean(),
    summary: z.string().trim().min(1).max(4096),
  })
  .strict();

export type ManualInspectRecord = z.infer<typeof ManualInspectRecordSchema>;

export function parseManualInspectRecord(input: unknown): ManualInspectRecord {
  return ManualInspectRecordSchema.parse(input);
}

export function validateManualInspectRecord(input: unknown): boolean {
  return ManualInspectRecordSchema.safeParse(input).success;
}

export function buildManualInspectRecord(
  input: ManualInspectRecord,
): ManualInspectRecord {
  const parsed = parseManualInspectRecord(input);

  return {
    universe_id: parsed.universe_id,
    mode: parsed.mode,
    required: parsed.required,
    summary: parsed.summary,
  };
}
