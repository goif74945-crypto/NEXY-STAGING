import { NextResponse } from 'next/server';

import {
  buildDeterministicSession,
  buildDeterministicSessionList,
} from '@/lib/auth/session';
import { requireSession } from '@/lib/auth/require-session';
import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'auth_sessions_get';
const NOW_EPOCH_MS = 1_700_000_000_000;

const CURRENT_SESSION = buildDeterministicSession({
  session_id: 'session_owner_001',
  user_id: 'user_owner_001',
  email: 'owner@nexy.local',
  role: 'OWNER',
  device_id: 'device_owner_001',
  issued_at_epoch_ms: 1_699_999_000_000,
  expires_at_epoch_ms: 1_800_000_000_000,
  revoked_at_epoch_ms: null,
});

const SESSION_LIST = buildDeterministicSessionList([
  CURRENT_SESSION,
  {
    session_id: 'session_operator_001',
    user_id: 'user_operator_001',
    email: 'operator@nexy.local',
    role: 'OPERATOR',
    device_id: 'device_operator_001',
    issued_at_epoch_ms: 1_699_999_100_000,
    expires_at_epoch_ms: 1_800_000_000_000,
    revoked_at_epoch_ms: null,
  },
]);

export function GET(): NextResponse {
  try {
    requireSession({
      session: CURRENT_SESSION,
      now_epoch_ms: NOW_EPOCH_MS,
    });

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          sessions: SESSION_LIST,
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
