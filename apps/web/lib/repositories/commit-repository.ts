import {
  parseRepositoryState,
  type RepositoryCommitRecord,
} from '../../packages/vault/repository';

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

  if (left.commit_key < right.commit_key) {
    return -1;
  }

  if (left.commit_key > right.commit_key) {
    return 1;
  }

  return 0;
}

function sortCommitRecords(records: readonly RepositoryCommitRecord[]): RepositoryCommitRecord[] {
  return [...records].sort((left, right) => compareCommitRecords(left, right));
}

export function listAllCommitRecords(
  stateInput: unknown,
): RepositoryCommitRecord[] {
  const state = parseRepositoryState(stateInput);
  return sortCommitRecords(state.commits);
}

export function getCommitRecordByKey(
  stateInput: unknown,
  commitKeyInput: unknown,
): RepositoryCommitRecord | null {
  const state = parseRepositoryState(stateInput);
  const commit_key = typeof commitKeyInput === 'string' ? commitKeyInput.trim() : commitKeyInput;

  return state.commits.find((record) => record.commit_key === commit_key) ?? null;
}

export function getCommitRecordsByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): RepositoryCommitRecord[] {
  const state = parseRepositoryState(stateInput);
  const entity_id = typeof entityIdInput === 'string' ? entityIdInput.trim() : entityIdInput;

  return sortCommitRecords(
    state.commits.filter((record) => record.entity_id === entity_id),
  );
}

export function getLatestCommitRecordByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): RepositoryCommitRecord | null {
  const records = getCommitRecordsByEntityId(stateInput, entityIdInput);

  if (records.length === 0) {
    return null;
  }

  return records[records.length - 1];
}