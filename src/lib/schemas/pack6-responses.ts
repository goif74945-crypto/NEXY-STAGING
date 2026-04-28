import { z } from 'zod';

export const Pack6ResponseStatusSchema = z.enum(['OK', 'ERROR']);

export const Pack6ResponseErrorSchema = z
  .object({
    code: z.string().trim().min(1),
    message: z.string().trim().min(1),
  })
  .strict();

export const Pack6ResponseEnvelopeSchema = z
  .object({
    status: Pack6ResponseStatusSchema,
    request_id: z.string().trim().min(1),
    data: z.unknown().nullable(),
    error: Pack6ResponseErrorSchema.nullable(),
  })
  .strict();

export type Pack6ResponseStatus = z.infer<typeof Pack6ResponseStatusSchema>;
export type Pack6ResponseEnvelope = z.infer<typeof Pack6ResponseEnvelopeSchema>;

export function parsePack6ResponseEnvelope(
  input: unknown,
): Pack6ResponseEnvelope {
  return Pack6ResponseEnvelopeSchema.parse(input);
}

export function buildPack6ResponseEnvelope(input: {
  status: Pack6ResponseStatus;
  request_id: string;
  data: unknown | null;
  error: z.infer<typeof Pack6ResponseErrorSchema> | null;
}): Pack6ResponseEnvelope {
  return Pack6ResponseEnvelopeSchema.parse({
    status: input.status,
    request_id: input.request_id,
    data: input.data,
    error: input.error,
  });
}
