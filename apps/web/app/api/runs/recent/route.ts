import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  RunRepositoryStateSchema,
  listRecentRuns,
} from '../../../../lib/repositories/run-repository';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const RunsRecentRouteBodySchema = z
  .object({
    state: RunRepositoryStateSchema,
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

    const body = RunsRecentRouteBodySchema.parse(rawBody);
    const runs = listRecentRuns(body.state, body.limit);

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
