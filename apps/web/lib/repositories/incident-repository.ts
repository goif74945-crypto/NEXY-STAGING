import {
  IncidentRecordSchema,
  IncidentStateSchema,
  createEmptyIncidentState,
  getIncidentById,
  getIncidentsBySeverity,
  getIncidentsByStatus,
  openIncident,
  resolveIncident,
  updateIncidentStatus,
  type IncidentRecord,
  type IncidentSeverity,
  type IncidentState,
  type IncidentStatus,
} from '../../packages/obs/incidents';

export function parseIncidentRepositoryState(input: unknown): IncidentState {
  return IncidentStateSchema.parse(input);
}

export function validateIncidentRepositoryState(input: unknown): boolean {
  return IncidentStateSchema.safeParse(input).success;
}

export function createEmptyIncidentRepositoryState(): IncidentState {
  return createEmptyIncidentState();
}

export function insertIncidentRecord(
  stateInput: unknown,
  recordInput: unknown,
): IncidentState {
  return openIncident(stateInput, IncidentRecordSchema.parse(recordInput));
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
    status: statusInput as IncidentStatus,
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