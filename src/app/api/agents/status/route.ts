import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'agents_status_get';

const AgentStatusSchema = z.enum(['online', 'idle', 'offline', 'blocked']);

const AgentStatusRecordSchema = z
  .object({
    agent_id: z.string().trim().min(1).max(256),
    status: AgentStatusSchema,
  })
  .strict();

const AGENT_STATUS = [
  AgentStatusRecordSchema.parse({
    agent_id: 'agent_001',
    status: 'online',
  }),
  AgentStatusRecordSchema.parse({
    agent_id: 'agent_002',
    status: 'idle',
  }),
  AgentStatusRecordSchema.parse({
    agent_id: 'agent_003',
    status: 'offline',
  }),
];

export function GET(): NextResponse {
  try {
    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          agents: AGENT_STATUS,
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
