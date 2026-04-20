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
  parseRepositoryEntityId,
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

function compareText(left: string, right: string): -1 | 0 | 1 {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

function compareSnapshots(left: RepositoryEntitySnapshot, right: RepositoryEntitySnapshot): -1 | 0 | 1 {
  return compareText(left.entity_id, right.entity_id);
}

function compareRevisions(left: RepositoryRevisionRecord, right: RepositoryRevisionRecord): -1 | 0 | 1 {
  const entityComparison = compareText(left.entity_id, right.entity_id);

  if (entityComparison !== 0) {
    return entityComparison;
  }

  if (left.revision_index < right.revision_index) {
    return -1;
  }

  if (left.revision_index > right.revision_index) {
    return 1;
  }

  return compareText(left.revision_key, right.revision_key);
}

function compareCommits(left: RepositoryCommitRecord, right: RepositoryCommitRecord): -1 | 0 | 1 {
  const entityComparison = compareText(left.entity_id, right.entity_id);

  if (entityComparison !== 0) {
    return entityComparison;
  }

  if (left.commit_index < right.commit_index) {
    return -1;
  }

  if (left.commit_index > right.commit_index) {
    return 1;
  }

  return compareText(left.commit_key, right.commit_key);
}

function sortSnapshots(snapshots: readonly RepositoryEntitySnapshot[]): RepositoryEntitySnapshot[] {
  return [...snapshots].sort((left, right) => compareSnapshots(left, right));
}

function sortRevisions(revisions: readonly RepositoryRevisionRecord[]): RepositoryRevisionRecord[] {
  return [...revisions].sort((left, right) => compareRevisions(left, right));
}

function sortCommits(commits: readonly RepositoryCommitRecord[]): RepositoryCommitRecord[] {
  return [...commits].sort((left, right) => compareCommits(left, right));
}

function assertSnapshotHash(snapshot: RepositoryEntitySnapshot): void {
  const verification = verifyIntegrityEquality(snapshot.snapshot_hash, hashPayload(snapshot.payload));

  if (!verification.matches) {
    throw new Error(`Snapshot hash mismatch for entity ${snapshot.entity_id}`);
  }
}

function assertRevisionIntegrity(revision: RepositoryRevisionRecord): void {
  const expectedKey = buildRevisionKey(revision.entity_id, revision.revision_index, revision.version);

  if (expectedKey !== revision.revision_key) {
    throw new Error(`Revision key mismatch for entity ${revision.entity_id}`);
  }

  const expectedHash = hashRevision({
    entity_id: revision.entity_id,
    revision_index: revision.revision_index,
    version: revision.version,
    payload: revision.payload,
  });

  if (!verifyIntegrityEquality(revision.payload_hash, expectedHash).matches) {
    throw new Error(`Revision payload hash mismatch for revision ${revision.revision_key}`);
  }
}

function assertCommitIntegrity(commit: RepositoryCommitRecord): void {
  const expectedKey = buildCommitKey(commit.entity_id, commit.commit_index, commit.version);

  if (expectedKey !== commit.commit_key) {
    throw new Error(`Commit key mismatch for entity ${commit.entity_id}`);
  }

  const expectedHash = hashCommit({
    entity_id: commit.entity_id,
    commit_index: commit.commit_index,
    version: commit.version,
    payload: commit.payload,
  });

  if (!verifyIntegrityEquality(commit.payload_hash, expectedHash).matches) {
    throw new Error(`Commit payload hash mismatch for commit ${commit.commit_key}`);
  }
}

function assertSnapshotUniqueness(snapshots: readonly RepositoryEntitySnapshot[]): void {
  const seen = new Set<string>();

  for (const snapshot of snapshots) {
    if (seen.has(snapshot.entity_id)) {
      throw new Error(`Duplicate snapshot entity_id: ${snapshot.entity_id}`);
    }

    seen.add(snapshot.entity_id);
  }
}

function assertRevisionUniqueness(revisions: readonly RepositoryRevisionRecord[]): void {
  const revisionKeys = new Set<string>();
  const revisionIndexes = new Set<string>();

  for (const revision of revisions) {
    if (revisionKeys.has(revision.revision_key)) {
      throw new Error(`Duplicate revision key: ${revision.revision_key}`);
    }

    const compoundKey = `${revision.entity_id}:${revision.revision_index}`;

    if (revisionIndexes.has(compoundKey)) {
      throw new Error(`Duplicate revision index for entity ${revision.entity_id}: ${revision.revision_index}`);
    }

    revisionKeys.add(revision.revision_key);
    revisionIndexes.add(compoundKey);
  }
}

function assertCommitUniqueness(commits: readonly RepositoryCommitRecord[]): void {
  const commitKeys = new Set<string>();
  const commitIndexes = new Set<string>();

  for (const commit of commits) {
    if (commitKeys.has(commit.commit_key)) {
      throw new Error(`Duplicate commit key: ${commit.commit_key}`);
    }

    const compoundKey = `${commit.entity_id}:${commit.commit_index}`;

    if (commitIndexes.has(compoundKey)) {
      throw new Error(`Duplicate commit index for entity ${commit.entity_id}: ${commit.commit_index}`);
    }

    commitKeys.add(commit.commit_key);
    commitIndexes.add(compoundKey);
  }
}

function assertCanonicalOrdering(state: RepositoryState): void {
  const sortedSnapshots = sortSnapshots(state.snapshots);
  const sortedRevisions = sortRevisions(state.revisions);
  const sortedCommits = sortCommits(state.commits);

  if (JSON.stringify(state.snapshots) !== JSON.stringify(sortedSnapshots)) {
    throw new Error('Snapshots are not in canonical order.');
  }

  if (JSON.stringify(state.revisions) !== JSON.stringify(sortedRevisions)) {
    throw new Error('Revisions are not in canonical order.');
  }

  if (JSON.stringify(state.commits) !== JSON.stringify(sortedCommits)) {
    throw new Error('Commits are not in canonical order.');
  }
}

function assertStateIntegrity(state: RepositoryState): void {
  assertCanonicalOrdering(state);
  assertSnapshotUniqueness(state.snapshots);
  assertRevisionUniqueness(state.revisions);
  assertCommitUniqueness(state.commits);

  for (const snapshot of state.snapshots) {
    assertSnapshotHash(snapshot);
  }

  for (const revision of state.revisions) {
    assertRevisionIntegrity(revision);
  }

  for (const commit of state.commits) {
    assertCommitIntegrity(commit);
  }
}

export function parseRepositoryEntitySnapshot(input: unknown): RepositoryEntitySnapshot {
  const parsed = RepositoryEntitySnapshotSchema.parse(input);
  assertSnapshotHash(parsed);
  return parsed;
}

export function validateRepositoryEntitySnapshot(input: unknown): boolean {
  try {
    parseRepositoryEntitySnapshot(input);
    return true;
  } catch {
    return false;
  }
}

export function parseRepositoryRevisionRecord(input: unknown): RepositoryRevisionRecord {
  const parsed = RepositoryRevisionRecordSchema.parse(input);
  assertRevisionIntegrity(parsed);
  return parsed;
}

export function validateRepositoryRevisionRecord(input: unknown): boolean {
  try {
    parseRepositoryRevisionRecord(input);
    return true;
  } catch {
    return false;
  }
}

export function parseRepositoryCommitRecord(input: unknown): RepositoryCommitRecord {
  const parsed = RepositoryCommitRecordSchema.parse(input);
  assertCommitIntegrity(parsed);
  return parsed;
}

export function validateRepositoryCommitRecord(input: unknown): boolean {
  try {
    parseRepositoryCommitRecord(input);
    return true;
  } catch {
    return false;
  }
}

export function parseRepositoryState(input: unknown): RepositoryState {
  const parsed = RepositoryStateSchema.parse(input);
  assertStateIntegrity(parsed);
  return parsed;
}

export function validateRepositoryState(input: unknown): boolean {
  try {
    parseRepositoryState(input);
    return true;
  } catch {
    return false;
  }
}

export function createEmptyRepositoryState(): RepositoryState {
  return parseRepositoryState({
    snapshots: [],
    revisions: [],
    commits: [],
  });
}

export function upsertEntitySnapshot(stateInput: unknown, snapshotInput: unknown): RepositoryState {
  const state = parseRepositoryState(stateInput);
  const snapshot = parseRepositoryEntitySnapshot(snapshotInput);

  const nextSnapshots = sortSnapshots(
    state.snapshots
      .filter((existingSnapshot) => existingSnapshot.entity_id !== snapshot.entity_id)
      .concat([snapshot]),
  );

  if (nextSnapshots.filter((item) => item.entity_id === snapshot.entity_id).length !== 1) {
    throw new Error(`Snapshot uniqueness violation for entity ${snapshot.entity_id}`);
  }

  return parseRepositoryState({
    snapshots: nextSnapshots,
    revisions: sortRevisions(state.revisions),
    commits: sortCommits(state.commits),
  });
}

export function appendRevision(stateInput: unknown, revisionInput: unknown): RepositoryState {
  const state = parseRepositoryState(stateInput);
  const revision = parseRepositoryRevisionRecord(revisionInput);

  const duplicateByKey = state.revisions.some((item) => item.revision_key === revision.revision_key);
  const duplicateByIndex = state.revisions.some(
    (item) => item.entity_id === revision.entity_id && item.revision_index === revision.revision_index,
  );

  if (duplicateByKey) {
    throw new Error(`Duplicate revision key: ${revision.revision_key}`);
  }

  if (duplicateByIndex) {
    throw new Error(`Duplicate revision index for entity ${revision.entity_id}: ${revision.revision_index}`);
  }

  return parseRepositoryState({
    snapshots: sortSnapshots(state.snapshots),
    revisions: sortRevisions([...state.revisions, revision]),
    commits: sortCommits(state.commits),
  });
}

export function appendCommit(stateInput: unknown, commitInput: unknown): RepositoryState {
  const state = parseRepositoryState(stateInput);
  const commit = parseRepositoryCommitRecord(commitInput);

  const duplicateByKey = state.commits.some((item) => item.commit_key === commit.commit_key);
  const duplicateByIndex = state.commits.some(
    (item) => item.entity_id === commit.entity_id && item.commit_index === commit.commit_index,
  );

  if (duplicateByKey) {
    throw new Error(`Duplicate commit key: ${commit.commit_key}`);
  }

  if (duplicateByIndex) {
    throw new Error(`Duplicate commit index for entity ${commit.entity_id}: ${commit.commit_index}`);
  }

  return parseRepositoryState({
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

  const latestIndex = history[history.length - 1].revision_index;
  const latestCandidates = history.filter((item) => item.revision_index === latestIndex);

  if (latestCandidates.length !== 1) {
    throw new Error(`Multiple latest revisions found for entity ${latestCandidates[0]?.entity_id ?? parseRepositoryEntityId(entityIdInput)}: ${latestIndex}`);
  }

  return latestCandidates[0];
}

export function getRevisionHistoryByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): RepositoryRevisionRecord[] {
  const state = parseRepositoryState(stateInput);
  const entityId = parseRepositoryEntityId(entityIdInput);
  return sortRevisions(state.revisions.filter((item) => item.entity_id === entityId));
}

export function getCommitHistoryByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): RepositoryCommitRecord[] {
  const state = parseRepositoryState(stateInput);
  const entityId = parseRepositoryEntityId(entityIdInput);
  return sortCommits(state.commits.filter((item) => item.entity_id === entityId));
}
