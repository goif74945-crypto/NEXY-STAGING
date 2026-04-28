import { z } from 'zod';

export const HttpClientMethodSchema = z.enum(['GET', 'POST']);

export const HttpClientRequestSchema = z
  .object({
    method: HttpClientMethodSchema,
    path: z.string().trim().min(1),
    body: z.unknown().nullable(),
  })
  .strict();

export const HttpClientResponseSchema = z
  .object({
    status: z.number().int().min(100).max(599),
    data: z.unknown().nullable(),
    error: z.unknown().nullable(),
  })
  .strict();

export type HttpClientMethod = z.infer<typeof HttpClientMethodSchema>;
export type HttpClientRequest = z.infer<typeof HttpClientRequestSchema>;
export type HttpClientResponse = z.infer<typeof HttpClientResponseSchema>;

export function buildHttpClientRequest(input: {
  method: HttpClientMethod;
  path: string;
  body: unknown | null;
}): HttpClientRequest {
  return HttpClientRequestSchema.parse({
    method: input.method,
    path: input.path,
    body: input.body,
  });
}

export function buildHttpClientResponse(input: {
  status: number;
  data: unknown | null;
  error: unknown | null;
}): HttpClientResponse {
  return HttpClientResponseSchema.parse({
    status: input.status,
    data: input.data,
    error: input.error,
  });
}
