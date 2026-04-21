import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  ArtifactRepositoryStateSchema,
  listArtifactsByRunId,
} from '../../../../../lib/repositories/artifact-repository';
import { RunIdSchema } from '../../../../../lib/repositories/run-repository';
import { buildSuccessEnvelope } from '../../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../../lib/http/route-error';

const RunHistoryParamsSchema = z
  .object({
    id: RunIdSchema,
  })
  .strict();

const RunHistoryRouteBodySchema = z
  .object({
    artifact_state: ArtifactRepositoryStateSchema,
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const params = RunHistoryParamsSchema.parse(context.params);

    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = RunHistoryRouteBodySchema.parse(rawBody);
    const artifacts = listArtifactsByRunId(body.artifact_state, params.id);

    return NextResponse.json(
      buildSuccessEnvelope({
        artifacts,
        count: artifacts.length,
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
