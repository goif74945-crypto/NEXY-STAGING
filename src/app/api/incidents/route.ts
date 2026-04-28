import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const GET_REQUEST_ID = 'incidents_get';
const POST_REQUEST_ID = 'incidents_post';

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

const IncidentCreateBodySchema = z
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

export function GET(): NextResponse {
  try {
    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: GET_REQUEST_ID,
        data: {
          incidents: INCIDENTS,
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
    const incident = IncidentSchema.parse(
      IncidentCreateBodySchema.parse(await request.json()),
    );

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
