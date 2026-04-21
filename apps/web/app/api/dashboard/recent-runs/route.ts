import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildDashboardRecentRuns } from '../../../../lib/repositories/dashboard-repository';
import { RunRepositoryStateSchema } from '../../../../lib/repositories/run-repository';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const DashboardRecentRunsRouteBodySchema = z
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

    const body = DashboardRecentRunsRouteBodySchema.parse(rawBody);
    const runs = buildDashboardRecentRuns(body.run_state, body.limit);

    return NextResponse.json(
      buildSuccessEnvelope({
        runs,
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
