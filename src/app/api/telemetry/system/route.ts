import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'telemetry_system_get';

const SystemHealthSchema = z.enum(['green', 'yellow', 'red']);

const SystemTelemetrySchema = z
  .object({
    health: SystemHealthSchema,
    active_workers: z.number().int().nonnegative(),
    queued_jobs: z.number().int().nonnegative(),
    open_incidents: z.number().int().nonnegative(),
    error_events: z.number().int().nonnegative(),
    warn_events: z.number().int().nonnegative(),
  })
  .strict();

const TELEMETRY = SystemTelemetrySchema.parse({
  health: 'yellow',
  active_workers: 2,
  queued_jobs: 3,
  open_incidents: 1,
  error_events: 1,
  warn_events: 4,
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
