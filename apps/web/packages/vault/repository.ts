import { z } from 'zod';

import {
  CommitIndexSchema,
  CommitKeySchema,
  RepositoryEntityIdSchema,
  RevisionIndexSchema,
  RevisionKeySchema,
  VersionStringSchema,
  buildCommitKey,
  buildRevisionKey,
  compareVersion,
  normalizeVersionString,
  parseCommitKey,
  parseRepositoryEntityId,
  parseRevisionKey,
  parseRevisionIndex,
  parseCommitIndex,
  validateCommitKey,
  validateRevisionKey,
} from './versioning';
import {
  IntegrityPayloadSchema,
  Sha256HashSchema,
  hashCommit,
  hashPayload,
  hashRevision,
  parseIntegrityPayload,
  verifyIntegrityEquality,
} from './integrity';

type RepositoryJsonPrimitive = string | number | boolean | null;
type RepositoryJsonValue =
  | RepositoryJsonPrimitive
  | RepositoryJsonValue[]
  | { [key: string]: RepositoryJsonValue };

const RepositoryJsonPrimitiveSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

export const RepositoryJsonValueSchema: z.ZodType<RepositoryJsonValue> = z.lazy(() =>
  z.union([
    RepositoryJsonPrimitiveSchema,
    z.array(RepositoryJsonValueSchema),
    z.record(RepositoryJsonValueSchema),
  ]),
);
export type RepositoryJson = z.infer<typeof RepositoryJsonValueSchema>;

export const RepositoryEntityTypeSchema = z.string().trim().min(1).max(128);
export type RepositoryEntityType = z.infer<typeof RepositoryEntityTypeSchema>;

export const RepositoryEntitySnapshotSchema = z
  .object({
    entity_id: RepositoryEntityIdSchema,
    entity_type: RepositoryEntityTypeSchema,
    version: VersionStringSchema,
    revision_index: RevisionIndexSchema,
    commit_index: CommitIndexSchema,
    revision_key: RevisionKeySchema,
    commit_key: CommitKeySchema,
    materialized_state: RepositoryJsonValueSchema,
    integrity_hash: Sha256HashSchema,
    integrity_payload: IntegrityPayloadSchema,
  })
  .strict();
export type RepositoryEntitySnapshot = z.infer<typeof RepositoryEntitySnapshotSchema>;

export const RepositoryRevisionRecordSchema = z
  .object({
    revision_key: RevisionKeySchema,
    revision_index: RevisionIndexSchema,
    entity_id: RepositoryEntityIdSchema,
    entity_type: RepositoryEntityTypeSchema,
    version: VersionStringSchema,
    payload: RepositoryJsonValueSchema,
    integrity_hash: Sha256HashSchema,
    integrity_payload: IntegrityPayloadSchema,
  })
  .strict();
export type RepositoryRevisionRecord = z.infer<typeof RepositoryRevisionRecordSchema>;

export const RepositoryCommitRecordSchema = z
  .object({
    commit_key: CommitKeySchema,
    commit_index: CommitIndexSchema,
    entity_id: RepositoryEntityIdSchema,
    entity_type: RepositoryEntityTypeSchema,
    version: VersionStringSchema,
    revision_key: RevisionKeySchema,
    payload: RepositoryJsonValueSchema,
    integrity_hash: Sha256HashSchema,
    integrity_payload: IntegrityPayloadSchema,
  })
  .strict();
export type RepositoryCommitRecord = z.infer<typeof RepositoryCommitRecordSchema>;

export const RepositoryStateSchema = z
  .object({
    snapshots: z.array(RepositoryEntitySnapshotSchema),
    revisions: z.array(RepositoryRevisionRecordSchema),
    commits: z.array(RepositoryCommitRecordSchema),
  })
  .strict();
export type RepositoryState = z.infer<typeof RepositoryStateSchema>;

export const EntitySnapshotInputSchema = z
  .object({
    entity_id: RepositoryEntityIdSchema,
    entity_type: RepositoryEntityTypeSchema,
    version: VersionStringSchema,
    revision_index: RevisionIndexSchema,
    commit_index: CommitIndexSchema,
    materialized_state: RepositoryJsonValueSchema,
  })
  .strict();
export type EntitySnapshotInput = z.infer<typeof EntitySnapshotInputSchema>;

export const RevisionAppendInputSchema = z
  .object({
    entity_id: RepositoryEntityIdSchema,
    entity_type: RepositoryEntityTypeSchema,
    version: VersionStringSchema,
    revision_index: RevisionIndexSchema,
    payload: RepositoryJsonValueSchema,
  })
  .strict();
export type RevisionAppendInput = z.infer<typeof RevisionAppendInputSchema>;

export const CommitAppendInputSchema = z
  .object({
    entity_id: RepositoryEntityIdSchema,
    entity_type: RepositoryEntityTypeSchema,
    version: VersionStringSchema,
    commit_index: CommitIndexSchema,
    revision_key: RevisionKeySchema,
    payload: RepositoryJsonValueSchema,
  })
  .strict();
export type CommitAppendInput = z.infer<typeof CommitAppendInputSchema>;

function sortSnapshots(input: readonly RepositoryEntitySnapshot[]): RepositoryEntitySnapshot[] {
  return [...input].sort((left, right) => {
    if (left.entity_id < right.entity_id) {
      return -1;
    }

    if (left.entity_id > right.entity_id) {
      return 1;
    }

    if (left.revision_index < right.revision_index) {
      return -1;
    }

    if (left.revision_index > right.revision_index) {
      return 1;
    }

    const versionComparison = compareVersion(left.version, right.version);
    if (versionComparison !== 0) {
      return versionComparison;
    }

    if (left.commit_index < right.commit_index) {
      return -1;
    }

    if (left.commit_index > right.commit_index) {
      return 1;
    }

    return 0;
  });
}

function sortRevisions(input: readonly RepositoryRevisionRecord[]): RepositoryRevisionRecord[] {
  return [...input].sort((left, right) => {
    if (left.entity_id < right.entity_id) {
      return -1;
    }

    if (left.entity_id > right.entity_id) {
      return 1;
    }

    if (left.revision_index < right.revision_index) {
      return -1;
    }

    if (left.revision_index > right.revision_index) {
      return 1;
    }

    const versionComparison = compareVersion(left.version, right.version);
    if (versionComparison !== 0) {
      return versionComparison;
    }

    if (left.revision_key < right.revision_key) {
      return -1;
    }

    if (left.revision_key > right.revision_key) {
      return 1;
    }

    return 0;
  });
}

function sortCommits(input: readonly RepositoryCommitRecord[]): RepositoryCommitRecord[] {
  return [...input].sort((left, right) => {
    if (left.entity_id < right.entity_id) {
      return -1;
    }

    if (left.entity_id > right.entity_id) {
      return 1;
    }

    if (left.commit_index < right.commit_index) {
      return -1;
    }

    if (left.commit_index > right.commit_index) {
      return 1;
    }

    const versionComparison = compareVersion(left.version, right.version);
    if (versionComparison !== 0) {
      return versionComparison;
    }

    if (left.commit_key < right.commit_key) {
      return -1;
    }

    if (left.commit_key > right.commit_key) {
      return 1;
    }

    return 0;
  });
}

function buildSnapshotRecord(input: EntitySnapshotInput): RepositoryEntitySnapshot {
  const normalizedVersion = normalizeVersionString(input.version);
  const revision_key = buildRevisionKey(input.entity_id, input.revision_index, normalizedVersion);
  const commit_key = buildCommitKey(input.entity_id, input.commit_index, normalizedVersion);
  const integrity_payload = hashPayload({
    entity_id: input.entity_id,
    entity_type: input.entity_type,
    version: normalizedVersion,
    revision_index: input.revision_index,
    commit_index: input.commit_index,
    materialized_state: input.materialized_state,
  });

  return RepositoryEntitySnapshotSchema.parse({
    entity_id: input.entity_id,
    entity_type: input.entity_type,
    version: normalizedVersion,
    revision_index: input.revision_index,
    commit_index: input.commit_index,
    revision_key,
    commit_key,
    materialized_state: input.materialized_state,
    integrity_hash: integrity_payload.sha256,
    integrity_payload,
  });
}

function buildRevisionRecord(input: RevisionAppendInput): RepositoryRevisionRecord {
  const normalizedVersion = normalizeVersionString(input.version);
  const revision_key = buildRevisionKey(input.entity_id, input.revision_index, normalizedVersion);
  const integrity_payload = hashRevision({
    entity_id: input.entity_id,
    entity_type: input.entity_type,
    version: normalizedVersion,
    revision_index: input.revision_index,
    payload: input.payload,
  });

  return RepositoryRevisionRecordSchema.parse({
    revision_key,
    revision_index: input.revision_index,
    entity_id: input.entity_id,
    entity_type: input.entity_type,
    version: normalizedVersion,
    payload: input.payload,
    integrity_hash: integrity_payload.sha256,
    integrity_payload,
  });
}

function buildCommitRecord(input: CommitAppendInput): RepositoryCommitRecord {
  const normalizedVersion = normalizeVersionString(input.version);
  const revision_key = parseRevisionKey(input.revision_key);
  const commit_key = buildCommitKey(input.entity_id, input.commit_index, normalizedVersion);
  const integrity_payload = hashCommit({
    entity_id: input.entity_id,
    entity_type: input.entity_type,
    version: normalizedVersion,
    commit_index: input.commit_index,
    revision_key,
    payload: input.payload,
  });

  return RepositoryCommitRecordSchema.parse({
    commit_key,
    commit_index: input.commit_index,
    entity_id: input.entity_id,
    entity_type: input.entity_type,
    version: normalizedVersion,
    revision_key,
    payload: input.payload,
    integrity_hash: integrity_payload.sha256,
    integrity_payload,
  });
}

export function createEmptyRepositoryState(): RepositoryState {
  return RepositoryStateSchema.parse({
    snapshots: [],
    revisions: [],
    commits: [],
  });
}

export function upsertEntitySnapshot(
  stateInput: unknown,
  snapshotInput: unknown,
): RepositoryState {
  const state = RepositoryStateSchema.parse(stateInput);
  const snapshot = buildSnapshotRecord(EntitySnapshotInputSchema.parse(snapshotInput));

  const snapshots = state.snapshots.filter(
    (existingSnapshot) => existingSnapshot.entity_id !== snapshot.entity_id,
  );

  snapshots.push(snapshot);

  return RepositoryStateSchema.parse({
    snapshots: sortSnapshots(snapshots),
    revisions: sortRevisions(state.revisions),
    commits: sortCommits(state.commits),
  });
}

export function appendRevision(
  stateInput: unknown,
  revisionInput: unknown,
): RepositoryState {
  const state = RepositoryStateSchema.parse(stateInput);
  const revision = buildRevisionRecord(RevisionAppendInputSchema.parse(revisionInput));

  if (!validateRevisionKey(revision.revision_key)) {
    throw new Error('Generated revision key is invalid.');
  }

  const duplicate = state.revisions.some(
    (existingRevision) => existingRevision.revision_key === revision.revision_key,
  );

  if (duplicate) {
    throw new Error(`Duplicate revision key: ${revision.revision_key}`);
  }

  return RepositoryStateSchema.parse({
    snapshots: sortSnapshots(state.snapshots),
    revisions: sortRevisions([...state.revisions, revision]),
    commits: sortCommits(state.commits),
  });
}

export function appendCommit(
  stateInput: unknown,
  commitInput: unknown,
): RepositoryState {
  const state = RepositoryStateSchema.parse(stateInput);
  const commit = buildCommitRecord(CommitAppendInputSchema.parse(commitInput));

  if (!validateCommitKey(commit.commit_key)) {
    throw new Error('Generated commit key is invalid.');
  }

  const duplicate = state.commits.some(
    (existingCommit) => existingCommit.commit_key === commit.commit_key,
  );

  if (duplicate) {
    throw new Error(`Duplicate commit key: ${commit.commit_key}`);
  }

  return RepositoryStateSchema.parse({
    snapshots: sortSnapshots(state.snapshots),
    revisions: sortRevisions(state.revisions),
    commits: sortCommits([...state.commits, commit]),
  });
}

export function getLatestRevision(
  stateInput: unknown,
  entityIdInput: unknown,
): RepositoryRevisionRecord | null {
  const history = getRevisionHistoryByEntityId(stateInput, entityIdInput);

  if (history.length === 0) {
    return null;
  }

  return history[history.length - 1];
}

export function getRevisionHistoryByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): RepositoryRevisionRecord[] {
  const state = RepositoryStateSchema.parse(stateInput);
  const entityId = parseRepositoryEntityId(entityIdInput);

  return sortRevisions(
    state.revisions.filter((revision) => revision.entity_id === entityId),
  );
}

export function getCommitHistoryByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): RepositoryCommitRecord[] {
  const state = RepositoryStateSchema.parse(stateInput);
  const entityId = parseRepositoryEntityId(entityIdInput);

  return sortCommits(
    state.commits.filter((commit) => commit.entity_id === entityId),
  );
}

export function parseRepositoryEntitySnapshot(
  input: unknown,
): RepositoryEntitySnapshot {
  return RepositoryEntitySnapshotSchema.parse(input);
}

export function parseRepositoryRevisionRecord(
  input: unknown,
): RepositoryRevisionRecord {
  return RepositoryRevisionRecordSchema.parse(input);
}

export function parseRepositoryCommitRecord(
  input: unknown,
): RepositoryCommitRecord {
  return RepositoryCommitRecordSchema.parse(input);
}

export function parseRepositoryState(input: unknown): RepositoryState {
  return RepositoryStateSchema.parse(input);
}

export function validateRepositoryEntitySnapshot(input: unknown): boolean {
  return RepositoryEntitySnapshotSchema.safeParse(input).success;
}

export function validateRepositoryRevisionRecord(input: unknown): boolean {
  return RepositoryRevisionRecordSchema.safeParse(input).success;
}

export function validateRepositoryCommitRecord(input: unknown): boolean {
  return RepositoryCommitRecordSchema.safeParse(input).success;
}

export function validateRepositoryState(input: unknown): boolean {
  return RepositoryStateSchema.safeParse(input).success;
}

export function validateRevisionIntegrity(recordInput: unknown): boolean {
  const record = RepositoryRevisionRecordSchema.parse(recordInput);
  const recomputed = hashRevision({
    entity_id: record.entity_id,
    entity_type: record.entity_type,
    version: record.version,
    revision_index: record.revision_index,
    payload: record.payload,
  });

  return verifyIntegrityEquality(record.integrity_payload, recomputed).matches;
}

export function validateCommitIntegrity(recordInput: unknown): boolean {
  const record = RepositoryCommitRecordSchema.parse(recordInput);
  const recomputed = hashCommit({
    entity_id: record.entity_id,
    entity_type: record.entity_type,
    version: record.version,
    commit_index: record.commit_index,
    revision_key: record.revision_key,
    payload: record.payload,
  });

  return verifyIntegrityEquality(record.integrity_payload, recomputed).matches;
}

export function validateSnapshotIntegrity(recordInput: unknown): boolean {
  const record = RepositoryEntitySnapshotSchema.parse(recordInput);
  const recomputed = hashPayload({
    entity_id: record.entity_id,
    entity_type: record.entity_type,
    version: record.version,
    revision_index: record.revision_index,
    commit_index: record.commit_index,
    materialized_state: record.materialized_state,
  });

  return verifyIntegrityEquality(record.integrity_payload, recomputed).matches;
}