import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  AppError,
  InternalAppError,
  ValidationAppError,
} from '@/lib/errors/app-errors';
import { makeEnvelope } from '@/lib/http/envelope';

export const RouteErrorCodeSchema = z.enum([
  'bad_request',
  'unauthorized',
  'forbidden',
  'not_found',
  'internal_error',
]);
export type RouteErrorCode = z.infer<typeof RouteErrorCodeSchema>;

export type RouteErrorDetails = Record<string, unknown> | undefined;

export function createRouteError(
  code: RouteErrorCode,
  message: string,
  details?: RouteErrorDetails,
): AppError {
  const parsedCode = RouteErrorCodeSchema.parse(code);

  if (parsedCode === 'bad_request') {
    return new ValidationAppError({
      message,
      details,
    });
  }

  if (parsedCode === 'unauthorized') {
    return new AppError({
      code: 'AUTH_REQUIRED',
      message,
      statusCode: 401,
      source: 'route',
      recoverable: false,
      details,
    });
  }

  if (parsedCode === 'forbidden') {
    return new AppError({
      code: 'FORBIDDEN',
      message,
      statusCode: 403,
      source: 'route',
      recoverable: false,
      details,
    });
  }

  if (parsedCode === 'not_found') {
    return new AppError({
      code: 'INCIDENT_NOT_FOUND',
      message,
      statusCode: 404,
      source: 'route',
      recoverable: false,
      details,
    });
  }

  return new InternalAppError({
    message,
    details,
  });
}

export function toRouteError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof z.ZodError) {
    return new ValidationAppError({
      message: 'The submitted payload is invalid.',
      details: {
        issues: error.issues,
      },
    });
  }

  if (error instanceof Error) {
    return new InternalAppError({
      cause: error.message,
    });
  }

  return new InternalAppError();
}

export function getHttpStatusFromRouteError(error: AppError): number {
  return error.statusCode;
}

export function toRouteErrorEnvelope(
  error: AppError,
  requestId = 'route_error',
) {
  return makeEnvelope({
    status: 'ERROR',
    requestId,
    traceId: requestId,
    data: null,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  });
}

export function mapRouteError(error: unknown, requestId: string) {
  const routeError = toRouteError(error);

  return NextResponse.json(toRouteErrorEnvelope(routeError, requestId), {
    status: getHttpStatusFromRouteError(routeError),
  });
}
