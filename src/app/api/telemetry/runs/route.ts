import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'telemetry_runs_get';

const RunTelemetrySchema = z
  .object({
    total_runs: z.number().int().nonnegative(),
    succeeded_runs: z.number().int().nonnegative(),
    failed_runs: z.number().int().nonnegative(),
    frozen_runs: z.number().int().nonnegative(),
    average_duration_ms: z.number().int().nonnegative(),
  })
  .strict();

const TELEMETRY = RunTelemetrySchema.parse({
  total_runs: 16,
  succeeded_runs: 12,
  failed_runs: 1,
  frozen_runs: 3,
  average_duration_ms: 2400,
});

export function GET(): NextResponse {
  try {
    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: TELEMETRY,
      }),
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError, REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}
