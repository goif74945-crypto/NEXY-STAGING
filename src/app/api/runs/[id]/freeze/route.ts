import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'runs_id_freeze_post';

const ParamsSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
  })
  .strict();

const BodySchema = z
  .object({
    freeze_reason: z.string().trim().min(1).max(4096),
    updated_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

const FrozenRunSchema = z
  .object({
    run_id: z.string().trim().min(1).max(256),
    status: z.literal('freeze'),
    freeze_reason: z.string().trim().min(1).max(4096),
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
    const run = FrozenRunSchema.parse({
      run_id: params.id,
      status: 'freeze',
      freeze_reason: body.freeze_reason,
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
