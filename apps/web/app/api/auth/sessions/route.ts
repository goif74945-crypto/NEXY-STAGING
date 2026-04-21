import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSessionPublicView } from '../../../../lib/auth/session';
import {
  SessionRepositoryStateSchema,
  listSessionsBySubject,
} from '../../../../lib/repositories/session-repository';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';
import { SessionSubjectSchema } from '../../../../packages/auth/session';

const SessionsRouteBodySchema = z
  .object({
    state: SessionRepositoryStateSchema,
    subject: SessionSubjectSchema,
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

    const body = SessionsRouteBodySchema.parse(rawBody);
    const sessions = listSessionsBySubject(body.state, body.subject).map((record) =>
      buildSessionPublicView(record),
    );

    return NextResponse.json(
      buildSuccessEnvelope({
        sessions,
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