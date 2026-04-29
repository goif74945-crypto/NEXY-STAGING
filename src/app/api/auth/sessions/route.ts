import { NextResponse } from 'next/server';

import {
  getAuthFixtureNowEpochMs,
  getCurrentSessionFixture,
  listSessionFixtures,
} from '@/lib/auth/session';
import { requireSession } from '@/lib/auth/require-session';
import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'auth_sessions_get';

export function GET(): NextResponse {
  try {
    requireSession({
      session: getCurrentSessionFixture(),
      now_epoch_ms: getAuthFixtureNowEpochMs(),
    });

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          auth_mode: 'deterministic_fixture_not_production',
          sessions: listSessionFixtures(),
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
