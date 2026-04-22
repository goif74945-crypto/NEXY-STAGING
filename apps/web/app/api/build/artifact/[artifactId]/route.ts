import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSuccessEnvelope } from '../../../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../../../lib/http/route-error';

const BuildArtifactParamsSchema = z
  .object({
    artifactId: z.string().trim().min(1).max(256),
  })
  .strict();

const BuildArtifactBodySchema = z
  .object({
    artifact_hash: z.string().trim().min(1).max(256),
    version: z.string().trim().min(1).max(128),
    sealed: z.boolean(),
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: Promise<{ artifactId: string }> },
): Promise<NextResponse> {
  try {
    const params = BuildArtifactParamsSchema.parse(await context.params);

    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = BuildArtifactBodySchema.parse(rawBody);

    return NextResponse.json(
      buildSuccessEnvelope({
        artifact_id: params.artifactId,
        artifact_hash: body.artifact_hash,
        version: body.version,
        sealed: body.sealed,
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
