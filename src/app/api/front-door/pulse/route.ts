import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'front_door_pulse_get';

const PulseSchema = z
  .object({
    active_sessions: z.number().int().nonnegative(),
    open_incidents: z.number().int().nonnegative(),
    queued_jobs: z.number().int().nonnegative(),
    running_jobs: z.number().int().nonnegative(),
    total_runs: z.number().int().nonnegative(),
  })
  .strict();

const PULSE = PulseSchema.parse({
  active_sessions: 2,
  open_incidents: 0,
  queued_jobs: 1,
  running_jobs: 1,
  total_runs: 3,
});

export function GET(): NextResponse {
  try {
    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          pulse: PULSE,
        },
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
