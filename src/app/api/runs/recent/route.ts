import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'runs_recent_get';

const RecentRunSchema = z
  .object({
    run_id: z.string().trim().min(1).max(256),
    status: z.string().trim().min(1).max(128),
    started_at_epoch_ms: z.number().int().nonnegative(),
    updated_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

const RECENT_RUNS = [
  RecentRunSchema.parse({
    run_id: 'run_001',
    status: 'stable',
    started_at_epoch_ms: 1_700_000_000_000,
    updated_at_epoch_ms: 1_700_000_010_000,
  }),
  RecentRunSchema.parse({
    run_id: 'run_002',
    status: 'running',
    started_at_epoch_ms: 1_700_000_020_000,
    updated_at_epoch_ms: 1_700_000_030_000,
  }),
];

export function GET(): NextResponse {
  try {
    const runs = [...RECENT_RUNS].sort((left, right) => {
      if (left.started_at_epoch_ms !== right.started_at_epoch_ms) {
        return right.started_at_epoch_ms - left.started_at_epoch_ms;
      }

      return left.run_id.localeCompare(right.run_id);
    });

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          runs,
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
