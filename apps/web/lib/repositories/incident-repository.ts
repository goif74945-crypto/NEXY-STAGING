import {
  IncidentRecordSchema,
  createEmptyIncidentState,
  getIncidentById,
  getIncidentsBySeverity,
  getIncidentsByStatus,
  openIncident,
  parseIncidentState,
  resolveIncident,
  updateIncidentStatus,
  validateIncidentState,
  type IncidentRecord,
  type IncidentState,
} from '../../packages/obs/incidents';

export function parseIncidentRepositoryState(input: unknown): IncidentState {
  return parseIncidentState(input);
}

export function validateIncidentRepositoryState(input: unknown): boolean {
  return validateIncidentState(input);
}

export function createEmptyIncidentRepositoryState(): IncidentState {
  return createEmptyIncidentState();
}

export function insertIncidentRecord(
  stateInput: unknown,
  recordInput: unknown,
): IncidentState {
  const record = IncidentRecordSchema.parse(recordInput);
  return openIncident(stateInput, record);
}

export function getIncidentRecordById(
  stateInput: unknown,
  incidentIdInput: unknown,
): IncidentRecord | null {
  return getIncidentById(stateInput, incidentIdInput);
}

export function listIncidentRecords(stateInput: unknown): IncidentRecord[] {
  const state = parseIncidentRepositoryState(stateInput);
  return [...state.records];
}

export function listIncidentRecordsByStatus(
  stateInput: unknown,
  statusInput: unknown,
): IncidentRecord[] {
  return getIncidentsByStatus(stateInput, statusInput);
}

export function listIncidentRecordsBySeverity(
  stateInput: unknown,
  severityInput: unknown,
): IncidentRecord[] {
  return getIncidentsBySeverity(stateInput, severityInput);
}

export function applyIncidentStatusUpdate(
  stateInput: unknown,
  incidentIdInput: unknown,
  statusInput: unknown,
  updatedAtEpochMsInput: unknown,
): IncidentState {
  return updateIncidentStatus(stateInput, {
    incident_id: incidentIdInput,
    status: statusInput,
    updated_at_epoch_ms: updatedAtEpochMsInput,
  });
}

export function applyIncidentResolve(
  stateInput: unknown,
  incidentIdInput: unknown,
  resolvedAtEpochMsInput: unknown,
): IncidentState {
  return resolveIncident(stateInput, {
    incident_id: incidentIdInput,
    resolved_at_epoch_ms: resolvedAtEpochMsInput,
  });
}