import { z } from 'zod';

export const RunIdSchema = z.string().trim().min(1).max(128);
export type RunId = z.infer<typeof RunIdSchema>;

export const RunStatusSchema = z.enum([
  'queued',
  'running',
  'verifying',
  'consensus',
  'stable',
  'freeze',
  'failed',
]);
export type RunStatus = z.infer<typeof RunStatusSchema>;

export const RunRecordSchema = z
  .object({
    run_id: RunIdSchema,
    directive_id: z.string().trim().min(1).max(128),
    session_id: z.string().trim().min(1).max(128),
    status: RunStatusSchema,
    started_at_epoch_ms: z.number().int().nonnegative(),
    updated_at_epoch_ms: z.number().int().nonnegative(),
    ended_at_epoch_ms: z.number().int().nonnegative().optional(),
    output_class: z.string().trim().min(1).max(128).optional(),
    freeze_reason: z.string().trim().min(1).max(1024).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.updated_at_epoch_ms < value.started_at_epoch_ms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'updated_at_epoch_ms must be greater than or equal to started_at_epoch_ms.',
      });
    }

    if (value.ended_at_epoch_ms !== undefined && value.ended_at_epoch_ms < value.started_at_epoch_ms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ended_at_epoch_ms must be greater than or equal to started_at_epoch_ms.',
      });
    }
  });
export type RunRecord = z.infer<typeof RunRecordSchema>;

export const RunRepositoryStateSchema = z
  .object({
    records: z.array(RunRecordSchema),
  })
  .strict();
export type RunRepositoryState = z.infer<typeof RunRepositoryStateSchema>;

function compareRunRecords(left: RunRecord, right: RunRecord): -1 | 0 | 1 {
  if (left.started_at_epoch_ms > right.started_at_epoch_ms) {
    return -1;
  }

  if (left.started_at_epoch_ms < right.started_at_epoch_ms) {
    return 1;
  }

  if (left.run_id < right.run_id) {
    return -1;
  }

  if (left.run_id > right.run_id) {
    return 1;
  }

  return 0;
}

function sortRunRecords(records: readonly RunRecord[]): RunRecord[] {
  return [...records].sort((left, right) => compareRunRecords(left, right));
}

function ensureNoDuplicateRunIds(records: readonly RunRecord[]): void {
  const seen = new Set<string>();

  for (const record of records) {
    if (seen.has(record.run_id)) {
      throw new Error(`Duplicate run_id: ${record.run_id}`);
    }

    seen.add(record.run_id);
  }
}

function parseStateInternal(input: unknown): RunRepositoryState {
  const state = RunRepositoryStateSchema.parse(input);
  ensureNoDuplicateRunIds(state.records);

  return RunRepositoryStateSchema.parse({
    records: sortRunRecords(state.records),
  });
}

export function parseRunRecord(input: unknown): RunRecord {
  return RunRecordSchema.parse(input);
}

export function validateRunRecord(input: unknown): boolean {
  return RunRecordSchema.safeParse(input).success;
}

export function parseRunRepositoryState(input: unknown): RunRepositoryState {
  return parseStateInternal(input);
}

export function validateRunRepositoryState(input: unknown): boolean {
  const schemaResult = RunRepositoryStateSchema.safeParse(input);

  if (!schemaResult.success) {
    return false;
  }

  try {
    ensureNoDuplicateRunIds(schemaResult.data.records);
    return true;
  } catch {
    return false;
  }
}

export function createEmptyRunRepositoryState(): RunRepositoryState {
  return RunRepositoryStateSchema.parse({
    records: [],
  });
}

export function insertRunRecord(
  stateInput: unknown,
  recordInput: unknown,
): RunRepositoryState {
  const state = parseStateInternal(stateInput);
  const record = RunRecordSchema.parse(recordInput);

  if (state.records.some((existingRecord) => existingRecord.run_id === record.run_id)) {
    throw new Error(`Duplicate run_id: ${record.run_id}`);
  }

  return RunRepositoryStateSchema.parse({
    records: sortRunRecords([...state.records, record]),
  });
}

export function updateRunRecord(
  stateInput: unknown,
  recordInput: unknown,
): RunRepositoryState {
  const state = parseStateInternal(stateInput);
  const record = RunRecordSchema.parse(recordInput);

  const exists = state.records.some((existingRecord) => existingRecord.run_id === record.run_id);

  if (!exists) {
    throw new Error(`Run not found: ${record.run_id}`);
  }

  return RunRepositoryStateSchema.parse({
    records: sortRunRecords(
      state.records.map((existingRecord) =>
        existingRecord.run_id === record.run_id ? record : existingRecord,
      ),
    ),
  });
}

export function getRunById(
  stateInput: unknown,
  runIdInput: unknown,
): RunRecord | null {
  const state = parseStateInternal(stateInput);
  const run_id = RunIdSchema.parse(runIdInput);

  return state.records.find((record) => record.run_id === run_id) ?? null;
}

export function listRuns(stateInput: unknown): RunRecord[] {
  const state = parseStateInternal(stateInput);
  return [...state.records];
}

export function listRecentRuns(
  stateInput: unknown,
  limitInput?: unknown,
): RunRecord[] {
  const records = listRuns(stateInput);

  if (limitInput === undefined) {
    return records;
  }

  const limit = z.number().int().nonnegative().parse(limitInput);
  return records.slice(0, limit);
}

export function listRunsBySessionId(
  stateInput: unknown,
  sessionIdInput: unknown,
): RunRecord[] {
  const state = parseStateInternal(stateInput);
  const session_id = z.string().trim().min(1).max(128).parse(sessionIdInput);

  return sortRunRecords(
    state.records.filter((record) => record.session_id === session_id),
  );
}

export function listRunsByStatus(
  stateInput: unknown,
  statusInput: unknown,
): RunRecord[] {
  const state = parseStateInternal(stateInput);
  const status = RunStatusSchema.parse(statusInput);

  return sortRunRecords(
    state.records.filter((record) => record.status === status),
  );
}