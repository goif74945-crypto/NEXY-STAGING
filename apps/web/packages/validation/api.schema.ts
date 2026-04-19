import { z } from 'zod';

import { DirectiveCommandSchema, DirectiveSchema } from '../contracts/directive';
import { ErrorInfoSchema } from '../contracts/errors';
import { EvidenceBatchSchema } from '../contracts/evidence';
import { FreezeReasonSchema, ReleasePolicyResultSchema } from '../contracts/release-policy';
import {
  ActorRefSchema,
  SystemStateSchema,
  SystemStatusSchema,
  TimestampIsoSchema,
} from '../contracts/state';

export const ApiRequestIdSchema = z.string().trim().min(1).max(128);
export type ApiRequestId = z.infer<typeof ApiRequestIdSchema>;

export const ApiTraceIdSchema = z.string().trim().min(1).max(128);
export type ApiTraceId = z.infer<typeof ApiTraceIdSchema>;

export const ApiCorrelationIdSchema = z.string().trim().min(1).max(128);
export type ApiCorrelationId = z.infer<typeof ApiCorrelationIdSchema>;

export const ApiMethodValues = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export const ApiMethodSchema = z.enum(ApiMethodValues);
export type ApiMethod = z.infer<typeof ApiMethodSchema>;

export const ApiPathSchema = z.string().trim().min(1).max(2048);
export type ApiPath = z.infer<typeof ApiPathSchema>;

export const ApiWarningSchema = z
  .object({
    code: z.string().trim().min(1).max(128),
    message: z.string().trim().min(1).max(4096),
  })
  .strict();
export type ApiWarning = z.infer<typeof ApiWarningSchema>;

export const ApiRequestContextSchema = z
  .object({
    request_id: ApiRequestIdSchema,
    trace_id: ApiTraceIdSchema,
    correlation_id: ApiCorrelationIdSchema.optional(),
    method: ApiMethodSchema,
    path: ApiPathSchema,
    actor: ActorRefSchema.optional(),
    timestamp: TimestampIsoSchema,
  })
  .strict();
export type ApiRequestContext = z.infer<typeof ApiRequestContextSchema>;

export const makeApiSuccessSchema = <TData extends z.ZodTypeAny>(dataSchema: TData) =>
  z
    .object({
      status: z.literal('success'),
      request_id: ApiRequestIdSchema,
      state: SystemStateSchema.optional(),
      system_status: SystemStatusSchema.optional(),
      data: dataSchema,
      error: z.undefined().optional(),
      warnings: z.array(ApiWarningSchema).default([]),
      timestamp: TimestampIsoSchema,
    })
    .strict();

export const makeApiErrorSchema = <TData extends z.ZodTypeAny>(dataSchema: TData) =>
  z
    .object({
      status: z.literal('error'),
      request_id: ApiRequestIdSchema,
      state: SystemStateSchema.optional(),
      system_status: SystemStatusSchema.optional(),
      data: dataSchema.optional(),
      error: ErrorInfoSchema,
      warnings: z.array(ApiWarningSchema).default([]),
      freeze_reason: FreezeReasonSchema.optional(),
      timestamp: TimestampIsoSchema,
    })
    .strict();

export const makeApiEnvelopeSchema = <TData extends z.ZodTypeAny>(dataSchema: TData) =>
  z.discriminatedUnion('status', [makeApiSuccessSchema(dataSchema), makeApiErrorSchema(dataSchema)]);

export const ApiDirectiveRequestSchema = z
  .object({
    context: ApiRequestContextSchema,
    body: DirectiveSchema,
  })
  .strict();
export type ApiDirectiveRequest = z.infer<typeof ApiDirectiveRequestSchema>;

export const ApiDirectiveCommandRequestSchema = z
  .object({
    context: ApiRequestContextSchema,
    body: DirectiveCommandSchema,
  })
  .strict();
export type ApiDirectiveCommandRequest = z.infer<typeof ApiDirectiveCommandRequestSchema>;

export const ApiEvidenceBatchRequestSchema = z
  .object({
    context: ApiRequestContextSchema,
    body: EvidenceBatchSchema,
  })
  .strict();
export type ApiEvidenceBatchRequest = z.infer<typeof ApiEvidenceBatchRequestSchema>;

export const ApiReleasePolicyResponseSchema = makeApiEnvelopeSchema(ReleasePolicyResultSchema);
export type ApiReleasePolicyResponse = z.infer<typeof ApiReleasePolicyResponseSchema>;

export const UnknownApiEnvelopeSchema = makeApiEnvelopeSchema(z.unknown());
export type UnknownApiEnvelope = z.infer<typeof UnknownApiEnvelopeSchema>;

export function parseApiRequestContext(input: unknown): ApiRequestContext {
  return ApiRequestContextSchema.parse(input);
}

export function parseApiDirectiveRequest(input: unknown): ApiDirectiveRequest {
  return ApiDirectiveRequestSchema.parse(input);
}

export function parseApiDirectiveCommandRequest(input: unknown): ApiDirectiveCommandRequest {
  return ApiDirectiveCommandRequestSchema.parse(input);
}

export function parseApiEvidenceBatchRequest(input: unknown): ApiEvidenceBatchRequest {
  return ApiEvidenceBatchRequestSchema.parse(input);
}

export function parseApiReleasePolicyResponse(input: unknown): ApiReleasePolicyResponse {
  return ApiReleasePolicyResponseSchema.parse(input);
}

export function parseApiEnvelope<TData extends z.ZodTypeAny>(
  dataSchema: TData,
  input: unknown,
): z.infer<ReturnType<typeof makeApiEnvelopeSchema<TData>>> {
  return makeApiEnvelopeSchema(dataSchema).parse(input);
}

export function validateApiDirectiveRequest(input: unknown): boolean {
  return ApiDirectiveRequestSchema.safeParse(input).success;
}

export function validateApiEvidenceBatchRequest(input: unknown): boolean {
  return ApiEvidenceBatchRequestSchema.safeParse(input).success;
}