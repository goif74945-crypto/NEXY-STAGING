import { NextResponse } from 'next/server';

import { AppError, InternalAppError } from '@/lib/errors/app-errors';
import { makeEnvelope } from '@/lib/http/envelope';

function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalAppError({
      cause: error.message,
    });
  }

  return new InternalAppError();
}

export function mapRouteError(error: unknown, requestId: string) {
  const appError = normalizeError(error);

  return NextResponse.json(
    makeEnvelope({
      status: 'ERROR',
      requestId,
      data: null,
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details,
      },
    }),
    {
      status: appError.statusCode,
    },
  );
}
