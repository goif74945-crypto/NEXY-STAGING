import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const AnchorSignBodySchema = z
  .object({
    anchor_id: z.string().trim().min(1).max(256),
    signer: z.string().trim().min(1).max(256),
    signed_at_epoch_ms: z.number().int().nonnegative(),
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

    const body = AnchorSignBodySchema.parse(rawBody);

    return NextResponse.json(
      buildSuccessEnvelope({
        anchor_id: body.anchor_id,
        signer: body.signer,
        state: 'signed' as const,
        signed_at_epoch_ms: body.signed_at_epoch_ms,
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
