import { NextResponse } from 'next/server';

import {
  getAllOtherSessionsRevokedAtEpochMs,
  getAuthFixtureNowEpochMs,
  getCurrentSessionFixture,
  revokeAllOtherSessionFixtures,
} from '@/lib/auth/session';
import { requireSession } from '@/lib/auth/require-session';
import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'auth_revoke_all_other_sessions_post';

export function POST(): NextResponse {
  try {
    const { session } = requireSession({
      session: getCurrentSessionFixture(),
      now_epoch_ms: getAuthFixtureNowEpochMs(),
    });

    const revokedSessions = revokeAllOtherSessionFixtures({
      current_session_id: session.session_id,
      revoked_at_epoch_ms: getAllOtherSessionsRevokedAtEpochMs(),
    });

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          auth_mode: 'deterministic_fixture_not_production',
          current_session_id: session.session_id,
          revoked_count: revokedSessions.length,
          revoked_sessions: revokedSessions,
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
