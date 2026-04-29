import { NextResponse } from 'next/server';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';
import { getDashboardIncidents } from '@/lib/repositories/dashboard-repository';

const REQUEST_ID = 'dashboard_incidents_get';

export function GET(): NextResponse {
  try {
    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          incidents: getDashboardIncidents(),
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
