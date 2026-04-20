import { z } from 'zod';

const IncidentPrimitiveValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

export const IncidentIdSchema = z.string().trim().min(1).max(128);
export type IncidentId = z.infer<typeof IncidentIdSchema>;

export const IncidentSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type IncidentSeverity = z.infer<typeof IncidentSeveritySchema>;

export const IncidentStatusSchema = z.enum([
  'open',
  'investigating',
  'mitigated',
  'resolved',
  'closed',
]);
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

export const IncidentPayloadSchema = z.record(IncidentPrimitiveValueSchema);
export type IncidentPayload = z.infer<typeof IncidentPayloadSchema>;

export const IncidentRecordSchema = z
  .object({
    incident_id: IncidentIdSchema,
    entity_id: z.string().trim().min(1).max(256),
    title: z.string().trim().min(1).max(256),
    description: z.string().trim().min(1).max(4096),
    severity: IncidentSeveritySchema,
    status: IncidentStatusSchema,
    opened_at_epoch_ms: z.number().int().nonnegative(),
    updated_at_epoch_ms: z.number().int().nonnegative(),
    resolved_at_epoch_ms: z.number().int().nonnegative().optional(),
    payload: IncidentPayloadSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.updated_at_epoch_ms < value.opened_at_epoch_ms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'updated_at_epoch_ms must be greater than or equal to opened_at_epoch_ms.',
      });
    }

    if (value.resolved_at_epoch_ms !== undefined && value.resolved_at_epoch_ms < value.opened_at_epoch_ms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'resolved_at_epoch_ms must be greater than or equal to opened_at_epoch_ms.',
      });
    }

    if (value.status === 'resolved' && value.resolved_at_epoch_ms === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'resolved incidents must include resolved_at_epoch_ms.',
      });
    }

    if (value.status !== 'resolved' && value.resolved_at_epoch_ms !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only resolved incidents may include resolved_at_epoch_ms.',
      });
    }
  });
export type IncidentRecord = z.infer<typeof IncidentRecordSchema>;

export const IncidentStateSchema = z
  .object({
    records: z.array(IncidentRecordSchema),
  })
  .strict();
export type IncidentState = z.infer<typeof IncidentStateSchema>;

export const UpdateIncidentStatusInputSchema = z
  .object({
    incident_id: IncidentIdSchema,
    status: IncidentStatusSchema,
    updated_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type UpdateIncidentStatusInput = z.infer<typeof UpdateIncidentStatusInputSchema>;

export const ResolveIncidentInputSchema = z
  .object({
    incident_id: IncidentIdSchema,
    resolved_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type ResolveIncidentInput = z.infer<typeof ResolveIncidentInputSchema>;

function compareIncidents(left: IncidentRecord, right: IncidentRecord): -1 | 0 | 1 {
  if (left.opened_at_epoch_ms < right.opened_at_epoch_ms) {
    return -1;
  }

  if (left.opened_at_epoch_ms > right.opened_at_epoch_ms) {
    return 1;
  }

  if (left.incident_id < right.incident_id) {
    return -1;
  }

  if (left.incident_id > right.incident_id) {
    return 1;
  }

  return 0;
}

function sortIncidentRecords(records: readonly IncidentRecord[]): IncidentRecord[] {
  return [...records].sort((left, right) => compareIncidents(left, right));
}

function ensureNoDuplicateIncidentIds(records: readonly IncidentRecord[]): void {
  const seen = new Set<string>();

  for (const record of records) {
    if (seen.has(record.incident_id)) {
      throw new Error(`Duplicate incident id: ${record.incident_id}`);
    }

    seen.add(record.incident_id);
  }
}

function ensureTransitionAllowed(current: IncidentStatus, next: IncidentStatus): void {
  const allowedTransitions: Record<IncidentStatus, IncidentStatus[]> = {
    open: ['investigating', 'mitigated', 'resolved', 'closed'],
    investigating: ['mitigated', 'resolved', 'closed'],
    mitigated: ['resolved', 'closed'],
    resolved: ['closed'],
    closed: [],
  };

  if (current === next) {
    return;
  }

  if (!allowedTransitions[current].includes(next)) {
    throw new Error(`Invalid incident status transition: ${current} -> ${next}`);
  }
}

function parseStateInternal(input: unknown): IncidentState {
  const state = IncidentStateSchema.parse(input);
  ensureNoDuplicateIncidentIds(state.records);

  return IncidentStateSchema.parse({
    records: sortIncidentRecords(state.records),
  });
}

export function createEmptyIncidentState(): IncidentState {
  return IncidentStateSchema.parse({
    records: [],
  });
}

export function openIncident(stateInput: unknown, recordInput: unknown): IncidentState {
  const state = parseStateInternal(stateInput);
  const record = IncidentRecordSchema.parse(recordInput);

  if (record.status !== 'open') {
    throw new Error('openIncident requires an incident record with status "open".');
  }

  if (state.records.some((existingRecord) => existingRecord.incident_id === record.incident_id)) {
    throw new Error(`Duplicate incident id: ${record.incident_id}`);
  }

  return IncidentStateSchema.parse({
    records: sortIncidentRecords([...state.records, record]),
  });
}

export function updateIncidentStatus(
  stateInput: unknown,
  updateInput: unknown,
): IncidentState {
  const state = parseStateInternal(stateInput);
  const update = UpdateIncidentStatusInputSchema.parse(updateInput);

  const existingRecord = state.records.find(
    (record) => record.incident_id === update.incident_id,
  );

  if (!existingRecord) {
    throw new Error(`Incident not found: ${update.incident_id}`);
  }

  ensureTransitionAllowed(existingRecord.status, update.status);

  if (update.updated_at_epoch_ms < existingRecord.updated_at_epoch_ms) {
    throw new Error('updated_at_epoch_ms must be greater than or equal to the current updated_at_epoch_ms.');
  }

  const nextRecord =
    update.status === 'resolved'
      ? IncidentRecordSchema.parse({
          ...existingRecord,
          status: 'resolved',
          updated_at_epoch_ms: update.updated_at_epoch_ms,
          resolved_at_epoch_ms: update.updated_at_epoch_ms,
        })
      : IncidentRecordSchema.parse({
          ...existingRecord,
          status: update.status,
          updated_at_epoch_ms: update.updated_at_epoch_ms,
        });

  return IncidentStateSchema.parse({
    records: sortIncidentRecords(
      state.records.map((record) =>
        record.incident_id === update.incident_id ? nextRecord : record,
      ),
    ),
  });
}

export function resolveIncident(stateInput: unknown, resolveInput: unknown): IncidentState {
  const state = parseStateInternal(stateInput);
  const resolve = ResolveIncidentInputSchema.parse(resolveInput);

  const existingRecord = state.records.find(
    (record) => record.incident_id === resolve.incident_id,
  );

  if (!existingRecord) {
    throw new Error(`Incident not found: ${resolve.incident_id}`);
  }

  ensureTransitionAllowed(existingRecord.status, 'resolved');

  if (resolve.resolved_at_epoch_ms < existingRecord.updated_at_epoch_ms) {
    throw new Error('resolved_at_epoch_ms must be greater than or equal to the current updated_at_epoch_ms.');
  }

  const resolvedRecord = IncidentRecordSchema.parse({
    ...existingRecord,
    status: 'resolved',
    updated_at_epoch_ms: resolve.resolved_at_epoch_ms,
    resolved_at_epoch_ms: resolve.resolved_at_epoch_ms,
  });

  return IncidentStateSchema.parse({
    records: sortIncidentRecords(
      state.records.map((record) =>
        record.incident_id === resolve.incident_id ? resolvedRecord : record,
      ),
    ),
  });
}

export function getIncidentById(
  stateInput: unknown,
  incidentIdInput: unknown,
): IncidentRecord | null {
  const state = parseStateInternal(stateInput);
  const incidentId = IncidentIdSchema.parse(incidentIdInput);

  return state.records.find((record) => record.incident_id === incidentId) ?? null;
}

export function getIncidentsByStatus(
  stateInput: unknown,
  statusInput: unknown,
): IncidentRecord[] {
  const state = parseStateInternal(stateInput);
  const status = IncidentStatusSchema.parse(statusInput);

  return sortIncidentRecords(
    state.records.filter((record) => record.status === status),
  );
}

export function getIncidentsBySeverity(
  stateInput: unknown,
  severityInput: unknown,
): IncidentRecord[] {
  const state = parseStateInternal(stateInput);
  const severity = IncidentSeveritySchema.parse(severityInput);

  return sortIncidentRecords(
    state.records.filter((record) => record.severity === severity),
  );
}

export function parseIncidentId(input: unknown): IncidentId {
  return IncidentIdSchema.parse(input);
}

export function validateIncidentId(input: unknown): boolean {
  return IncidentIdSchema.safeParse(input).success;
}

export function parseIncidentSeverity(input: unknown): IncidentSeverity {
  return IncidentSeveritySchema.parse(input);
}

export function validateIncidentSeverity(input: unknown): boolean {
  return IncidentSeveritySchema.safeParse(input).success;
}

export function parseIncidentStatus(input: unknown): IncidentStatus {
  return IncidentStatusSchema.parse(input);
}

export function validateIncidentStatus(input: unknown): boolean {
  return IncidentStatusSchema.safeParse(input).success;
}

export function parseIncidentRecord(input: unknown): IncidentRecord {
  return IncidentRecordSchema.parse(input);
}

export function validateIncidentRecord(input: unknown): boolean {
  return IncidentRecordSchema.safeParse(input).success;
}

export function parseIncidentState(input: unknown): IncidentState {
  return parseStateInternal(input);
}

export function validateIncidentState(input: unknown): boolean {
  const schemaResult = IncidentStateSchema.safeParse(input);

  if (!schemaResult.success) {
    return false;
  }

  try {
    ensureNoDuplicateIncidentIds(schemaResult.data.records);
    return true;
  } catch {
    return false;
  }
}