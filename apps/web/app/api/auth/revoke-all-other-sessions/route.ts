import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  SessionRepositoryStateSchema,
  listSessionsBySubject,
  revokeAllOtherSessionsForSubject,
} from '../../../../lib/repositories/session-repository';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';
import { SessionSubjectSchema } from '../../../../packages/auth/session';

const RevokeAllOtherSessionsRouteBodySchema = z
  .object({
    state: SessionRepositoryStateSchema,
    subject: SessionSubjectSchema,
    keep_session_id: z.string().trim().min(1).max(128),
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

    const body = RevokeAllOtherSessionsRouteBodySchema.parse(rawBody);
    const state = revokeAllOtherSessionsForSubject(
      body.state,
      body.subject,
      body.keep_session_id,
      body.revoked_at_epoch_ms,
    );
    const sessions = listSessionsBySubject(state, body.subject);

    return NextResponse.json(
      buildSuccessEnvelope({
        state,
        sessions,
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