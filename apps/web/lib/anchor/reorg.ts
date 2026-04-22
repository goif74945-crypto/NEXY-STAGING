import { z } from 'zod';

export const AnchorReorgRecordSchema = z
  .object({
    anchor_id: z.string().trim().min(1).max(256),
    detected: z.boolean(),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export type AnchorReorgRecord = z.infer<typeof AnchorReorgRecordSchema>;

export function parseAnchorReorgRecord(input: unknown): AnchorReorgRecord {
  return AnchorReorgRecordSchema.parse(input);
}

export function validateAnchorReorgRecord(input: unknown): boolean {
  return AnchorReorgRecordSchema.safeParse(input).success;
}

export function buildAnchorReorgRecord(input: unknown): AnchorReorgRecord {
  const parsed = parseAnchorReorgRecord(input);

  return {
    anchor_id: parsed.anchor_id,
    detected: parsed.detected,
    reason: parsed.reason,
  };
}
