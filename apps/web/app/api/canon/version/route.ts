import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const CanonVersionBodySchema = z
  .object({
    version: z.string().trim().min(1).max(128),
    branch: z.string().trim().min(1).max(256),
    amendment_count: z.number().int().nonnegative(),
    forked: z.boolean(),
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

    const body = CanonVersionBodySchema.parse(rawBody);

    return NextResponse.json(
      buildSuccessEnvelope({
        version: body.version,
        branch: body.branch,
        amendment_count: body.amendment_count,
        forked: body.forked,
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
