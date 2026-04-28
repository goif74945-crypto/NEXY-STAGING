import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildDeterministicSession } from '@/lib/auth/session';
import { requireOperatorOrOwner } from '@/lib/auth/require-operator-or-owner';
import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'auth_revoke_session_post';
const NOW_EPOCH_MS = 1_700_000_000_000;
const REVOKED_AT_EPOCH_MS = 1_700_000_020_000;

const BodySchema = z
  .object({
    session_id: z.string().trim().min(1).max(256),
  })
  .strict();

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

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = BodySchema.parse(await request.json());

    requireOperatorOrOwner({
      session: CURRENT_SESSION,
      now_epoch_ms: NOW_EPOCH_MS,
    });

    const revokedSession = buildDeterministicSession({
      session_id: body.session_id,
      user_id: 'target_user',
      email: 'target@nexy.local',
      role: 'OPERATOR',
      device_id: 'target_device',
      issued_at_epoch_ms: 1_699_998_000_000,
      expires_at_epoch_ms: 1_800_000_000_000,
      revoked_at_epoch_ms: REVOKED_AT_EPOCH_MS,
    });

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
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
