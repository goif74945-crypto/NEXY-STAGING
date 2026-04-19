import { z } from 'zod';

import { ErrorInfoSchema } from './errors';
import { FreezeReasonSchema } from './release-policy';
import {
  ActorRefSchema,
  SystemStateSchema,
  SystemStatusSchema,
  TimestampIsoSchema,
} from './state';

export const RequestIdSchema = z.string().trim().min(1).max(128);
export type RequestId = z.infer<typeof RequestIdSchema>;

export const TraceIdSchema = z.string().trim().min(1).max(128);
export type TraceId = z.infer<typeof TraceIdSchema>;

export const CorrelationIdSchema = z.string().trim().min(1).max(128);
export type CorrelationId = z.infer<typeof CorrelationIdSchema>;

export const VersionSchema = z.string().trim().min(1).max(64);
export type Version = z.infer<typeof VersionSchema>;

export const WarningCodeSchema = z.string().trim().min(1).max(128);
export type WarningCode = z.infer<typeof WarningCodeSchema>;

export const WarningSourceSchema = z.string().trim().min(1).max(128);
export type WarningSource = z.infer<typeof WarningSourceSchema>;

export const WarningSchema = z
  .object({
    code: WarningCodeSchema,
    message: z.string().trim().min(1).max(4096),
    source: WarningSourceSchema,
  })
  .strict();
export type Warning = z.infer<typeof WarningSchema>;

export const BodyHashSchema = z
  .string()
  .trim()
  .regex(/^(?:sha256:)?[A-Fa-f0-9]{64}$/, 'body_hash must be a SHA-256 digest.');
export type BodyHash = z.infer<typeof BodyHashSchema>;

export const SchemaVersionSchema = z.string().trim().min(1).max(64);
export type SchemaVersion = z.infer<typeof SchemaVersionSchema>;

export const IntegritySchema = z
  .object({
    body_hash: BodyHashSchema,
    schema_version: SchemaVersionSchema,
  })
  .strict();
export type Integrity = z.infer<typeof IntegritySchema>;

export interface SystemEnvelope<T> {
  status: z.infer<typeof SystemStatusSchema>;
  state: z.infer<typeof SystemStateSchema>;
  timestamp: z.infer<typeof TimestampIsoSchema>;
  request_id: RequestId;
  trace_id: TraceId;
  correlation_id?: CorrelationId;
  version: Version;
  duration_ms?: number;
  actor?: z.infer<typeof ActorRefSchema>;
  data?: T;
  error?: z.infer<typeof ErrorInfoSchema>;
  freeze_reason?: z.infer<typeof FreezeReasonSchema>;
  warnings?: Warning[];
  integrity?: Integrity;
}

export const makeSystemEnvelopeSchema = <TData extends z.ZodTypeAny>(dataSchema: TData) =>
  z
    .object({
      status: SystemStatusSchema,
      state: SystemStateSchema,
      timestamp: TimestampIsoSchema,
      request_id: RequestIdSchema,
      trace_id: TraceIdSchema,
      correlation_id: CorrelationIdSchema.optional(),
      version: VersionSchema,
      duration_ms: z.number().finite().nonnegative().optional(),
      actor: ActorRefSchema.optional(),
      data: dataSchema.optional(),
      error: ErrorInfoSchema.optional(),
      freeze_reason: FreezeReasonSchema.optional(),
      warnings: z.array(WarningSchema).optional(),
      integrity: IntegritySchema.optional(),
    })
    .strict();

export const UnknownSystemEnvelopeSchema = makeSystemEnvelopeSchema(z.unknown());
export type UnknownSystemEnvelope = z.infer<typeof UnknownSystemEnvelopeSchema>;

export function parseSystemEnvelope<TData extends z.ZodTypeAny>(
  dataSchema: TData,
  input: unknown,
): z.infer<ReturnType<typeof makeSystemEnvelopeSchema<TData>>> {
  return makeSystemEnvelopeSchema(dataSchema).parse(input);
}

export function makeSystemEnvelope<TData>(input: SystemEnvelope<TData>): SystemEnvelope<TData> {
  return {
    status: input.status,
    state: input.state,
    timestamp: input.timestamp,
    request_id: input.request_id,
    trace_id: input.trace_id,
    ...(input.correlation_id ? { correlation_id: input.correlation_id } : {}),
    version: input.version,
    ...(typeof input.duration_ms === 'number' ? { duration_ms: input.duration_ms } : {}),
    ...(input.actor ? { actor: input.actor } : {}),
    ...(input.data !== undefined ? { data: input.data } : {}),
    ...(input.error ? { error: input.error } : {}),
    ...(input.freeze_reason ? { freeze_reason: input.freeze_reason } : {}),
    ...(input.warnings ? { warnings: input.warnings } : {}),
    ...(input.integrity ? { integrity: input.integrity } : {}),
  };
}