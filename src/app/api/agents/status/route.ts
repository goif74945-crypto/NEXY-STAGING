import { NextResponse } from 'next/server';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';
import { getDashboardAgents } from '@/lib/repositories/dashboard-repository';

const REQUEST_ID = 'agents_status_get';

export function GET(): NextResponse {
  try {
    const agents = getDashboardAgents().map((agent) => ({
      agent_id: agent.agent_id,
      status: agent.status,
    }));

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          agents,
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
