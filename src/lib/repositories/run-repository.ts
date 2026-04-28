import { z } from 'zod';

import { OutputClassSchema } from '@/lib/types/output-class';

export const RunRepositoryRecordSchema = z
  .object({
    run_id: z.string().trim().min(1),
    directive_id: z.string().trim().min(1),
    status: z.string().trim().min(1),
    output_class: OutputClassSchema,
    started_at_epoch_ms: z.number().int().nonnegative(),
    updated_at_epoch_ms: z.number().int().nonnegative(),
    freeze_reason: z.string(),
  })
  .strict();

export type RunRepositoryRecord = z.infer<typeof RunRepositoryRecordSchema>;

function buildRunRecords(): RunRepositoryRecord[] {
  return [
    RunRepositoryRecordSchema.parse({
      run_id: 'run_001',
      directive_id: 'directive_001',
      status: 'stable',
      output_class: 'FINAL',
      started_at_epoch_ms: 1700000000000,
      updated_at_epoch_ms: 1700000010000,
      freeze_reason: '',
    }),
    RunRepositoryRecordSchema.parse({
      run_id: 'run_002',
      directive_id: 'directive_002',
      status: 'verifying',
      output_class: 'CLEAN',
      started_at_epoch_ms: 1700000020000,
      updated_at_epoch_ms: 1700000030000,
      freeze_reason: '',
    }),
  ];
}

function cloneRunRecord(record: RunRepositoryRecord): RunRepositoryRecord {
  return RunRepositoryRecordSchema.parse({
    run_id: record.run_id,
    directive_id: record.directive_id,
    status: record.status,
    output_class: record.output_class,
    started_at_epoch_ms: record.started_at_epoch_ms,
    updated_at_epoch_ms: record.updated_at_epoch_ms,
    freeze_reason: record.freeze_reason,
  });
}

export function listRuns(): RunRepositoryRecord[] {
  return buildRunRecords().map(cloneRunRecord);
}

export function getRunById(runId: string): RunRepositoryRecord | null {
  const run = buildRunRecords().find((record) => record.run_id === runId);

  return run === undefined ? null : cloneRunRecord(run);
}

export function listRecentRuns(): RunRepositoryRecord[] {
  return buildRunRecords()
    .slice()
    .sort((left, right) => {
      if (left.updated_at_epoch_ms !== right.updated_at_epoch_ms) {
        return right.updated_at_epoch_ms - left.updated_at_epoch_ms;
      }

      return left.run_id.localeCompare(right.run_id);
    })
    .map(cloneRunRecord);
}
