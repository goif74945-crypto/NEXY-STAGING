import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';
import { OutputClassSchema } from '@/lib/types/output-class';

const REQUEST_ID = 'dashboard_recent_runs_get';

const RecentRunSchema = z
  .object({
    run_id: z.string().trim().min(1).max(256),
    status: z.string().trim().min(1).max(128),
    output_class: OutputClassSchema,
    updated_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

const RECENT_RUNS = [
  RecentRunSchema.parse({
    run_id: 'run_004',
    status: 'stable',
    output_class: 'FINAL',
    updated_at_epoch_ms: 1_700_000_040_000,
  }),
  RecentRunSchema.parse({
    run_id: 'run_003',
    status: 'verifying',
    output_class: 'CLEAN',
    updated_at_epoch_ms: 1_700_000_030_000,
  }),
];

export function GET(): NextResponse {
  try {
    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          runs: RECENT_RUNS,
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
