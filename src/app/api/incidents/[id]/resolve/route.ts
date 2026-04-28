import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'incidents_id_resolve_post';

const ParamsSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
  })
  .strict();

const ResolveBodySchema = z
  .object({
    resolution: z.string().trim().min(1).max(4096),
    resolved_by: z.string().trim().min(1).max(256),
  })
  .strict();

const IncidentResolveResultSchema = z
  .object({
    incident_id: z.string().trim().min(1).max(256),
    status: z.literal('resolved'),
    resolution: z.string().trim().min(1).max(4096),
    resolved_by: z.string().trim().min(1).max(256),
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = ParamsSchema.parse(await context.params);
    const body = ResolveBodySchema.parse(await request.json());
    const result = IncidentResolveResultSchema.parse({
      incident_id: params.id,
      status: 'resolved',
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
