import {
  RepositoryEntitySnapshotSchema,
  appendCommit,
  appendRevision,
  createEmptyRepositoryState,
  getLatestRevision,
  getRevisionHistoryByEntityId,
  getCommitHistoryByEntityId,
  parseRepositoryState,
  upsertEntitySnapshot,
  type RepositoryEntitySnapshot,
  type RepositoryState,
} from '../../packages/vault/repository';

export function createEmptyVaultRepositoryState(): RepositoryState {
  return createEmptyRepositoryState();
}

export function upsertVaultEntitySnapshot(
  stateInput: unknown,
  snapshotInput: unknown,
): RepositoryState {
  return upsertEntitySnapshot(stateInput, snapshotInput);
}

export function appendVaultRevision(
  stateInput: unknown,
  revisionInput: unknown,
): RepositoryState {
  return appendRevision(stateInput, revisionInput);
}

export function appendVaultCommit(
  stateInput: unknown,
  commitInput: unknown,
): RepositoryState {
  return appendCommit(stateInput, commitInput);
}

export function getVaultEntitySnapshotById(
  stateInput: unknown,
  entityIdInput: unknown,
): RepositoryEntitySnapshot | null {
  const state = parseRepositoryState(stateInput);
  const entity_id = typeof entityIdInput === 'string' ? entityIdInput.trim() : entityIdInput;

  return state.snapshots.find((snapshot) => snapshot.entity_id === entity_id) ?? null;
}

export function getVaultLatestRevisionByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
) {
  return getLatestRevision(stateInput, entityIdInput);
}

export function getVaultRevisionHistoryByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
) {
  return getRevisionHistoryByEntityId(stateInput, entityIdInput);
}

export function getVaultCommitHistoryByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
) {
  return getCommitHistoryByEntityId(stateInput, entityIdInput);
}