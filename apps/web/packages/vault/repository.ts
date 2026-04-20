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
  parseCommitIndex,
  parseCommitKey,
  parseRepositoryEntityId,
  parseRevisionIndex,
  parseRevisionKey,
  parseVersionString,
  validateCommitKey,
  validateRevisionKey,
} from './versioning';
import {
  IntegrityPayloadSchema,
  IntegrityVerificationResultSchema,
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

function compareRevisionRecords(
  left: RepositoryRevisionRecord,
  right: RepositoryRevisionRecord,
): -1 | 0 | 1 {
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
}

function compareCommitRecords(
  left: RepositoryCommitRecord,
  right: RepositoryCommitRecord,
): -1 | 0 | 1 {
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
}

function compareSnapshots(
  left: RepositoryEntitySnapshot,
  right: RepositoryEntitySnapshot,
): -1 | 0 | 1 {
  if (left.entity_id < right.entity_id) {
    return -1;
  }

  if (left.entity_id > right.entity_id) {
    return 1;
  }

  if (left.entity_type < right.entity_type) {
    return -1;
  }

  if (left.entity_type > right.entity_type) {
    return 1;
  }

  return compareVersion(left.version, right.version);
}

function sortRevisionRecords(
  revisions: readonly RepositoryRevisionRecord[],
): RepositoryRevisionRecord[] {
  return [...revisions].sort((left, right) => compareRevisionRecords(left, right));
}

function sortCommitRecords(
  commits: readonly RepositoryCommitRecord[],
): RepositoryCommitRecord[] {
  return [...commits].sort((left, right) => compareCommitRecords(left, right));
}

function sortSnapshots(
  snapshots: readonly RepositoryEntitySnapshot[],
): RepositoryEntitySnapshot[] {
  return [...snapshots].sort((left, right) => compareSnapshots(left, right));
}

function assertUniqueRevisionIndexesForEntity(
  revisions: readonly RepositoryRevisionRecord[],
  entityId: RepositoryEntityId,
): void {
  const seen = new Set<number>();

  for (const revision of revisions) {
    if (revision.entity_id !== entityId) {
      continue;
    }

    if (seen.has(revision.revision_index)) {
      throw new Error(`Duplicate revision index for entity ${entityId}: ${revision.revision_index}`);
    }

    seen.add(revision.revision_index);
  }
}

function assertUniqueCommitIndexesForEntity(
  commits: readonly RepositoryCommitRecord[],
  entityId: RepositoryEntityId,
): void {
  const seen = new Set<number>();

  for (const commit of commits) {
    if (commit.entity_id !== entityId) {
      continue;
    }

    if (seen.has(commit.commit_index)) {
      throw new Error(`Duplicate commit index for entity ${entityId}: ${commit.commit_index}`);
    }

    seen.add(commit.commit_index);
  }
}

function verifySnapshotHash(snapshot: RepositoryEntitySnapshot): z.infer<typeof IntegrityVerificationResultSchema> {
  const actualHash = hashPayload(snapshot.payload);
  return verifyIntegrityEquality(snapshot.snapshot_hash, actualHash);
}

function verifyRevisionPayloadHash(
  revision: RepositoryRevisionRecord,
): z.infer<typeof IntegrityVerificationResultSchema> {
  const actualHash = hashRevision(revision.payload);
  return verifyIntegrityEquality(revision.payload_hash, actualHash);
}

function verifyCommitPayloadHash(
  commit: RepositoryCommitRecord,
): z.infer<typeof IntegrityVerificationResultSchema> {
  const actualHash = hashCommit(commit.payload);
  return verifyIntegrityEquality(commit.payload_hash, actualHash);
}

function assertSnapshotIntegrity(snapshot: RepositoryEntitySnapshot): void {
  const verification = verifySnapshotHash(snapshot);

  if (!verification.matches) {
    throw new Error(`Snapshot hash mismatch for entity ${snapshot.entity_id}`);
  }
}

function assertRevisionIntegrity(revision: RepositoryRevisionRecord): void {
  const expectedRevisionKey = buildRevisionKey(
    revision.entity_id,
    revision.revision_index,
    revision.version,
  );

  if (expectedRevisionKey !== revision.revision_key) {
    throw new Error(`Revision key mismatch for entity ${revision.entity_id}`);
  }

  const verification = verifyRevisionPayloadHash(revision);

  if (!verification.matches) {
    throw new Error(`Revision payload hash mismatch for revision ${revision.revision_key}`);
  }
}

function assertCommitIntegrity(commit: RepositoryCommitRecord): void {
  const expectedCommitKey = buildCommitKey(
    commit.entity_id,
    commit.commit_index,
    commit.version,
  );

  if (expectedCommitKey !== commit.commit_key) {
    throw new Error(`Commit key mismatch for entity ${commit.entity_id}`);
  }

  const verification = verifyCommitPayloadHash(commit);

  if (!verification.matches) {
    throw new Error(`Commit payload hash mismatch for commit ${commit.commit_key}`);
  }
}

function assertRepositoryStateIntegrity(state: RepositoryState): void {
  for (const snapshot of state.snapshots) {
    assertSnapshotIntegrity(snapshot);
  }

  for (const revision of state.revisions) {
    assertRevisionIntegrity(revision);
  }

  for (const commit of state.commits) {
    assertCommitIntegrity(commit);
  }

  const entityIds = new Set<string>([
    ...state.revisions.map((revision) => revision.entity_id),
    ...state.commits.map((commit) => commit.entity_id),
  ]);

  for (const entityId of entityIds) {
    assertUniqueRevisionIndexesForEntity(state.revisions, parseRepositoryEntityId(entityId));
    assertUniqueCommitIndexesForEntity(state.commits, parseRepositoryEntityId(entityId));
  }
}

function parseState(input: unknown): RepositoryState {
  const parsed = RepositoryStateSchema.parse(input);
  assertRepositoryStateIntegrity(parsed);
  return parsed;
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
  const state = parseState(stateInput);
  const snapshot = parseRepositoryEntitySnapshot(snapshotInput);

  assertSnapshotIntegrity(snapshot);

  const nextSnapshots = state.snapshots
    .filter((existingSnapshot) => existingSnapshot.entity_id !== snapshot.entity_id)
    .concat([snapshot]);

  return RepositoryStateSchema.parse({
    snapshots: sortSnapshots(nextSnapshots),
    revisions: sortRevisionRecords(state.revisions),
    commits: sortCommitRecords(state.commits),
  });
}

export function appendRevision(
  stateInput: unknown,
  revisionInput: unknown,
): RepositoryState {
  const state = parseState(stateInput);
  const revision = parseRepositoryRevisionRecord(revisionInput);

  assertRevisionIntegrity(revision);

  if (!validateRevisionKey(revision.revision_key)) {
    throw new Error(`Invalid revision key: ${revision.revision_key}`);
  }

  const duplicateRevisionKey = state.revisions.some(
    (existingRevision) => existingRevision.revision_key === revision.revision_key,
  );

  if (duplicateRevisionKey) {
    throw new Error(`Duplicate revision key: ${revision.revision_key}`);
  }

  const duplicateRevisionIndex = state.revisions.some(
    (existingRevision) =>
      existingRevision.entity_id === revision.entity_id &&
      existingRevision.revision_index === revision.revision_index,
  );

  if (duplicateRevisionIndex) {
    throw new Error(
      `Duplicate revision index for entity ${revision.entity_id}: ${revision.revision_index}`,
    );
  }

  const nextRevisions = sortRevisionRecords([...state.revisions, revision]);

  assertUniqueRevisionIndexesForEntity(nextRevisions, revision.entity_id);

  return RepositoryStateSchema.parse({
    snapshots: sortSnapshots(state.snapshots),
    revisions: nextRevisions,
    commits: sortCommitRecords(state.commits),
  });
}

export function appendCommit(
  stateInput: unknown,
  commitInput: unknown,
): RepositoryState {
  const state = parseState(stateInput);
  const commit = parseRepositoryCommitRecord(commitInput);

  assertCommitIntegrity(commit);

  if (!validateCommitKey(commit.commit_key)) {
    throw new Error(`Invalid commit key: ${commit.commit_key}`);
  }

  const duplicateCommitKey = state.commits.some(
    (existingCommit) => existingCommit.commit_key === commit.commit_key,
  );

  if (duplicateCommitKey) {
    throw new Error(`Duplicate commit key: ${commit.commit_key}`);
  }

  const duplicateCommitIndex = state.commits.some(
    (existingCommit) =>
      existingCommit.entity_id === commit.entity_id &&
      existingCommit.commit_index === commit.commit_index,
  );

  if (duplicateCommitIndex) {
    throw new Error(
      `Duplicate commit index for entity ${commit.entity_id}: ${commit.commit_index}`,
    );
  }

  const nextCommits = sortCommitRecords([...state.commits, commit]);

  assertUniqueCommitIndexesForEntity(nextCommits, commit.entity_id);

  return RepositoryStateSchema.parse({
    snapshots: sortSnapshots(state.snapshots),
    revisions: sortRevisionRecords(state.revisions),
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

  return history[history.length - 1];
}

export function getRevisionHistoryByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): RepositoryRevisionRecord[] {
  const state = parseState(stateInput);
  const entityId = parseRepositoryEntityId(entityIdInput);

  const filtered = sortRevisionRecords(
    state.revisions.filter((revision) => revision.entity_id === entityId),
  );

  assertUniqueRevisionIndexesForEntity(filtered, entityId);

  return filtered;
}

export function getCommitHistoryByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): RepositoryCommitRecord[] {
  const state = parseState(stateInput);
  const entityId = parseRepositoryEntityId(entityIdInput);

  const filtered = sortCommitRecords(
    state.commits.filter((commit) => commit.entity_id === entityId),
  );

  assertUniqueCommitIndexesForEntity(filtered, entityId);

  return filtered;
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
  parseRepositoryEntityId(parsed.entity_id);
  parseRevisionIndex(parsed.revision_index);
  parseVersionString(parsed.version);
  return parsed;
}

export function validateRepositoryRevisionRecord(input: unknown): boolean {
  return RepositoryRevisionRecordSchema.safeParse(input).success;
}

export function parseRepositoryCommitRecord(input: unknown): RepositoryCommitRecord {
  const parsed = RepositoryCommitRecordSchema.parse(input);
  parseCommitKey(parsed.commit_key);
  parseRepositoryEntityId(parsed.entity_id);
  parseCommitIndex(parsed.commit_index);
  parseVersionString(parsed.version);
  return parsed;
}

export function validateRepositoryCommitRecord(input: unknown): boolean {
  return RepositoryCommitRecordSchema.safeParse(input).success;
}

export function parseRepositoryState(input: unknown): RepositoryState {
  return parseState(input);
}

export function validateRepositoryState(input: unknown): boolean {
  try {
    parseState(input);
    return true;
  } catch {
    return false;
  }
}