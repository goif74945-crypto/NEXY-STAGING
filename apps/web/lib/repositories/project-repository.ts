import { z } from 'zod';

export const ProjectIdSchema = z.string().trim().min(1).max(128);
export type ProjectId = z.infer<typeof ProjectIdSchema>;

export const ProjectStatusSchema = z.enum(['active', 'frozen', 'archived']);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectRecordSchema = z
  .object({
    project_id: ProjectIdSchema,
    name: z.string().trim().min(1).max(256),
    owner_subject: z.string().trim().min(1).max(256),
    status: ProjectStatusSchema,
    created_at_epoch_ms: z.number().int().nonnegative(),
    updated_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.updated_at_epoch_ms < value.created_at_epoch_ms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'updated_at_epoch_ms must be greater than or equal to created_at_epoch_ms.',
      });
    }
  });
export type ProjectRecord = z.infer<typeof ProjectRecordSchema>;

export const ProjectRepositoryStateSchema = z
  .object({
    records: z.array(ProjectRecordSchema),
  })
  .strict();
export type ProjectRepositoryState = z.infer<typeof ProjectRepositoryStateSchema>;

function compareProjectRecords(left: ProjectRecord, right: ProjectRecord): -1 | 0 | 1 {
  if (left.created_at_epoch_ms > right.created_at_epoch_ms) {
    return -1;
  }

  if (left.created_at_epoch_ms < right.created_at_epoch_ms) {
    return 1;
  }

  if (left.project_id < right.project_id) {
    return -1;
  }

  if (left.project_id > right.project_id) {
    return 1;
  }

  return 0;
}

function sortProjectRecords(records: readonly ProjectRecord[]): ProjectRecord[] {
  return [...records].sort((left, right) => compareProjectRecords(left, right));
}

function ensureNoDuplicateProjectIds(records: readonly ProjectRecord[]): void {
  const seen = new Set<string>();

  for (const record of records) {
    if (seen.has(record.project_id)) {
      throw new Error(`Duplicate project_id: ${record.project_id}`);
    }

    seen.add(record.project_id);
  }
}

function parseStateInternal(input: unknown): ProjectRepositoryState {
  const state = ProjectRepositoryStateSchema.parse(input);
  ensureNoDuplicateProjectIds(state.records);

  return ProjectRepositoryStateSchema.parse({
    records: sortProjectRecords(state.records),
  });
}

export function createEmptyProjectRepositoryState(): ProjectRepositoryState {
  return ProjectRepositoryStateSchema.parse({
    records: [],
  });
}

export function insertProjectRecord(
  stateInput: unknown,
  recordInput: unknown,
): ProjectRepositoryState {
  const state = parseStateInternal(stateInput);
  const record = ProjectRecordSchema.parse(recordInput);

  if (state.records.some((existingRecord) => existingRecord.project_id === record.project_id)) {
    throw new Error(`Duplicate project_id: ${record.project_id}`);
  }

  return ProjectRepositoryStateSchema.parse({
    records: sortProjectRecords([...state.records, record]),
  });
}

export function updateProjectRecord(
  stateInput: unknown,
  recordInput: unknown,
): ProjectRepositoryState {
  const state = parseStateInternal(stateInput);
  const record = ProjectRecordSchema.parse(recordInput);

  const exists = state.records.some((existingRecord) => existingRecord.project_id === record.project_id);

  if (!exists) {
    throw new Error(`Project not found: ${record.project_id}`);
  }

  return ProjectRepositoryStateSchema.parse({
    records: sortProjectRecords(
      state.records.map((existingRecord) =>
        existingRecord.project_id === record.project_id ? record : existingRecord,
      ),
    ),
  });
}

export function getProjectById(
  stateInput: unknown,
  projectIdInput: unknown,
): ProjectRecord | null {
  const state = parseStateInternal(stateInput);
  const project_id = ProjectIdSchema.parse(projectIdInput);

  return state.records.find((record) => record.project_id === project_id) ?? null;
}

export function listProjects(stateInput: unknown): ProjectRecord[] {
  const state = parseStateInternal(stateInput);
  return [...state.records];
}

export function listProjectsByOwnerSubject(
  stateInput: unknown,
  ownerSubjectInput: unknown,
): ProjectRecord[] {
  const state = parseStateInternal(stateInput);
  const owner_subject = z.string().trim().min(1).max(256).parse(ownerSubjectInput);

  return sortProjectRecords(
    state.records.filter((record) => record.owner_subject === owner_subject),
  );
}

export function listProjectsByStatus(
  stateInput: unknown,
  statusInput: unknown,
): ProjectRecord[] {
  const state = parseStateInternal(stateInput);
  const status = ProjectStatusSchema.parse(statusInput);

  return sortProjectRecords(
    state.records.filter((record) => record.status === status),
  );
}