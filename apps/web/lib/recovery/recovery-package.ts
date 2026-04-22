import { z } from 'zod';

import { RecoveryPackageSchema } from '../schemas/recovery-package';

export const RecoveryPackageRecordSchema = RecoveryPackageSchema;

export type RecoveryPackageRecord = z.infer<typeof RecoveryPackageRecordSchema>;

export function parseRecoveryPackageRecord(
  input: unknown,
): RecoveryPackageRecord {
  return RecoveryPackageRecordSchema.parse(input);
}

export function validateRecoveryPackageRecord(input: unknown): boolean {
  return RecoveryPackageRecordSchema.safeParse(input).success;
}

export function buildRecoveryPackageRecord(
  input: RecoveryPackageRecord,
): RecoveryPackageRecord {
  const parsed = parseRecoveryPackageRecord(input);

  return {
    package_id: parsed.package_id,
    universe_id: parsed.universe_id,
    created_at_epoch_ms: parsed.created_at_epoch_ms,
    summary: parsed.summary,
  };
}
