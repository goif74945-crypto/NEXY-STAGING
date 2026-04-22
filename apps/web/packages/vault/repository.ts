import { z } from 'zod';

import {
  CommitIndexSchema,
  EntityIdSchema,
  nextCommitIndex,
  nextRevisionIndex,
  RevisionIndexSchema,
} from './versioning';

export const HashSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/, 'Hash must be lowercase SHA-256 hex.');
export type Hash = z.infer<typeof HashSchema>;

export const VersionSchema = z
  .string()
  .trim()
  .regex(/^\d+\.\d+\.\d+$/, 'Version must be normalized as MAJOR.MINOR.PATCH.');
export type Version = z.infer<typeof VersionSchema>;

export const EntitySnapshotSchema = z
  .object({
    entity_id: EntityIdSchema,
    version: VersionSchema,
    payload_hash: HashSchema,
    payload: z.unknown(),
  })
  .strict();
export type EntitySnapshot = z.infer<typeof EntitySnapshotSchema>;

export const RevisionRecordSchema = z
  .object({
    entity_id: EntityIdSchema,
    revision_index: RevisionIndexSchema,
    revision_key: z.string().trim().min(1).max(512),
    previous_revision_key: z.string().trim().min(1).max(512).optional(),
    snapshot: EntitySnapshotSchema,
    revision_hash: HashSchema,
  })
  .strict();
export type RevisionRecord = z.infer<typeof RevisionRecordSchema>;

export const CommitRecordSchema = z
  .object({
    entity_id: EntityIdSchema,
    commit_index: CommitIndexSchema,
    commit_key: z.string().trim().min(1).max(1024),
    revision_key: z.string().trim().min(1).max(512),
    revision_hash: HashSchema,
    commit_hash: HashSchema,
    author: z.string().trim().min(1).max(128),
    message: z.string().trim().min(1).max(2048),
  })
  .strict();
export type CommitRecord = z.infer<typeof CommitRecordSchema>;

export const RepositoryStateSchema = z
  .object({
    entities: z.record(EntityIdSchema, EntitySnapshotSchema),
    revisions: z.array(RevisionRecordSchema),
    commits: z.array(CommitRecordSchema),
  })
  .strict();
export type RepositoryState = z.infer<typeof RepositoryStateSchema>;

export function validateRepositoryState(input: unknown) {
  return RepositoryStateSchema.safeParse(input);
}

export function parseRepositoryState(input: unknown): RepositoryState {
  return RepositoryStateSchema.parse(input);
}

export function validateEntitySnapshot(input: unknown) {
  return EntitySnapshotSchema.safeParse(input);
}

export function parseEntitySnapshot(input: unknown): EntitySnapshot {
  return EntitySnapshotSchema.parse(input);
}

export function validateRevisionRecord(input: unknown) {
  return RevisionRecordSchema.safeParse(input);
}

export function parseRevisionRecord(input: unknown): RevisionRecord {
  return RevisionRecordSchema.parse(input);
}

export function validateCommitRecord(input: unknown) {
  return CommitRecordSchema.safeParse(input);
}

export function parseCommitRecord(input: unknown): CommitRecord {
  return CommitRecordSchema.parse(input);
}

function sortEntitySnapshots(
  entities: Record<string, EntitySnapshot>,
): Record<string, EntitySnapshot> {
  const sortedEntries = Object.entries(entities).sort(([leftId], [rightId]) =>
    leftId.localeCompare(rightId),
  );

  return Object.fromEntries(sortedEntries);
}

export function createEmptyRepositoryState(): RepositoryState {
  return RepositoryStateSchema.parse({
    entities: {},
    revisions: [],
    commits: [],
  });
}

export function upsertEntitySnapshot(
  stateInput: unknown,
  snapshotInput: unknown,
): RepositoryState {
  const state = parseRepositoryState(stateInput);
  const snapshot = parseEntitySnapshot(snapshotInput);

  return RepositoryStateSchema.parse({
    ...state,
    entities: sortEntitySnapshots({
      ...state.entities,
      [snapshot.entity_id]: snapshot,
    }),
  });
}

export function appendRevision(
  stateInput: unknown,
  revisionInput: unknown,
): RepositoryState {
  const state = parseRepositoryState(stateInput);
  const revision = parseRevisionRecord(revisionInput);

  if (revision.snapshot.entity_id !== revision.entity_id) {
    throw new Error('Revision snapshot entity_id must match revision entity_id.');
  }

  const revisionHistory = getRevisionHistoryByEntityId(state, revision.entity_id);
  const expectedRevisionIndex = nextRevisionIndex(
    revisionHistory.map((entry) => entry.revision_index),
  );

  if (revision.revision_index !== expectedRevisionIndex) {
    throw new Error(`Invalid revision_index: expected ${expectedRevisionIndex}.`);
  }

  const hasDuplicateRevisionKey = state.revisions.some(
    (entry) => entry.revision_key === revision.revision_key,
  );

  if (hasDuplicateRevisionKey) {
    throw new Error('Revision key already exists.');
  }

  if (revisionHistory.length > 0) {
    const latestRevision = revisionHistory[revisionHistory.length - 1];

    if (revision.previous_revision_key !== latestRevision.revision_key) {
      throw new Error('previous_revision_key must point to the latest entity revision.');
    }
  } else if (revision.previous_revision_key) {
    throw new Error('previous_revision_key is not allowed for first revision.');
  }

  return RepositoryStateSchema.parse({
    ...upsertEntitySnapshot(state, revision.snapshot),
    revisions: [...state.revisions, revision],
  });
}

export function appendCommit(stateInput: unknown, commitInput: unknown): RepositoryState {
  const state = parseRepositoryState(stateInput);
  const commit = parseCommitRecord(commitInput);

  const commitHistory = getCommitHistoryByEntityId(state, commit.entity_id);
  const expectedCommitIndex = nextCommitIndex(commitHistory.map((entry) => entry.commit_index));

  if (commit.commit_index !== expectedCommitIndex) {
    throw new Error(`Invalid commit_index: expected ${expectedCommitIndex}.`);
  }

  const hasDuplicateCommitKey = state.commits.some((entry) => entry.commit_key === commit.commit_key);

  if (hasDuplicateCommitKey) {
    throw new Error('Commit key already exists.');
  }

  const targetRevision = state.revisions.find(
    (entry) => entry.entity_id === commit.entity_id && entry.revision_key === commit.revision_key,
  );

  if (!targetRevision) {
    throw new Error('Commit must reference an existing revision for the same entity.');
  }

  if (targetRevision.revision_hash !== commit.revision_hash) {
    throw new Error('Commit revision_hash must match the referenced revision hash.');
  }

  return RepositoryStateSchema.parse({
    ...state,
    commits: [...state.commits, commit],
  });
}

export function getLatestRevision(
  stateInput: unknown,
  entityIdInput: unknown,
): RevisionRecord | null {
  const state = parseRepositoryState(stateInput);
  const entityId = EntityIdSchema.parse(entityIdInput);
  const revisionHistory = getRevisionHistoryByEntityId(state, entityId);

  if (revisionHistory.length === 0) {
    return null;
  }

  return revisionHistory[revisionHistory.length - 1];
}

export function getRevisionHistoryByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): RevisionRecord[] {
  const state = parseRepositoryState(stateInput);
  const entityId = EntityIdSchema.parse(entityIdInput);

  return state.revisions
    .filter((entry) => entry.entity_id === entityId)
    .sort((left, right) => left.revision_index - right.revision_index);
}

export function getCommitHistoryByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): CommitRecord[] {
  const state = parseRepositoryState(stateInput);
  const entityId = EntityIdSchema.parse(entityIdInput);

  return state.commits
    .filter((entry) => entry.entity_id === entityId)
    .sort((left, right) => left.commit_index - right.commit_index);
}
