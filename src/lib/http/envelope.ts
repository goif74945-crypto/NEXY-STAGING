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

export const EnvelopeVersionSchema = z.string().trim().min(1).max(64);
export type EnvelopeVersion = z.infer<typeof EnvelopeVersionSchema>;

export const EnvelopeWarningCodeSchema = z.string().trim().min(1).max(128);
export type EnvelopeWarningCode = z.infer<typeof EnvelopeWarningCodeSchema>;

export const EnvelopeWarningSourceSchema = z.string().trim().min(1).max(128);
export type EnvelopeWarningSource = z.infer<typeof EnvelopeWarningSourceSchema>;

export const EnvelopeWarningSchema = z
  .object({
    code: EnvelopeWarningCodeSchema,
    message: z.string().trim().min(1).max(4096),
    source: EnvelopeWarningSourceSchema,
    recoverable: z.boolean(),
  })
  .strict();
export type EnvelopeWarning = z.infer<typeof EnvelopeWarningSchema>;

export const EnvelopeBodyHashSchema = z
  .string()
  .trim()
  .regex(/^(?:sha256:)?[A-Fa-f0-9]{64}$/, 'body_hash must be a SHA-256 digest.');
export type EnvelopeBodyHash = z.infer<typeof EnvelopeBodyHashSchema>;

export const EnvelopeSchemaVersionSchema = z.string().trim().min(1).max(64);
export type EnvelopeSchemaVersion = z.infer<typeof EnvelopeSchemaVersionSchema>;

export const EnvelopeIntegritySchema = z
  .object({
    body_hash: EnvelopeBodyHashSchema,
    schema_version: EnvelopeSchemaVersionSchema,
  })
  .strict();
export type EnvelopeIntegrity = z.infer<typeof EnvelopeIntegritySchema>;

export const EnvelopeMetaSchema = z
  .object({
    request_id: RequestIdSchema,
    trace_id: TraceIdSchema,
    correlation_id: CorrelationIdSchema.optional(),
    version: EnvelopeVersionSchema,
    duration_ms: z.number().finite().nonnegative().optional(),
    actor: ActorRefSchema.optional(),
    integrity: EnvelopeIntegritySchema.optional(),
  })
  .strict();
export type EnvelopeMeta = z.infer<typeof EnvelopeMetaSchema>;

export const EnvelopeRequestContextSchema = z
  .object({
    request_id: RequestIdSchema,
    trace_id: TraceIdSchema,
    correlation_id: CorrelationIdSchema.optional(),
  })
  .strict();
export type EnvelopeRequestContext = z.infer<typeof EnvelopeRequestContextSchema>;

export const makeSystemEnvelopeSchema = <TData extends z.ZodTypeAny>(dataSchema: TData) =>
  z
    .object({
      status: SystemStatusSchema,
      state: SystemStateSchema,
      timestamp: TimestampIsoSchema,
      request_id: RequestIdSchema,
      trace_id: TraceIdSchema,
      correlation_id: CorrelationIdSchema.optional(),
      version: EnvelopeVersionSchema,
      duration_ms: z.number().finite().nonnegative().optional(),
      actor: ActorRefSchema.optional(),
      data: dataSchema.optional(),
      error: ErrorInfoSchema.optional(),
      freeze_reason: FreezeReasonSchema.optional(),
      warnings: z.array(EnvelopeWarningSchema).optional(),
      integrity: EnvelopeIntegritySchema.optional(),
    })
    .strict();
export type SystemEnvelopeSchema<TData extends z.ZodTypeAny> = ReturnType<
  typeof makeSystemEnvelopeSchema<TData>
>;

export const UnknownSystemEnvelopeSchema = makeSystemEnvelopeSchema(z.unknown());
export type UnknownSystemEnvelope = z.infer<typeof UnknownSystemEnvelopeSchema>;

export const makeCanonicalRequestEnvelopeSchema = <TPayload extends z.ZodTypeAny>(
  payloadSchema: TPayload,
) =>
  z
    .object({
      context: EnvelopeRequestContextSchema,
      payload: payloadSchema,
    })
    .strict();
export type CanonicalRequestEnvelopeSchema<TPayload extends z.ZodTypeAny> = ReturnType<
  typeof makeCanonicalRequestEnvelopeSchema<TPayload>
>;

export const makeCanonicalResponseEnvelopeSchema = <TData extends z.ZodTypeAny>(
  dataSchema: TData,
) => makeSystemEnvelopeSchema(dataSchema);
export type CanonicalResponseEnvelopeSchema<TData extends z.ZodTypeAny> = ReturnType<
  typeof makeCanonicalResponseEnvelopeSchema<TData>
>;

export const parseSystemEnvelope = <TData extends z.ZodTypeAny>(
  dataSchema: TData,
  input: unknown,
): z.infer<ReturnType<typeof makeSystemEnvelopeSchema<TData>>> =>
  makeSystemEnvelopeSchema(dataSchema).parse(input);

export const parseCanonicalRequestEnvelope = <TPayload extends z.ZodTypeAny>(
  payloadSchema: TPayload,
  input: unknown,
): z.infer<ReturnType<typeof makeCanonicalRequestEnvelopeSchema<TPayload>>> =>
  makeCanonicalRequestEnvelopeSchema(payloadSchema).parse(input);

export const parseCanonicalResponseEnvelope = <TData extends z.ZodTypeAny>(
  dataSchema: TData,
  input: unknown,
): z.infer<ReturnType<typeof makeCanonicalResponseEnvelopeSchema<TData>>> =>
  makeCanonicalResponseEnvelopeSchema(dataSchema).parse(input);