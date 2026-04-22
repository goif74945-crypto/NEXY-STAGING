import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  ArtifactIdSchema,
  ArtifactRepositoryStateSchema,
  getArtifactById,
} from '../../../../../lib/repositories/artifact-repository';
import { buildSuccessEnvelope } from '../../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../../lib/http/route-error';

const ArtifactLockParamsSchema = z
  .object({
    id: ArtifactIdSchema,
  })
  .strict();

const ArtifactLockRouteBodySchema = z
  .object({
    artifact_state: ArtifactRepositoryStateSchema,
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = ArtifactLockParamsSchema.parse(await context.params);

    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = ArtifactLockRouteBodySchema.parse(rawBody);
    const artifact = getArtifactById(body.artifact_state, params.id);

    if (!artifact) {
      throw createRouteError('not_found', `Artifact not found: ${params.id}`);
    }

    return NextResponse.json(
      buildSuccessEnvelope({
        artifact,
        locked: true as const,
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
