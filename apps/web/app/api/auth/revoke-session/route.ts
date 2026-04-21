import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  SessionRepositoryStateSchema,
  getSessionById,
  revokeSessionById,
} from '../../../../lib/repositories/session-repository';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const RevokeSessionRouteBodySchema = z
  .object({
    state: SessionRepositoryStateSchema,
    session_id: z.string().trim().min(1).max(128),
    revoked_at_epoch_ms: z.number().int().nonnegative(),
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

    const body = RevokeSessionRouteBodySchema.parse(rawBody);
    const state = revokeSessionById(
      body.state,
      body.session_id,
      body.revoked_at_epoch_ms,
    );
    const session = getSessionById(state, body.session_id);

    return NextResponse.json(
      buildSuccessEnvelope({
        state,
        session,
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