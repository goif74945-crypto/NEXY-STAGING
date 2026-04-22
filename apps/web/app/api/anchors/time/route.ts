import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const AnchorTimeBodySchema = z
  .object({
    anchor_id: z.string().trim().min(1).max(256),
    tsa_epoch_ms: z.number().int().nonnegative(),
    time_policy: z.string().trim().min(1).max(256),
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

    const body = AnchorTimeBodySchema.parse(rawBody);

    return NextResponse.json(
      buildSuccessEnvelope({
        anchor_id: body.anchor_id,
        tsa_epoch_ms: body.tsa_epoch_ms,
        time_policy: body.time_policy,
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
