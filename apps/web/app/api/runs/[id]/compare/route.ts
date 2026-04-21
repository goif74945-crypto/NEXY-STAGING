import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  RunIdSchema,
  RunRepositoryStateSchema,
  getRunById,
} from '../../../../../lib/repositories/run-repository';
import { buildSuccessEnvelope } from '../../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../../lib/http/route-error';

const RunCompareParamsSchema = z
  .object({
    id: RunIdSchema,
  })
  .strict();

const RunCompareRouteBodySchema = z
  .object({
    run_state: RunRepositoryStateSchema,
    left_run_id: RunIdSchema,
    right_run_id: RunIdSchema,
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: { id: string } },
): Promise<NextResponse> {
  try {
    RunCompareParamsSchema.parse(context.params);

    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = RunCompareRouteBodySchema.parse(rawBody);
    const left = getRunById(body.run_state, body.left_run_id);
    const right = getRunById(body.run_state, body.right_run_id);

    if (!left) {
      throw createRouteError('not_found', `Run not found: ${body.left_run_id}`);
    }

    if (!right) {
      throw createRouteError('not_found', `Run not found: ${body.right_run_id}`);
    }

    const same_status = left.status === right.status;
    const same_output_class = left.output_class === right.output_class;

    return NextResponse.json(
      buildSuccessEnvelope({
        left,
        right,
        same_status,
        same_output_class,
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
