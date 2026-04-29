import { NextResponse } from 'next/server';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';
import {
  listRuns,
  rejectClientRunCreation,
} from '@/lib/repositories/run-repository';

const GET_REQUEST_ID = 'runs_get';
const POST_REQUEST_ID = 'runs_post';

export function GET(): NextResponse {
  try {
    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: GET_REQUEST_ID,
        data: {
          runs: listRuns(),
        },
      }),
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError, GET_REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}

export function POST(): NextResponse {
  try {
    rejectClientRunCreation();
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError, POST_REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}
