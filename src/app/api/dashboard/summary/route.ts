import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'dashboard_summary_get';

const DashboardSummarySchema = z
  .object({
    active_sessions: z.number().int().nonnegative(),
    total_runs: z.number().int().nonnegative(),
    open_incidents: z.number().int().nonnegative(),
    queued_jobs: z.number().int().nonnegative(),
    running_jobs: z.number().int().nonnegative(),
    agents_online: z.number().int().nonnegative(),
  })
  .strict();

const SUMMARY = DashboardSummarySchema.parse({
  active_sessions: 2,
  total_runs: 4,
  open_incidents: 1,
  queued_jobs: 3,
  running_jobs: 1,
  agents_online: 2,
});

export function GET(): NextResponse {
  try {
    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: SUMMARY,
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
