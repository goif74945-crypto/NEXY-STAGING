import { z } from 'zod';

export const SnapshotRecordSchema = z
  .object({
    snapshot_id: z.string().trim().min(1).max(256),
    universe_id: z.string().trim().min(1).max(256),
    state_hash: z.string().trim().min(1).max(256),
    created_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

export type SnapshotRecord = z.infer<typeof SnapshotRecordSchema>;

export function parseSnapshotRecord(input: unknown): SnapshotRecord {
  return SnapshotRecordSchema.parse(input);
}

export function validateSnapshotRecord(input: unknown): boolean {
  return SnapshotRecordSchema.safeParse(input).success;
}

export function buildSnapshotRecord(input: SnapshotRecord): SnapshotRecord {
  const parsed = parseSnapshotRecord(input);

  return {
    snapshot_id: parsed.snapshot_id,
    universe_id: parsed.universe_id,
    state_hash: parsed.state_hash,
    created_at_epoch_ms: parsed.created_at_epoch_ms,
  };
}
