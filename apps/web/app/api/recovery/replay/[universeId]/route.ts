import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSuccessEnvelope } from '../../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../../lib/http/route-error';

const RecoveryReplayParamsSchema = z
  .object({
    universeId: z.string().trim().min(1).max(256),
  })
  .strict();

const RecoveryReplayBodySchema = z
  .object({
    ready: z.boolean(),
    summary: z.string().trim().min(1).max(4096),
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: Promise<{ universeId: string }> },
): Promise<NextResponse> {
  try {
    const params = RecoveryReplayParamsSchema.parse(await context.params);

    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = RecoveryReplayBodySchema.parse(rawBody);

    return NextResponse.json(
      buildSuccessEnvelope({
        universe_id: params.universeId,
        mode: 'exact_replay' as const,
        ready: body.ready,
        summary: body.summary,
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
