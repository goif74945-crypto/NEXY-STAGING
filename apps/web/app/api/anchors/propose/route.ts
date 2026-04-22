import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const AnchorProposeBodySchema = z
  .object({
    anchor_id: z.string().trim().min(1).max(256),
    batch_id: z.string().trim().min(1).max(256),
    proposed_at_epoch_ms: z.number().int().nonnegative(),
    region: z.string().trim().min(1).max(128),
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

    const body = AnchorProposeBodySchema.parse(rawBody);

    return NextResponse.json(
      buildSuccessEnvelope({
        anchor_id: body.anchor_id,
        batch_id: body.batch_id,
        state: 'proposed' as const,
        proposed_at_epoch_ms: body.proposed_at_epoch_ms,
        region: body.region,
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
