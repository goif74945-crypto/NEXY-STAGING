import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSuccessEnvelope } from '../../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../../lib/http/route-error';

const UniverseQuarantineParamsSchema = z
  .object({
    universeId: z.string().trim().min(1).max(256),
  })
  .strict();

const UniverseQuarantineBodySchema = z
  .object({
    quota: z.string().trim().min(1).max(256),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: Promise<{ universeId: string }> },
): Promise<NextResponse> {
  try {
    const params = UniverseQuarantineParamsSchema.parse(await context.params);

    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = UniverseQuarantineBodySchema.parse(rawBody);

    return NextResponse.json(
      buildSuccessEnvelope({
        universe_id: params.universeId,
        state: 'quarantined' as const,
        quota: body.quota,
        quarantined: true as const,
        reason: body.reason,
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
