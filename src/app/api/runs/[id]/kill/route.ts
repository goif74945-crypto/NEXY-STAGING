import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'runs_id_kill_post';

const ParamsSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
  })
  .strict();

const BodySchema = z
  .object({
    ended_at_epoch_ms: z.number().int().nonnegative(),
    freeze_reason: z.string().trim().min(1).max(4096),
  })
  .strict();

const KilledRunSchema = z
  .object({
    run_id: z.string().trim().min(1).max(256),
    status: z.literal('failed'),
    ended_at_epoch_ms: z.number().int().nonnegative(),
    freeze_reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = ParamsSchema.parse(await context.params);
    const body = BodySchema.parse(await request.json());
    const run = KilledRunSchema.parse({
      run_id: params.id,
      status: 'failed',
      ended_at_epoch_ms: body.ended_at_epoch_ms,
      freeze_reason: body.freeze_reason,
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
