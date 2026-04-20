import { z } from 'zod';

const AuditPrimitiveValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

export const AuditIdSchema = z.string().trim().min(1).max(128);
export type AuditId = z.infer<typeof AuditIdSchema>;

export const AuditActionSchema = z.string().trim().min(1).max(128);
export type AuditAction = z.infer<typeof AuditActionSchema>;

export const AuditActorSchema = z
  .object({
    actor_id: z.string().trim().min(1).max(256),
    actor_type: z.string().trim().min(1).max(128),
  })
  .strict();
export type AuditActor = z.infer<typeof AuditActorSchema>;

export const AuditPayloadSchema = z.record(AuditPrimitiveValueSchema);
export type AuditPayload = z.infer<typeof AuditPayloadSchema>;

export const AuditRecordSchema = z
  .object({
    audit_id: AuditIdSchema,
    action: AuditActionSchema,
    actor: AuditActorSchema,
    entity_id: z.string().trim().min(1).max(256),
    timestamp_epoch_ms: z.number().int().nonnegative(),
    payload: AuditPayloadSchema,
  })
  .strict();
export type AuditRecord = z.infer<typeof AuditRecordSchema>;

export const AuditLogStateSchema = z
  .object({
    records: z.array(AuditRecordSchema),
  })
  .strict();
export type AuditLogState = z.infer<typeof AuditLogStateSchema>;

function compareAuditRecords(left: AuditRecord, right: AuditRecord): -1 | 0 | 1 {
  if (left.timestamp_epoch_ms < right.timestamp_epoch_ms) {
    return -1;
  }

  if (left.timestamp_epoch_ms > right.timestamp_epoch_ms) {
    return 1;
  }

  if (left.audit_id < right.audit_id) {
    return -1;
  }

  if (left.audit_id > right.audit_id) {
    return 1;
  }

  return 0;
}

function sortAuditRecords(records: readonly AuditRecord[]): AuditRecord[] {
  return [...records].sort((left, right) => compareAuditRecords(left, right));
}

function ensureNoDuplicateAuditIds(records: readonly AuditRecord[]): void {
  const seen = new Set<string>();

  for (const record of records) {
    if (seen.has(record.audit_id)) {
      throw new Error(`Duplicate audit id: ${record.audit_id}`);
    }

    seen.add(record.audit_id);
  }
}

function parseStateInternal(input: unknown): AuditLogState {
  const state = AuditLogStateSchema.parse(input);
  ensureNoDuplicateAuditIds(state.records);
  return AuditLogStateSchema.parse({
    records: sortAuditRecords(state.records),
  });
}

export function createEmptyAuditLogState(): AuditLogState {
  return AuditLogStateSchema.parse({
    records: [],
  });
}

export function appendAuditRecord(stateInput: unknown, recordInput: unknown): AuditLogState {
  const state = parseStateInternal(stateInput);
  const record = AuditRecordSchema.parse(recordInput);

  if (state.records.some((existingRecord) => existingRecord.audit_id === record.audit_id)) {
    throw new Error(`Duplicate audit id: ${record.audit_id}`);
  }

  return AuditLogStateSchema.parse({
    records: sortAuditRecords([...state.records, record]),
  });
}

export function getAuditRecordsByActor(stateInput: unknown, actorIdInput: unknown): AuditRecord[] {
  const state = parseStateInternal(stateInput);
  const actorId = z.string().trim().min(1).max(256).parse(actorIdInput);

  return sortAuditRecords(
    state.records.filter((record) => record.actor.actor_id === actorId),
  );
}

export function getAuditRecordsByEntityId(
  stateInput: unknown,
  entityIdInput: unknown,
): AuditRecord[] {
  const state = parseStateInternal(stateInput);
  const entityId = z.string().trim().min(1).max(256).parse(entityIdInput);

  return sortAuditRecords(
    state.records.filter((record) => record.entity_id === entityId),
  );
}

export function getAuditRecordsByAction(
  stateInput: unknown,
  actionInput: unknown,
): AuditRecord[] {
  const state = parseStateInternal(stateInput);
  const action = AuditActionSchema.parse(actionInput);

  return sortAuditRecords(
    state.records.filter((record) => record.action === action),
  );
}

export function parseAuditId(input: unknown): AuditId {
  return AuditIdSchema.parse(input);
}

export function validateAuditId(input: unknown): boolean {
  return AuditIdSchema.safeParse(input).success;
}

export function parseAuditAction(input: unknown): AuditAction {
  return AuditActionSchema.parse(input);
}

export function validateAuditAction(input: unknown): boolean {
  return AuditActionSchema.safeParse(input).success;
}

export function parseAuditActor(input: unknown): AuditActor {
  return AuditActorSchema.parse(input);
}

export function validateAuditActor(input: unknown): boolean {
  return AuditActorSchema.safeParse(input).success;
}

export function parseAuditRecord(input: unknown): AuditRecord {
  return AuditRecordSchema.parse(input);
}

export function validateAuditRecord(input: unknown): boolean {
  return AuditRecordSchema.safeParse(input).success;
}

export function parseAuditLogState(input: unknown): AuditLogState {
  return parseStateInternal(input);
}

export function validateAuditLogState(input: unknown): boolean {
  const schemaResult = AuditLogStateSchema.safeParse(input);

  if (!schemaResult.success) {
    return false;
  }

  try {
    ensureNoDuplicateAuditIds(schemaResult.data.records);
    return true;
  } catch {
    return false;
  }
}