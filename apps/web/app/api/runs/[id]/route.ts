import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  RunIdSchema,
  RunRepositoryStateSchema,
  getRunById,
} from '../../../../lib/repositories/run-repository';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const RunByIdParamsSchema = z
  .object({
    id: RunIdSchema,
  })
  .strict();

const RunByIdRouteBodySchema = z
  .object({
    state: RunRepositoryStateSchema,
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const params = RunByIdParamsSchema.parse(context.params);

    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = RunByIdRouteBodySchema.parse(rawBody);
    const run = getRunById(body.state, params.id);

    if (!run) {
      throw createRouteError('not_found', `Run not found: ${params.id}`);
    }

    return NextResponse.json(
      buildSuccessEnvelope({
        run,
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
