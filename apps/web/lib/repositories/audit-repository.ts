import {
  AuditLogStateSchema,
  AuditRecordSchema,
  appendAuditRecord,
  createEmptyAuditLogState,
  getAuditRecordsByAction,
  getAuditRecordsByActor,
  getAuditRecordsByEntityId,
  type AuditLogState,
  type AuditRecord,
} from '../../packages/obs/audit-log';

export function createEmptyAuditRepositoryState(): AuditLogState {
  return createEmptyAuditLogState();
}

export function insertAuditRecord(
  stateInput: unknown,
  recordInput: unknown,
): AuditLogState {
  return appendAuditRecord(stateInput, AuditRecordSchema.parse(recordInput));
}

export function getAuditRecordById(
  stateInput: unknown,
  auditIdInput: unknown,
): AuditRecord | null {
  const state = AuditLogStateSchema.parse(stateInput);
  const audit_id = typeof auditIdInput === 'string' ? auditIdInput.trim() : auditIdInput;

  return state.records.find((record) => record.audit_id === audit_id) ?? null;
}

export function listAuditRecords(stateInput: unknown): AuditRecord[] {
  const state = AuditLogStateSchema.parse(stateInput);
  return [...state.records];
}

export function listAuditRecordsByActor(
  stateInput: unknown,
  actorIdInput: unknown,
): AuditRecord[] {
  return getAuditRecordsByActor(stateInput, actorIdInput);
}

export function listAuditRecordsByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): AuditRecord[] {
  return getAuditRecordsByEntityId(stateInput, entityIdInput);
}

export function listAuditRecordsByAction(
  stateInput: unknown,
  actionInput: unknown,
): AuditRecord[] {
  return getAuditRecordsByAction(stateInput, actionInput);
}