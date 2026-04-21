import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  applyIncidentResolve,
  getIncidentRecordById,
  parseIncidentRepositoryState,
} from '../../../../../lib/repositories/incident-repository';
import { buildSuccessEnvelope } from '../../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../../lib/http/route-error';
import { IncidentIdSchema } from '../../../../../packages/obs/incidents';

const ResolveIncidentParamsSchema = z
  .object({
    id: IncidentIdSchema,
  })
  .strict();

const ResolveIncidentRouteBodySchema = z
  .object({
    state: z.unknown(),
    resolved_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const params = ResolveIncidentParamsSchema.parse(context.params);

    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = ResolveIncidentRouteBodySchema.parse(rawBody);
    const state = parseIncidentRepositoryState(body.state);
    const existingIncident = getIncidentRecordById(state, params.id);

    if (!existingIncident) {
      throw createRouteError('not_found', `Incident not found: ${params.id}`);
    }

    const nextState = applyIncidentResolve(
      state,
      params.id,
      body.resolved_at_epoch_ms,
    );
    const incident = getIncidentRecordById(nextState, params.id);

    if (!incident) {
      throw createRouteError('not_found', `Incident not found after resolve: ${params.id}`);
    }

    return NextResponse.json(
      buildSuccessEnvelope({
        state: nextState,
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