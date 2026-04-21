import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSuccessEnvelope } from '../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../lib/http/route-error';

const DirectiveModeSchema = z.enum(['owner', 'operator', 'viewer']);

const DirectiveSchema = z
  .object({
    directive_id: z.string().trim().min(1).max(128),
    session_id: z.string().trim().min(1).max(128),
    prompt: z.string().trim().min(1).max(10000),
    mode: DirectiveModeSchema,
    created_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

const DirectivesRouteBodySchema = DirectiveSchema;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const directive = DirectivesRouteBodySchema.parse(rawBody);

    return NextResponse.json(
      buildSuccessEnvelope({
        directive,
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
