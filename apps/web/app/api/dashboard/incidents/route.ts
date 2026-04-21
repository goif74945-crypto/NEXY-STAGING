import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  listIncidentRecordsByStatus,
  parseIncidentRepositoryState,
} from '../../../../lib/repositories/incident-repository';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const DashboardIncidentsRouteBodySchema = z
  .object({
    incident_state: z.unknown(),
  })
  .strict();

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = DashboardIncidentsRouteBodySchema.parse(rawBody);
    const incident_state = parseIncidentRepositoryState(body.incident_state);

    const openIncidents = listIncidentRecordsByStatus(incident_state, 'open');
    const investigatingIncidents = listIncidentRecordsByStatus(
      incident_state,
      'investigating',
    );
    const mitigatedIncidents = listIncidentRecordsByStatus(
      incident_state,
      'mitigated',
    );

    const incidents = [
      ...openIncidents,
      ...investigatingIncidents,
      ...mitigatedIncidents,
    ];

    return NextResponse.json(
      buildSuccessEnvelope({
        incidents,
        count: incidents.length,
      }),
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}