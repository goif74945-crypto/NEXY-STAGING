import { z } from 'zod';

export const EnvelopeStatusValues = ['success', 'error'] as const;
export const EnvelopeStatusSchema = z.enum(EnvelopeStatusValues);
export type EnvelopeStatus = z.infer<typeof EnvelopeStatusSchema>;

export const EnvelopeRequestIdSchema = z.string().trim().min(1).max(128);
export type EnvelopeRequestId = z.infer<typeof EnvelopeRequestIdSchema>;

export const EnvelopeWarningCodeSchema = z.string().trim().min(1).max(128);
export type EnvelopeWarningCode = z.infer<typeof EnvelopeWarningCodeSchema>;

export const EnvelopeWarningMessageSchema = z.string().trim().min(1).max(4096);
export type EnvelopeWarningMessage = z.infer<typeof EnvelopeWarningMessageSchema>;

export const EnvelopeWarningSchema = z
  .object({
    code: EnvelopeWarningCodeSchema,
    message: EnvelopeWarningMessageSchema,
  })
  .strict();
export type EnvelopeWarning = z.infer<typeof EnvelopeWarningSchema>;

export const EnvelopeWarningsSchema = z.array(EnvelopeWarningSchema);
export type EnvelopeWarnings = z.infer<typeof EnvelopeWarningsSchema>;

export const EnvelopeErrorCodeSchema = z.string().trim().min(1).max(128);
export type EnvelopeErrorCode = z.infer<typeof EnvelopeErrorCodeSchema>;

export const EnvelopeErrorMessageSchema = z.string().trim().min(1).max(4096);
export type EnvelopeErrorMessage = z.infer<typeof EnvelopeErrorMessageSchema>;

export const EnvelopeErrorFieldSchema = z.string().trim().min(1).max(256);
export type EnvelopeErrorField = z.infer<typeof EnvelopeErrorFieldSchema>;

export const EnvelopeErrorDetailPrimitiveSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);
export type EnvelopeErrorDetailPrimitive = z.infer<typeof EnvelopeErrorDetailPrimitiveSchema>;

export const EnvelopeErrorDetailValueSchema = z.union([
  EnvelopeErrorDetailPrimitiveSchema,
  z.array(EnvelopeErrorDetailPrimitiveSchema),
]);
export type EnvelopeErrorDetailValue = z.infer<typeof EnvelopeErrorDetailValueSchema>;

export const EnvelopeErrorDetailsSchema = z.record(EnvelopeErrorDetailValueSchema);
export type EnvelopeErrorDetails = z.infer<typeof EnvelopeErrorDetailsSchema>;

export const EnvelopeErrorSchema = z
  .object({
    code: EnvelopeErrorCodeSchema,
    message: EnvelopeErrorMessageSchema,
    field: EnvelopeErrorFieldSchema.optional(),
    details: EnvelopeErrorDetailsSchema.optional(),
  })
  .strict();
export type EnvelopeError = z.infer<typeof EnvelopeErrorSchema>;

export const makeEnvelopeSuccessSchema = <TData extends z.ZodTypeAny>(dataSchema: TData) =>
  z
    .object({
      status: z.literal('success'),
      requestId: EnvelopeRequestIdSchema,
      data: dataSchema,
      error: z.undefined().optional(),
      warnings: EnvelopeWarningsSchema.default([]),
    })
    .strict();

export const makeEnvelopeErrorSchema = <TData extends z.ZodTypeAny>(dataSchema: TData) =>
  z
    .object({
      status: z.literal('error'),
      requestId: EnvelopeRequestIdSchema,
      data: dataSchema.optional(),
      error: EnvelopeErrorSchema,
      warnings: EnvelopeWarningsSchema.default([]),
    })
    .strict();

export const makeEnvelopeSchema = <TData extends z.ZodTypeAny>(dataSchema: TData) =>
  z.discriminatedUnion('status', [
    makeEnvelopeSuccessSchema(dataSchema),
    makeEnvelopeErrorSchema(dataSchema),
  ]);

export const UnknownEnvelopeSuccessSchema = makeEnvelopeSuccessSchema(z.unknown());
export type UnknownEnvelopeSuccess = z.infer<typeof UnknownEnvelopeSuccessSchema>;

export const UnknownEnvelopeErrorSchema = makeEnvelopeErrorSchema(z.unknown());
export type UnknownEnvelopeError = z.infer<typeof UnknownEnvelopeErrorSchema>;

export const UnknownEnvelopeSchema = makeEnvelopeSchema(z.unknown());
export type UnknownEnvelope = z.infer<typeof UnknownEnvelopeSchema>;

export type EnvelopeSuccess<TData> = {
  status: 'success';
  requestId: EnvelopeRequestId;
  data: TData;
  error?: undefined;
  warnings: EnvelopeWarnings;
};

export type EnvelopeFailure<TData> = {
  status: 'error';
  requestId: EnvelopeRequestId;
  data?: TData;
  error: EnvelopeError;
  warnings: EnvelopeWarnings;
};

export type Envelope<TData> = EnvelopeSuccess<TData> | EnvelopeFailure<TData>;

export function parseEnvelope<TData extends z.ZodTypeAny>(
  dataSchema: TData,
  input: unknown,
): z.infer<ReturnType<typeof makeEnvelopeSchema<TData>>> {
  return makeEnvelopeSchema(dataSchema).parse(input);
}

export function parseEnvelopeSuccess<TData extends z.ZodTypeAny>(
  dataSchema: TData,
  input: unknown,
): z.infer<ReturnType<typeof makeEnvelopeSuccessSchema<TData>>> {
  return makeEnvelopeSuccessSchema(dataSchema).parse(input);
}

export function parseEnvelopeError<TData extends z.ZodTypeAny>(
  dataSchema: TData,
  input: unknown,
): z.infer<ReturnType<typeof makeEnvelopeErrorSchema<TData>>> {
  return makeEnvelopeErrorSchema(dataSchema).parse(input);
}