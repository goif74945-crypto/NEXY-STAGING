import { NextResponse } from 'next/server';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';
import { listRecentRuns } from '@/lib/repositories/run-repository';

const REQUEST_ID = 'runs_recent_get';

export function GET(): NextResponse {
  try {
    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          runs: listRecentRuns(),
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
