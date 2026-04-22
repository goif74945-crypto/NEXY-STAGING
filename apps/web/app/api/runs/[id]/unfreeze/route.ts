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

const RunUnfreezeNextStatusSchema = z.enum([
  'queued',
  'running',
  'verifying',
  'consensus',
  'stable',
]);

const RunUnfreezeParamsSchema = z
  .object({
    id: RunIdSchema,
  })
  .strict();

const RunUnfreezeRouteBodySchema = z
  .object({
    state: RunRepositoryStateSchema,
    updated_at_epoch_ms: z.number().int().nonnegative(),
    next_status: RunUnfreezeNextStatusSchema,
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const params = RunUnfreezeParamsSchema.parse(context.params);

    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = RunUnfreezeRouteBodySchema.parse(rawBody);
    const existingRun = getRunById(body.state, params.id);

    if (!existingRun) {
      throw createRouteError('not_found', `Run not found: ${params.id}`);
    }

    if (existingRun.status !== 'freeze') {
      throw createRouteError('conflict', `Run is not frozen: ${params.id}`);
    }

    const { freeze_reason: _ignoredFreezeReason, ...restRun } = existingRun;

    const nextRun = RunRecordSchema.parse({
      ...restRun,
      status: body.next_status,
      updated_at_epoch_ms: body.updated_at_epoch_ms,
    });

    const state = updateRunRecord(body.state, nextRun);
    const run = getRunById(state, params.id);

    if (!run) {
      throw createRouteError('not_found', `Run not found after unfreeze: ${params.id}`);
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
      }
