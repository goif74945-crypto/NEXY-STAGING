import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const BuildSpecBodySchema = z
  .object({
    spec_id: z.string().trim().min(1).max(256),
    version: z.string().trim().min(1).max(128),
    canonical_json: z.string().trim().min(1).max(100000),
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

    const body = BuildSpecBodySchema.parse(rawBody);

    return NextResponse.json(
      buildSuccessEnvelope({
        spec_id: body.spec_id,
        version: body.version,
        canonical_json: body.canonical_json,
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
