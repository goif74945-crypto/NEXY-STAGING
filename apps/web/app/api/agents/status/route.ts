import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildDashboardAgentStatuses } from '../../../../lib/repositories/dashboard-repository';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';
import { WorkerStateSchema } from '../../../../packages/queue/workers';

const AgentsStatusRouteBodySchema = z
  .object({
    worker_state: WorkerStateSchema,
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

    const body = AgentsStatusRouteBodySchema.parse(rawBody);
    const agents = buildDashboardAgentStatuses(body.worker_state);

    return NextResponse.json(
      buildSuccessEnvelope({
        agents,
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