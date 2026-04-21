import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireSession } from '../../../../lib/auth/require-session';
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
import { SessionRecordSchema, SessionTokenSchema } from '../../../../packages/auth/session';

const LogoutRouteBodySchema = z
  .object({
    state: SessionRepositoryStateSchema,
    record: SessionRecordSchema.nullable().optional(),
    token: SessionTokenSchema.nullable().optional(),
    current_epoch_ms: z.number().int().nonnegative(),
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

    const body = LogoutRouteBodySchema.parse(rawBody);
    const gate = requireSession({
      record: body.record,
      token: body.token,
      current_epoch_ms: body.current_epoch_ms,
    });

    if (!gate.allowed || !gate.session) {
      return NextResponse.json(buildSuccessEnvelope(gate), {
        status: 200,
      });
    }

    const state = revokeSessionById(
      body.state,
      gate.session.session_id,
      body.revoked_at_epoch_ms,
    );
    const revoked_session = getSessionById(state, gate.session.session_id);

    return NextResponse.json(
      buildSuccessEnvelope({
        gate,
        state,
        revoked_session,
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