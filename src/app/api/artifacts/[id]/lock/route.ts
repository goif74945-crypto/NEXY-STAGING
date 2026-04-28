import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'artifacts_id_lock_post';

const ParamsSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
  })
  .strict();

const LockBodySchema = z
  .object({
    locked_by: z.string().trim().min(1).max(256),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

const ArtifactLockResultSchema = z
  .object({
    artifact_id: z.string().trim().min(1).max(256),
    locked: z.literal(true),
    locked_by: z.string().trim().min(1).max(256),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = ParamsSchema.parse(await context.params);
    const body = LockBodySchema.parse(await request.json());
    const result = ArtifactLockResultSchema.parse({
      artifact_id: params.id,
      locked: true,
      locked_by: body.locked_by,
      reason: body.reason,
    });

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: result,
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
