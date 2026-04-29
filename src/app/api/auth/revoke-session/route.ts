import { NextResponse } from 'next/server';

import {
  getAuthFixtureNowEpochMs,
  getCurrentSessionFixture,
  getSessionRevokedAtEpochMs,
  revokeSessionFixture,
  SessionRevocationBodySchema,
} from '@/lib/auth/session';
import { requireOperatorOrOwner } from '@/lib/auth/require-operator-or-owner';
import { makeEnvelope } from '@/lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'auth_revoke_session_post';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = SessionRevocationBodySchema.parse(await request.json());

    requireOperatorOrOwner({
      session: getCurrentSessionFixture(),
      now_epoch_ms: getAuthFixtureNowEpochMs(),
    });

    const revokedSession = revokeSessionFixture({
      session_id: body.session_id,
      revoked_at_epoch_ms: getSessionRevokedAtEpochMs(),
    });

    if (revokedSession === null) {
      throw createRouteError('not_found', 'Session was not found.', {
        session_id: body.session_id,
      });
    }

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          auth_mode: 'deterministic_fixture_not_production',
          revoked: true,
          session: revokedSession,
        },
      }),
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError, REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}
