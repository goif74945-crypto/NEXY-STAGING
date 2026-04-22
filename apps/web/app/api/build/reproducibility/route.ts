import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const BuildReproducibilityBodySchema = z
  .object({
    spec_hash: z.string().trim().min(1).max(256),
    artifact_hash: z.string().trim().min(1).max(256),
    reproducible: z.boolean(),
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

    const body = BuildReproducibilityBodySchema.parse(rawBody);

    return NextResponse.json(
      buildSuccessEnvelope({
        spec_hash: body.spec_hash,
        artifact_hash: body.artifact_hash,
        reproducible: body.reproducible,
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
