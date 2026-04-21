import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireSession } from '../../../../lib/auth/require-session';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';
import { SessionRecordSchema, SessionTokenSchema } from '../../../../packages/auth/session';

const MeRouteBodySchema = z
  .object({
    record: SessionRecordSchema.nullable().optional(),
    token: SessionTokenSchema.nullable().optional(),
    current_epoch_ms: z.number().int().nonnegative(),
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

    const body = MeRouteBodySchema.parse(rawBody);
    const gate = requireSession(body);

    return NextResponse.json(buildSuccessEnvelope(gate), {
      status: 200,
    });
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}