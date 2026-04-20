import { z } from 'zod';

export const EventIdSchema = z.string().trim().min(1).max(128);
export type EventId = z.infer<typeof EventIdSchema>;

export const EventLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);
export type EventLevel = z.infer<typeof EventLevelSchema>;

export const EventTypeSchema = z.string().trim().min(1).max(128);
export type EventType = z.infer<typeof EventTypeSchema>;

export const EventEntityIdSchema = z.string().trim().min(1).max(256);
export type EventEntityId = z.infer<typeof EventEntityIdSchema>;

export const EventPayloadSchema = z.record(z.union([z.string(), z.number().finite(), z.boolean(), z.null()]));
export type EventPayload = z.infer<typeof EventPayloadSchema>;

export const EventRecordSchema = z
  .object({
    event_id: EventIdSchema,
    event_type: EventTypeSchema,
    entity_id: EventEntityIdSchema,
    level: EventLevelSchema,
    timestamp_epoch_ms: z.number().int().nonnegative(),
    payload: EventPayloadSchema,
  })
  .strict();
export type EventRecord = z.infer<typeof EventRecordSchema>;

export const EventLogStateSchema = z
  .object({
    records: z.array(EventRecordSchema),
  })
  .strict();
export type EventLogState = z.infer<typeof EventLogStateSchema>;

function compareEvents(left: EventRecord, right: EventRecord): -1 | 0 | 1 {
  if (left.timestamp_epoch_ms < right.timestamp_epoch_ms) return -1;
  if (left.timestamp_epoch_ms > right.timestamp_epoch_ms) return 1;
  if (left.event_id < right.event_id) return -1;
  if (left.event_id > right.event_id) return 1;
  return 0;
}

function sortRecords(records: readonly EventRecord[]): EventRecord[] {
  return [...records].sort((left, right) => compareEvents(left, right));
}

export function createEmptyEventLogState(): EventLogState {
  return EventLogStateSchema.parse({ records: [] });
}

export function appendEventRecord(stateInput: unknown, recordInput: unknown): EventLogState {
  const state = EventLogStateSchema.parse(stateInput);
  const record = EventRecordSchema.parse(recordInput);

  if (state.records.some((existingRecord) => existingRecord.event_id === record.event_id)) {
    throw new Error(`Duplicate event id: ${record.event_id}`);
  }

  return EventLogStateSchema.parse({
    records: sortRecords([...state.records, record]),
  });
}

export function getEventsByType(stateInput: unknown, eventTypeInput: unknown): EventRecord[] {
  const state = EventLogStateSchema.parse(stateInput);
  const event_type = EventTypeSchema.parse(eventTypeInput);

  return sortRecords(state.records.filter((record) => record.event_type === event_type));
}

export function getEventsByEntityId(stateInput: unknown, entityIdInput: unknown): EventRecord[] {
  const state = EventLogStateSchema.parse(stateInput);
  const entity_id = EventEntityIdSchema.parse(entityIdInput);

  return sortRecords(state.records.filter((record) => record.entity_id === entity_id));
}

export function getEventsByLevel(stateInput: unknown, levelInput: unknown): EventRecord[] {
  const state = EventLogStateSchema.parse(stateInput);
  const level = EventLevelSchema.parse(levelInput);

  return sortRecords(state.records.filter((record) => record.level === level));
}

export function parseEventId(input: unknown): EventId {
  return EventIdSchema.parse(input);
}

export function validateEventId(input: unknown): boolean {
  return EventIdSchema.safeParse(input).success;
}

export function parseEventLevel(input: unknown): EventLevel {
  return EventLevelSchema.parse(input);
}

export function validateEventLevel(input: unknown): boolean {
  return EventLevelSchema.safeParse(input).success;
}

export function parseEventType(input: unknown): EventType {
  return EventTypeSchema.parse(input);
}

export function validateEventType(input: unknown): boolean {
  return EventTypeSchema.safeParse(input).success;
}

export function parseEventRecord(input: unknown): EventRecord {
  return EventRecordSchema.parse(input);
}

export function validateEventRecord(input: unknown): boolean {
  return EventRecordSchema.safeParse(input).success;
}

export function parseEventLogState(input: unknown): EventLogState {
  return EventLogStateSchema.parse(input);
}

export function validateEventLogState(input: unknown): boolean {
  return EventLogStateSchema.safeParse(input).success;
}
