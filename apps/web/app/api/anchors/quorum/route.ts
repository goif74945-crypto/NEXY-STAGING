import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const AnchorQuorumBodySchema = z
  .object({
    anchor_id: z.string().trim().min(1).max(256),
    required_signers: z.array(z.string().trim().min(1).max(256)),
    signed_signers: z.array(z.string().trim().min(1).max(256)),
    quorum_reached: z.boolean(),
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

    const body = AnchorQuorumBodySchema.parse(rawBody);

    return NextResponse.json(
      buildSuccessEnvelope({
        anchor_id: body.anchor_id,
        required_signers: body.required_signers,
        signed_signers: body.signed_signers,
        quorum_reached: body.quorum_reached,
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
