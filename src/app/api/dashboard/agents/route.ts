import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'dashboard_agents_get';

const AgentSummarySchema = z
  .object({
    agent_id: z.string().trim().min(1).max(256),
    label: z.string().trim().min(1).max(256),
    status: z.enum(['online', 'idle', 'offline', 'blocked']),
    current_run_id: z.string().trim().min(1).max(256),
  })
  .strict();

const AGENTS = [
  AgentSummarySchema.parse({
    agent_id: 'agent_001',
    label: 'Judge agent',
    status: 'online',
    current_run_id: 'run_004',
  }),
  AgentSummarySchema.parse({
    agent_id: 'agent_002',
    label: 'Swarm agent',
    status: 'idle',
    current_run_id: 'none',
  }),
];

export function GET(): NextResponse {
  try {
    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          agents: AGENTS,
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
