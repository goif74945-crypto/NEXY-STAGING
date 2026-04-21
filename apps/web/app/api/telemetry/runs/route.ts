import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildTelemetryRunPoints } from '../../../../lib/repositories/telemetry-repository';
import { RunRepositoryStateSchema } from '../../../../lib/repositories/run-repository';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const TelemetryRunsRouteBodySchema = z
  .object({
    run_state: RunRepositoryStateSchema,
    limit: z.number().int().nonnegative().optional(),
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

    const body = TelemetryRunsRouteBodySchema.parse(rawBody);
    const points = buildTelemetryRunPoints(body.run_state, body.limit);

    return NextResponse.json(
      buildSuccessEnvelope({
        points,
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
