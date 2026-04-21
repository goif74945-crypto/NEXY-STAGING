import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  getIncidentRecordById,
  parseIncidentRepositoryState,
} from '../../../../lib/repositories/incident-repository';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';
import { IncidentIdSchema } from '../../../../packages/obs/incidents';

const IncidentByIdParamsSchema = z
  .object({
    id: IncidentIdSchema,
  })
  .strict();

const IncidentByIdRouteBodySchema = z
  .object({
    state: z.unknown(),
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const params = IncidentByIdParamsSchema.parse(context.params);

    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = IncidentByIdRouteBodySchema.parse(rawBody);
    const state = parseIncidentRepositoryState(body.state);
    const incident = getIncidentRecordById(state, params.id);

    if (!incident) {
      throw createRouteError('not_found', `Incident not found: ${params.id}`);
    }

    return NextResponse.json(
      buildSuccessEnvelope({
        incident,
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