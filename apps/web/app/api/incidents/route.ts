import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  listIncidentRecords,
  parseIncidentRepositoryState,
} from '../../../lib/repositories/incident-repository';
import { buildSuccessEnvelope } from '../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../lib/http/route-error';

const IncidentsRouteBodySchema = z
  .object({
    state: z.unknown(),
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

    const body = IncidentsRouteBodySchema.parse(rawBody);
    const state = parseIncidentRepositoryState(body.state);
    const incidents = listIncidentRecords(state);

    return NextResponse.json(
      buildSuccessEnvelope({
        incidents,
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