import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  RunIdSchema,
  RunRepositoryStateSchema,
  RunRecordSchema,
  getRunById,
  updateRunRecord,
} from '../../../../../lib/repositories/run-repository';
import { buildSuccessEnvelope } from '../../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../../lib/http/route-error';

const RunKillParamsSchema = z
  .object({
    id: RunIdSchema,
  })
  .strict();

const RunKillRouteBodySchema = z
  .object({
    state: RunRepositoryStateSchema,
    updated_at_epoch_ms: z.number().int().nonnegative(),
    ended_at_epoch_ms: z.number().int().nonnegative(),
    freeze_reason: z.string().trim().min(1).max(1024),
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const params = RunKillParamsSchema.parse(context.params);

    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = RunKillRouteBodySchema.parse(rawBody);
    const existingRun = getRunById(body.state, params.id);

    if (!existingRun) {
      throw createRouteError('not_found', `Run not found: ${params.id}`);
    }

    const nextRun = RunRecordSchema.parse({
      ...existingRun,
      status: 'failed',
      updated_at_epoch_ms: body.updated_at_epoch_ms,
      ended_at_epoch_ms: body.ended_at_epoch_ms,
      freeze_reason: body.freeze_reason,
    });

    const state = updateRunRecord(body.state, nextRun);
    const run = getRunById(state, params.id);

    if (!run) {
      throw createRouteError('not_found', `Run not found after kill: ${params.id}`);
    }

    return NextResponse.json(
      buildSuccessEnvelope({
        state,
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
}    return NextResponse.json(
      buildSuccessEnvelope({
        state,
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
