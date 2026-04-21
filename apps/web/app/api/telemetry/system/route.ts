import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildTelemetrySystemSnapshot } from '../../../../lib/repositories/telemetry-repository';
import { parseIncidentRepositoryState } from '../../../../lib/repositories/incident-repository';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';
import { EventLogStateSchema } from '../../../../packages/obs/event-log';
import { QueueStateSchema } from '../../../../packages/queue/jobs';
import { WorkerStateSchema } from '../../../../packages/queue/workers';

const TelemetrySystemRouteBodySchema = z
  .object({
    event_state: EventLogStateSchema,
    incident_state: z.unknown(),
    queue_state: QueueStateSchema,
    worker_state: WorkerStateSchema,
    generated_at_epoch_ms: z.number().int().nonnegative(),
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

    const body = TelemetrySystemRouteBodySchema.parse(rawBody);
    const incident_state = parseIncidentRepositoryState(body.incident_state);

    const snapshot = buildTelemetrySystemSnapshot(
      body.event_state,
      incident_state,
      body.queue_state,
      body.worker_state,
      body.generated_at_epoch_ms,
    );

    return NextResponse.json(buildSuccessEnvelope(snapshot), {
      status: 200,
    });
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
    }
