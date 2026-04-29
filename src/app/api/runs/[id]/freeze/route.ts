import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  getAuthFixtureNowEpochMs,
  getCurrentSessionFixture,
} from '@/lib/auth/session';
import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';
import {
  FreezeRunWithAuthorityBodySchema,
  freezeRunWithAuthority,
} from '@/lib/run/state-control';

const REQUEST_ID = 'runs_id_freeze_post';

const ParamsSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = ParamsSchema.parse(await context.params);
    const body = FreezeRunWithAuthorityBodySchema.parse(await request.json());
    const session = getCurrentSessionFixture();
    const result = freezeRunWithAuthority({
      run_id: params.id,
      session,
      now_epoch_ms: getAuthFixtureNowEpochMs(),
      actor_id: session.user_id,
      authority_source: body.authority_source,
      reason_code: body.reason_code,
      controlled_at_epoch_ms: body.controlled_at_epoch_ms,
    });

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          auth_mode: 'deterministic_fixture_not_production',
          result,
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
