import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'incidents_id_get';

const ParamsSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
  })
  .strict();

const IncidentSeveritySchema = z.enum(['S0', 'S1', 'S2', 'S3', 'S4', 'S5']);
const IncidentStatusSchema = z.enum(['open', 'investigating', 'resolved']);

const IncidentSchema = z
  .object({
    incident_id: z.string().trim().min(1).max(256),
    severity: IncidentSeveritySchema,
    title: z.string().trim().min(1).max(256),
    status: IncidentStatusSchema,
  })
  .strict();

const INCIDENTS = [
  IncidentSchema.parse({
    incident_id: 'incident_001',
    severity: 'S2',
    title: 'Deterministic queue pressure',
    status: 'open',
  }),
  IncidentSchema.parse({
    incident_id: 'incident_002',
    severity: 'S1',
    title: 'Telemetry warning threshold',
    status: 'investigating',
  }),
];

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = ParamsSchema.parse(await context.params);
    const incident =
      INCIDENTS.find((item) => item.incident_id === params.id) ?? null;

    if (incident === null) {
      throw createRouteError('not_found', 'Incident was not found.', {
        incident_id: params.id,
      });
    }

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
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

    return NextResponse.json(toRouteErrorEnvelope(routeError, REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}
