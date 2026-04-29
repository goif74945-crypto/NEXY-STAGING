import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';
import {
  IncidentResolveBodySchema,
  resolveIncident,
} from '@/lib/repositories/incident-repository';

const REQUEST_ID = 'incidents_id_resolve_post';

const ParamsSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = ParamsSchema.parse(await context.params);
    const body = IncidentResolveBodySchema.parse(await request.json());
    const result = resolveIncident({
      incident_id: params.id,
      resolution: body.resolution,
      resolved_by: body.resolved_by,
    });

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: result,
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
