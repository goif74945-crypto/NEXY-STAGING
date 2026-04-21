import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildDashboardSummary } from '../../../../lib/repositories/dashboard-repository';
import {
  parseIncidentRepositoryState,
} from '../../../../lib/repositories/incident-repository';
import {
  parseRunRepositoryState,
} from '../../../../lib/repositories/run-repository';
import {
  SessionRepositoryStateSchema,
} from '../../../../lib/repositories/session-repository';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';
import { QueueStateSchema } from '../../../../packages/queue/jobs';

const DashboardSummaryRouteBodySchema = z
  .object({
    session_state: SessionRepositoryStateSchema,
    incident_state: z.unknown(),
    queue_state: QueueStateSchema,
    run_state: z.unknown(),
    current_epoch_ms: z.number().int().nonnegative(),
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

    const body = DashboardSummaryRouteBodySchema.parse(rawBody);
    const incident_state = parseIncidentRepositoryState(body.incident_state);
    const run_state = parseRunRepositoryState(body.run_state);

    const summary = buildDashboardSummary(
      body.session_state,
      incident_state,
      body.queue_state,
      run_state,
      body.current_epoch_ms,
    );

    return NextResponse.json(buildSuccessEnvelope(summary), {
      status: 200,
    });
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}