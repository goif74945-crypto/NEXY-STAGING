import { z } from 'zod';

import {
  ApiEnvelopeSchema,
  parseApiEnvelope,
  type ApiEnvelope,
} from '../http/envelope';

export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
export type HttpMethod = z.infer<typeof HttpMethodSchema>;

const HttpHeadersSchema = z.record(z.string(), z.string());

export const HttpClientRequestSchema = z
  .object({
    method: HttpMethodSchema,
    path: z.string().trim().min(1),
    headers: HttpHeadersSchema,
    body: z.unknown().optional(),
  })
  .strict();
export type HttpClientRequest = z.infer<typeof HttpClientRequestSchema>;

export const HttpClientParsedResponseSchema = z
  .object({
    status: z.number().int().min(100).max(599),
    ok: z.boolean(),
    envelope: ApiEnvelopeSchema,
  })
  .strict();
export type HttpClientParsedResponse = z.infer<typeof HttpClientParsedResponseSchema>;

const RawEnvelopeResponseSchema = z
  .object({
    status: z.number().int().min(100).max(599),
    envelope: z.unknown(),
  })
  .strict();

export function buildJsonRequest(
  methodInput: unknown,
  pathInput: unknown,
  headersInput?: unknown,
  bodyInput?: unknown,
): HttpClientRequest {
  const method = HttpMethodSchema.parse(methodInput);
  const path = z.string().parse(pathInput).trim();

  if (path.length === 0) {
    throw new Error('path must be a non-empty string.');
  }

  const parsedHeaders =
    headersInput === undefined
      ? {}
      : HttpHeadersSchema.parse(headersInput);

  const normalizedHeaders = {
    ...parsedHeaders,
    'content-type': 'application/json',
  };

  return bodyInput === undefined
    ? HttpClientRequestSchema.parse({
        method,
        path,
        headers: normalizedHeaders,
      })
    : HttpClientRequestSchema.parse({
        method,
        path,
        headers: normalizedHeaders,
        body: bodyInput,
      });
}

export function parseJsonEnvelopeResponse(input: unknown): HttpClientParsedResponse {
  const parsed = RawEnvelopeResponseSchema.parse(input);
  const envelope = parseApiEnvelope(parsed.envelope);

  return HttpClientParsedResponseSchema.parse({
    status: parsed.status,
    ok: envelope.ok,
    envelope,
  });
}

export function isSuccessfulEnvelopeResponse(input: unknown): boolean {
  const parsed = HttpClientParsedResponseSchema.safeParse(input);

  if (!parsed.success) {
    return false;
  }

  return parsed.data.ok && parsed.data.envelope.ok;
}