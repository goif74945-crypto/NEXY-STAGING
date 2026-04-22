import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSuccessEnvelope } from '../../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../../lib/http/route-error';

const UniverseStartParamsSchema = z
  .object({
    universeId: z.string().trim().min(1).max(256),
  })
  .strict();

const UniverseStartBodySchema = z
  .object({
    quota: z.string().trim().min(1).max(256),
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: Promise<{ universeId: string }> },
): Promise<NextResponse> {
  try {
    const params = UniverseStartParamsSchema.parse(await context.params);

    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = UniverseStartBodySchema.parse(rawBody);

    return NextResponse.json(
      buildSuccessEnvelope({
        universe_id: params.universeId,
        state: 'running' as const,
        quota: body.quota,
        quarantined: false as const,
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
