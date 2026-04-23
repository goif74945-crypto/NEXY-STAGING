import { z } from 'zod';

export const RequestIdSchema = z.string().trim().min(1).max(128);
export type RequestId = z.infer<typeof RequestIdSchema>;

export const TraceIdSchema = z.string().trim().min(1).max(128);
export type TraceId = z.infer<typeof TraceIdSchema>;

export const CorrelationIdSchema = z.string().trim().min(1).max(128);
export type CorrelationId = z.infer<typeof CorrelationIdSchema>;

export const EnvelopeStatusSchema = z.enum(['OK', 'ERROR']);
export type EnvelopeStatus = z.infer<typeof EnvelopeStatusSchema>;

export const EnvelopeVersionSchema = z.string().trim().min(1).max(64);
export type EnvelopeVersion = z.infer<typeof EnvelopeVersionSchema>;

export const EnvelopeErrorSchema = z
  .object({
    code: z.string().trim().min(1).max(128),
    message: z.string().trim().min(1).max(4096),
    details: z.record(z.unknown()).optional(),
  })
  .strict();
export type EnvelopeError = z.infer<typeof EnvelopeErrorSchema>;

export const EnvelopeMetaSchema = z
  .object({
    request_id: RequestIdSchema,
    trace_id: TraceIdSchema,
    correlation_id: CorrelationIdSchema.optional(),
    version: EnvelopeVersionSchema,
  })
  .strict();
export type EnvelopeMeta = z.infer<typeof EnvelopeMetaSchema>;

export const makeSystemEnvelopeSchema = <TData extends z.ZodTypeAny>(dataSchema: TData) =>
  z
    .object({
      status: EnvelopeStatusSchema,
      meta: EnvelopeMetaSchema,
      data: dataSchema.nullable(),
      error: EnvelopeErrorSchema.optional(),
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
      meta: EnvelopeMetaSchema,
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

export type MakeEnvelopeInput<TData> = {
  status: EnvelopeStatus;
  requestId: string;
  traceId?: string;
  correlationId?: string;
  data: TData | null;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  } | null;
  version?: string;
};

export function makeEnvelope<TData>(input: MakeEnvelopeInput<TData>) {
  const requestId = RequestIdSchema.parse(input.requestId);
  const traceId = TraceIdSchema.parse(input.traceId ?? input.requestId);
  const correlationId =
    input.correlationId === undefined
      ? undefined
      : CorrelationIdSchema.parse(input.correlationId);
  const version = EnvelopeVersionSchema.parse(input.version ?? 'v1');

  return {
    status: EnvelopeStatusSchema.parse(input.status),
    meta: {
      request_id: requestId,
      trace_id: traceId,
      correlation_id: correlationId,
      version,
    },
    data: input.data,
    error:
      input.error === undefined || input.error === null
        ? undefined
        : EnvelopeErrorSchema.parse(input.error),
  };
}
