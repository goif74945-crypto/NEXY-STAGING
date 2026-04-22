import { z } from 'zod';

export const AmendmentRecordSchema = z
  .object({
    branch: z.string().trim().min(1).max(256),
    amendment_count: z.number().int().nonnegative(),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export type AmendmentRecord = z.infer<typeof AmendmentRecordSchema>;

export function parseAmendmentRecord(input: unknown): AmendmentRecord {
  return AmendmentRecordSchema.parse(input);
}

export function validateAmendmentRecord(input: unknown): boolean {
  return AmendmentRecordSchema.safeParse(input).success;
}

export function applyAmendment(input: AmendmentRecord): AmendmentRecord {
  const parsed = parseAmendmentRecord(input);

  return {
    branch: parsed.branch,
    amendment_count: parsed.amendment_count + 1,
    reason: parsed.reason,
  };
}
