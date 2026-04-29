import { NextResponse } from 'next/server';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';
import {
  createIncidentRecord,
  IncidentCreateInputSchema,
  listIncidents,
} from '@/lib/repositories/incident-repository';

const GET_REQUEST_ID = 'incidents_get';
const POST_REQUEST_ID = 'incidents_post';

export function GET(): NextResponse {
  try {
    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: GET_REQUEST_ID,
        data: {
          incidents: listIncidents(),
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

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = IncidentCreateInputSchema.parse(await request.json());
    const incident = createIncidentRecord(body);

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: POST_REQUEST_ID,
        data: {
          incident,
        },
      }),
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError, POST_REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}
