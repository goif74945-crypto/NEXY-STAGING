import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'runs_id_unfreeze_post';

const ParamsSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
  })
  .strict();

const BodySchema = z
  .object({
    next_status: z.enum(['queued', 'running', 'verifying', 'stable']),
    updated_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

const UnfrozenRunSchema = z
  .object({
    run_id: z.string().trim().min(1).max(256),
    status: z.enum(['queued', 'running', 'verifying', 'stable']),
    freeze_reason: z.literal(''),
    updated_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = ParamsSchema.parse(await context.params);
    const body = BodySchema.parse(await request.json());
    const run = UnfrozenRunSchema.parse({
      run_id: params.id,
      status: body.next_status,
      freeze_reason: '',
      updated_at_epoch_ms: body.updated_at_epoch_ms,
    });

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          run,
        },
      }),
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError, REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}
