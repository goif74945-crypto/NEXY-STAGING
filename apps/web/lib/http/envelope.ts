import { z } from 'zod';

export const ApiSuccessEnvelopeSchema = z
  .object({
    ok: z.literal(true),
    data: z.unknown(),
  })
  .strict();
export type ApiSuccessEnvelope = z.infer<typeof ApiSuccessEnvelopeSchema>;

export const ApiErrorInfoSchema = z
  .object({
    code: z.string().trim().min(1).max(128),
    message: z.string().trim().min(1).max(4096),
    details: z.unknown().optional(),
  })
  .strict();
export type ApiErrorInfo = z.infer<typeof ApiErrorInfoSchema>;

export const ApiErrorEnvelopeSchema = z
  .object({
    ok: z.literal(false),
    error: ApiErrorInfoSchema,
  })
  .strict();
export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;

export const ApiEnvelopeSchema = z.union([
  ApiSuccessEnvelopeSchema,
  ApiErrorEnvelopeSchema,
]);
export type ApiEnvelope = z.infer<typeof ApiEnvelopeSchema>;

export function buildSuccessEnvelope<TData>(data: TData): ApiSuccessEnvelope {
  return ApiSuccessEnvelopeSchema.parse({
    ok: true,
    data,
  });
}

export function buildErrorEnvelope(
  code: string,
  message: string,
  details?: unknown,
): ApiErrorEnvelope {
  return ApiErrorEnvelopeSchema.parse({
    ok: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  });
}

export function parseApiEnvelope(input: unknown): ApiEnvelope {
  return ApiEnvelopeSchema.parse(input);
}

export function validateApiEnvelope(input: unknown): boolean {
  return ApiEnvelopeSchema.safeParse(input).success;
}