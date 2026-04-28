import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'dashboard_incidents_get';

const IncidentSeveritySchema = z.enum(['S0', 'S1', 'S2', 'S3', 'S4', 'S5']);
const IncidentStatusSchema = z.enum(['open', 'investigating', 'resolved']);

const DashboardIncidentSchema = z
  .object({
    incident_id: z.string().trim().min(1).max(256),
    severity: IncidentSeveritySchema,
    status: IncidentStatusSchema,
    title: z.string().trim().min(1).max(256),
  })
  .strict();

const INCIDENTS = [
  DashboardIncidentSchema.parse({
    incident_id: 'incident_001',
    severity: 'S2',
    status: 'open',
    title: 'Deterministic queue pressure',
  }),
  DashboardIncidentSchema.parse({
    incident_id: 'incident_002',
    severity: 'S1',
    status: 'investigating',
    title: 'Telemetry warning threshold',
  }),
];

export function GET(): NextResponse {
  try {
    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
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

    return NextResponse.json(toRouteErrorEnvelope(routeError, REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}
