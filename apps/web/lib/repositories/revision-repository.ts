import {
  parseRepositoryState,
  getLatestRevision,
  getRevisionHistoryByEntityId,
  type RepositoryRevisionRecord,
} from '../../packages/vault/repository';

export function listAllRevisionRecords(
  stateInput: unknown,
): RepositoryRevisionRecord[] {
  const state = parseRepositoryState(stateInput);
  return [...state.revisions];
}

export function getRevisionRecordByKey(
  stateInput: unknown,
  revisionKeyInput: unknown,
): RepositoryRevisionRecord | null {
  const state = parseRepositoryState(stateInput);
  const revision_key =
    typeof revisionKeyInput === 'string' ? revisionKeyInput.trim() : revisionKeyInput;

  return state.revisions.find((record) => record.revision_key === revision_key) ?? null;
}

export function getRevisionRecordsByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): RepositoryRevisionRecord[] {
  return getRevisionHistoryByEntityId(stateInput, entityIdInput);
}

export function getLatestRevisionRecordByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): RepositoryRevisionRecord | null {
  return getLatestRevision(stateInput, entityIdInput);
}