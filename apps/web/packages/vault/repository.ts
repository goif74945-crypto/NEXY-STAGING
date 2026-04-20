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
  parseCommitKey,
  parseRepositoryEntityId,
  parseRevisionKey,
  compareVersion,
} from './versioning';
import {
  IntegrityPayloadSchema,
  Sha256HashSchema,
  hashCommit,
  hashPayload,
  hashRevision,
  verifyIntegrityEquality,
} from './integrity';

export const RepositoryEntitySnapshotSchema = z
  .object({
    entity_id: RepositoryEntityIdSchema,
    entity_type: z.string().trim().min(1).max(128),
    version: VersionStringSchema,
    payload: IntegrityPayloadSchema,
    snapshot_hash: Sha256HashSchema,
  })
  .strict();
export type RepositoryEntitySnapshot = z.infer<typeof RepositoryEntitySnapshotSchema>;

export const RepositoryRevisionRecordSchema = z
  .object({
    revision_key: RevisionKeySchema,
    entity_id: RepositoryEntityIdSchema,
    revision_index: RevisionIndexSchema,
    version: VersionStringSchema,
    payload: IntegrityPayloadSchema,
    payload_hash: Sha256HashSchema,
  })
  .strict();
export type RepositoryRevisionRecord = z.infer<typeof RepositoryRevisionRecordSchema>;

export const RepositoryCommitRecordSchema = z
  .object({
    commit_key: CommitKeySchema,
    entity_id: RepositoryEntityIdSchema,
    commit_index: CommitIndexSchema,
    version: VersionStringSchema,
    payload: IntegrityPayloadSchema,
    payload_hash: Sha256HashSchema,
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

function sortTextAscending(left: string, right: string): -1 | 0 | 1 {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

function compareSnapshots(
  left: RepositoryEntitySnapshot,
  right: RepositoryEntitySnapshot,
): -1 | 0 | 1 {
  return sortTextAscending(left.entity_id, right.entity_id);
}

function compareRevisions(
  left: RepositoryRevisionRecord,
  right: RepositoryRevisionRecord,
): -1 | 0 | 1 {
  const entityComparison = sortTextAscending(left.entity_id, right.entity_id);

  if (entityComparison !== 0) {
    return entityComparison;
  }

  if (left.revision_index < right.revision_index) {
    return -1;
  }

  if (left.revision_index > right.revision_index) {
    return 1;
  }

  return sortTextAscending(left.revision_key, right.revision_key);
}

function compareCommits(
  left: RepositoryCommitRecord,
  right: RepositoryCommitRecord,
): -1 | 0 | 1 {
  const entityComparison = sortTextAscending(left.entity_id, right.entity_id);

  if (entityComparison !== 0) {
    return entityComparison;
  }

  if (left.commit_index < right.commit_index) {
    return -1;
  }

  if (left.commit_index > right.commit_index) {
    return 1;
  }

  return sortTextAscending(left.commit_key, right.commit_key);
}

function sortSnapshots(
  snapshots: readonly RepositoryEntitySnapshot[],
): RepositoryEntitySnapshot[] {
  return [...snapshots].sort((left, right) => compareSnapshots(left, right));
}

function sortRevisions(
  revisions: readonly RepositoryRevisionRecord[],
): RepositoryRevisionRecord[] {
  return [...revisions].sort((left, right) => compareRevisions(left, right));
}

function sortCommits(
  commits: readonly RepositoryCommitRecord[],
): RepositoryCommitRecord[] {
  return [...commits].sort((left, right) => compareCommits(left, right));
}

function assertSnapshotHash(snapshot: RepositoryEntitySnapshot): void {
  const expectedHash = hashPayload(snapshot.payload);
  const verification = verifyIntegrityEquality(snapshot.snapshot_hash, expectedHash);

  if (!verification.matches) {
    throw new Error(`Snapshot hash mismatch for entity ${snapshot.entity_id}`);
  }
}

function assertRevisionIntegrity(revision: RepositoryRevisionRecord): void {
  const expectedKey = buildRevisionKey(
    revision.entity_id,
    revision.revision_index,
    revision.version,
  );

  if (expectedKey !== revision.revision_key) {
    throw new Error(`Revision key mismatch for entity ${revision.entity_id}`);
  }

  const expectedHash = hashRevision({
    entity_id: revision.entity_id,
    revision_index: revision.revision_index,
    version: revision.version,
    payload: revision.payload,
  });
  const verification = verifyIntegrityEquality(revision.payload_hash, expectedHash);

  if (!verification.matches) {
    throw new Error(`Revision payload hash mismatch for revision ${revision.revision_key}`);
  }
}

function assertCommitIntegrity(commit: RepositoryCommitRecord): void {
  const expectedKey = buildCommitKey(
    commit.entity_id,
    commit.commit_index,
    commit.version,
  );

  if (expectedKey !== commit.commit_key) {
    throw new Error(`Commit key mismatch for entity ${commit.entity_id}`);
  }

  const expectedHash = hashCommit({
    entity_id: commit.entity_id,
    commit_index: commit.commit_index,
    version: commit.version,
    payload: commit.payload,
  });
  const verification = verifyIntegrityEquality(commit.payload_hash, expectedHash);

  if (!verification.matches) {
    throw new Error(`Commit payload hash mismatch for commit ${commit.commit_key}`);
  }
}

function assertNoDuplicateSnapshotEntityIds(
  snapshots: readonly RepositoryEntitySnapshot[],
): void {
  const seen = new Set<string>();

  for (const snapshot of snapshots) {
    if (seen.has(snapshot.entity_id)) {
      throw new Error(`Duplicate snapshot entity_id: ${snapshot.entity_id}`);
    }

    seen.add(snapshot.entity_id);
  }
}

function assertNoDuplicateRevisionKeys(
  revisions: readonly RepositoryRevisionRecord[],
): void {
  const seen = new Set<string>();

  for (const revision of revisions) {
    if (seen.has(revision.revision_key)) {
      throw new Error(`Duplicate revision key: ${revision.revision_key}`);
    }

    seen.add(revision.revision_key);
  }
}

function assertNoDuplicateRevisionIndexes(
  revisions: readonly RepositoryRevisionRecord[],
): void {
  const seen = new Set<string>();

  for (const revision of revisions) {
    const compound = `${revision.entity_id}:${revision.revision_index}`;

    if (seen.has(compound)) {
      throw new Error(
        `Duplicate revision index for entity ${revision.entity_id}: ${revision.revision_index}`,
      );
    }

    seen.add(compound);
  }
}

function assertNoDuplicateCommitKeys(
  commits: readonly RepositoryCommitRecord[],
): void {
  const seen = new Set<string>();

  for (const commit of commits) {
    if (seen.has(commit.commit_key)) {
      throw new Error(`Duplicate commit key: ${commit.commit_key}`);
    }

    seen.add(commit.commit_key);
  }
}

function assertNoDuplicateCommitIndexes(
  commits: readonly RepositoryCommitRecord[],
): void {
  const seen = new Set<string>();

  for (const commit of commits) {
    const compound = `${commit.entity_id}:${commit.commit_index}`;

    if (seen.has(compound)) {
      throw new Error(
        `Duplicate commit index for entity ${commit.entity_id}: ${commit.commit_index}`,
      );
    }

    seen.add(compound);
  }
}

function assertRepositoryStateIntegrity(state: RepositoryState): void {
  for (const snapshot of state.snapshots) {
    assertSnapshotHash(snapshot);
  }

  for (const revision of state.revisions) {
    assertRevisionIntegrity(revision);
  }

  for (const commit of state.commits) {
    assertCommitIntegrity(commit);
  }

  assertNoDuplicateSnapshotEntityIds(state.snapshots);
  assertNoDuplicateRevisionKeys(state.revisions);
  assertNoDuplicateRevisionIndexes(state.revisions);
  assertNoDuplicateCommitKeys(state.commits);
  assertNoDuplicateCommitIndexes(state.commits);
}

function parseStateInternal(input: unknown): RepositoryState {
  const state = RepositoryStateSchema.parse(input);
  assertRepositoryStateIntegrity(state);
  return state;
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
  const state = parseRepositoryState(stateInput);
  const snapshot = parseRepositoryEntitySnapshot(snapshotInput);

  const expectedHash = hashPayload(snapshot.payload);
  const verification = verifyIntegrityEquality(snapshot.snapshot_hash, expectedHash);

  if (!verification.matches) {
    throw new Error(`Snapshot hash mismatch for entity ${snapshot.entity_id}`);
  }

  const nextSnapshots = sortSnapshots(
    state.snapshots
      .filter((existingSnapshot) => existingSnapshot.entity_id !== snapshot.entity_id)
      .concat([snapshot]),
  );

  const matchingCount = nextSnapshots.filter(
    (existingSnapshot) => existingSnapshot.entity_id === snapshot.entity_id,
  ).length;

  if (matchingCount !== 1) {
    throw new Error(`Snapshot uniqueness violation for entity ${snapshot.entity_id}`);
  }

  return RepositoryStateSchema.parse({
    snapshots: nextSnapshots,
    revisions: sortRevisions(state.revisions),
    commits: sortCommits(state.commits),
  });
}

export function appendRevision(
  stateInput: unknown,
  revisionInput: unknown,
): RepositoryState {
  const state = parseRepositoryState(stateInput);
  const revision = parseRepositoryRevisionRecord(revisionInput);

  const expectedKey = buildRevisionKey(
    revision.entity_id,
    revision.revision_index,
    revision.version,
  );

  if (expectedKey !== revision.revision_key) {
    throw new Error(`Revision key mismatch for entity ${revision.entity_id}`);
  }

  const expectedHash = hashRevision({
    entity_id: revision.entity_id,
    revision_index: revision.revision_index,
    version: revision.version,
    payload: revision.payload,
  });
  const verification = verifyIntegrityEquality(revision.payload_hash, expectedHash);

  if (!verification.matches) {
    throw new Error(`Revision payload hash mismatch for revision ${revision.revision_key}`);
  }

  const duplicateByKey = state.revisions.some(
    (existingRevision) => existingRevision.revision_key === revision.revision_key,
  );

  if (duplicateByKey) {
    throw new Error(`Duplicate revision key: ${revision.revision_key}`);
  }

  const duplicateByIndex = state.revisions.some(
    (existingRevision) =>
      existingRevision.entity_id === revision.entity_id &&
      existingRevision.revision_index === revision.revision_index,
  );

  if (duplicateByIndex) {
    throw new Error(
      `Duplicate revision index for entity ${revision.entity_id}: ${revision.revision_index}`,
    );
  }

  const nextRevisions = sortRevisions([...state.revisions, revision]);

  return RepositoryStateSchema.parse({
    snapshots: sortSnapshots(state.snapshots),
    revisions: nextRevisions,
    commits: sortCommits(state.commits),
  });
}

export function appendCommit(
  stateInput: unknown,
  commitInput: unknown,
): RepositoryState {
  const state = parseRepositoryState(stateInput);
  const commit = parseRepositoryCommitRecord(commitInput);

  const expectedKey = buildCommitKey(
    commit.entity_id,
    commit.commit_index,
    commit.version,
  );

  if (expectedKey !== commit.commit_key) {
    throw new Error(`Commit key mismatch for entity ${commit.entity_id}`);
  }

  const expectedHash = hashCommit({
    entity_id: commit.entity_id,
    commit_index: commit.commit_index,
    version: commit.version,
    payload: commit.payload,
  });
  const verification = verifyIntegrityEquality(commit.payload_hash, expectedHash);

  if (!verification.matches) {
    throw new Error(`Commit payload hash mismatch for commit ${commit.commit_key}`);
  }

  const duplicateByKey = state.commits.some(
    (existingCommit) => existingCommit.commit_key === commit.commit_key,
  );

  if (duplicateByKey) {
    throw new Error(`Duplicate commit key: ${commit.commit_key}`);
  }

  const duplicateByIndex = state.commits.some(
    (existingCommit) =>
      existingCommit.entity_id === commit.entity_id &&
      existingCommit.commit_index === commit.commit_index,
  );

  if (duplicateByIndex) {
    throw new Error(
      `Duplicate commit index for entity ${commit.entity_id}: ${commit.commit_index}`,
    );
  }

  const nextCommits = sortCommits([...state.commits, commit]);

  return RepositoryStateSchema.parse({
    snapshots: sortSnapshots(state.snapshots),
    revisions: sortRevisions(state.revisions),
    commits: nextCommits,
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

  const maxRevisionIndex = history[history.length - 1].revision_index;
  const latestCandidates = history.filter(
    (revision) => revision.revision_index === maxRevisionIndex,
  );

  if (latestCandidates.length > 1) {
    throw new Error(
      `Multiple latest revisions found for entity ${latestCandidates[0].entity_id}: ${maxRevisionIndex}`,
    );
  }

  return latestCandidates[0];
}

export function getRevisionHistoryByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): RepositoryRevisionRecord[] {
  const state = parseRepositoryState(stateInput);
  const entityId = parseRepositoryEntityId(entityIdInput);

  const history = sortRevisions(
    state.revisions.filter((revision) => revision.entity_id === entityId),
  );

  const seenIndexes = new Set<number>();

  for (const revision of history) {
    if (seenIndexes.has(revision.revision_index)) {
      throw new Error(
        `Duplicate revision index for entity ${entityId}: ${revision.revision_index}`,
      );
    }

    seenIndexes.add(revision.revision_index);
  }

  return history;
}

export function getCommitHistoryByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): RepositoryCommitRecord[] {
  const state = parseRepositoryState(stateInput);
  const entityId = parseRepositoryEntityId(entityIdInput);

  const history = sortCommits(
    state.commits.filter((commit) => commit.entity_id === entityId),
  );

  const seenIndexes = new Set<number>();

  for (const commit of history) {
    if (seenIndexes.has(commit.commit_index)) {
      throw new Error(`Duplicate commit index for entity ${entityId}: ${commit.commit_index}`);
    }

    seenIndexes.add(commit.commit_index);
  }

  return history;
}

export function parseRepositoryEntitySnapshot(input: unknown): RepositoryEntitySnapshot {
  return RepositoryEntitySnapshotSchema.parse(input);
}

export function validateRepositoryEntitySnapshot(input: unknown): boolean {
  return RepositoryEntitySnapshotSchema.safeParse(input).success;
}

export function parseRepositoryRevisionRecord(input: unknown): RepositoryRevisionRecord {
  const parsed = RepositoryRevisionRecordSchema.parse(input);
  parseRevisionKey(parsed.revision_key);
  return parsed;
}

export function validateRepositoryRevisionRecord(input: unknown): boolean {
  return RepositoryRevisionRecordSchema.safeParse(input).success;
}

export function parseRepositoryCommitRecord(input: unknown): RepositoryCommitRecord {
  const parsed = RepositoryCommitRecordSchema.parse(input);
  parseCommitKey(parsed.commit_key);
  return parsed;
}

export function validateRepositoryCommitRecord(input: unknown): boolean {
  return RepositoryCommitRecordSchema.safeParse(input).success;
}

export function parseRepositoryState(input: unknown): RepositoryState {
  return parseStateInternal(input);
}

export function validateRepositoryState(input: unknown): boolean {
  const schemaResult = RepositoryStateSchema.safeParse(input);

  if (!schemaResult.success) {
    return false;
  }

  try {
    assertRepositoryStateIntegrity(schemaResult.data);
    return true;
  } catch {
    return false;
  }
}​