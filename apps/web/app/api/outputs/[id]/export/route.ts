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

const OutputExportParamsSchema = z
  .object({
    id: ArtifactIdSchema,
  })
  .strict();

const OutputExportRouteBodySchema = z
  .object({
    artifact_state: ArtifactRepositoryStateSchema,
  })
  .strict();

export async function POST(
  request: Request,
  context: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const params = OutputExportParamsSchema.parse(context.params);

    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = OutputExportRouteBodySchema.parse(rawBody);
    const artifact = getArtifactById(body.artifact_state, params.id);

    if (!artifact) {
      throw createRouteError('not_found', `Artifact not found: ${params.id}`);
    }

    const export_payload = {
      artifact_id: artifact.artifact_id,
      artifact_type: artifact.artifact_type,
      version: artifact.version,
      payload_hash: artifact.payload_hash,
      payload: artifact.payload,
    };

    return NextResponse.json(
      buildSuccessEnvelope({
        artifact,
        export_payload,
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
        }    return NextResponse.json(toRouteErrorEnvelope(routeError), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}​
