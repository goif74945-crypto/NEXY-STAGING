import { z } from 'zod';

import {
  buildErrorEnvelope,
  type ApiErrorEnvelope,
} from './envelope';

export const RouteErrorCodeSchema = z.enum([
  'bad_request',
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'unprocessable_entity',
  'internal_error',
]);
export type RouteErrorCode = z.infer<typeof RouteErrorCodeSchema>;

export const RouteErrorSchema = z
  .object({
    code: RouteErrorCodeSchema,
    message: z.string().trim().min(1).max(4096),
    details: z.unknown().optional(),
  })
  .strict();
export type RouteError = z.infer<typeof RouteErrorSchema>;

export function createRouteError(
  code: RouteErrorCode,
  message: string,
  details?: unknown,
): RouteError {
  return RouteErrorSchema.parse({
    code,
    message,
    ...(details !== undefined ? { details } : {}),
  });
}

export function getHttpStatusFromRouteError(errorInput: unknown): number {
  const error = RouteErrorSchema.parse(errorInput);

  switch (error.code) {
    case 'bad_request':
      return 400;
    case 'unauthorized':
      return 401;
    case 'forbidden':
      return 403;
    case 'not_found':
      return 404;
    case 'conflict':
      return 409;
    case 'unprocessable_entity':
      return 422;
    case 'internal_error':
      return 500;
  }
}

export function toRouteError(input: unknown): RouteError {
  if (input instanceof z.ZodError) {
    return createRouteError('bad_request', 'Invalid request input.', input.flatten());
  }

  const parsedKnownError = RouteErrorSchema.safeParse(input);

  if (parsedKnownError.success) {
    return parsedKnownError.data;
  }

  if (input instanceof Error) {
    return createRouteError('internal_error', input.message || 'Internal error.');
  }

  return createRouteError('internal_error', 'Internal error.');
}

export function toRouteErrorEnvelope(input: unknown): ApiErrorEnvelope {
  const error = toRouteError(input);

  return buildErrorEnvelope(error.code, error.message, error.details);
}