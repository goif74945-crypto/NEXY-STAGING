import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const BuildDeployBodySchema = z
  .object({
    artifact_id: z.string().trim().min(1).max(256),
    artifact_hash: z.string().trim().min(1).max(256),
    target: z.string().trim().min(1).max(256),
    deployed: z.boolean(),
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

    const body = BuildDeployBodySchema.parse(rawBody);

    return NextResponse.json(
      buildSuccessEnvelope({
        artifact_id: body.artifact_id,
        artifact_hash: body.artifact_hash,
        target: body.target,
        deployed: body.deployed,
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
