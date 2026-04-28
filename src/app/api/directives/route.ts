import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';
import { ModeSchema } from '@/lib/auth/mode-access';

const GET_REQUEST_ID = 'directives_get';
const POST_REQUEST_ID = 'directives_post';

const DirectiveSchema = z
  .object({
    directive_id: z.string().trim().min(1).max(256),
    session_id: z.string().trim().min(1).max(256),
    prompt: z.string().trim().min(1).max(4096),
    mode: ModeSchema,
    created_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

const CreateDirectiveBodySchema = z
  .object({
    directive_id: z.string().trim().min(1).max(256),
    session_id: z.string().trim().min(1).max(256),
    prompt: z.string().trim().min(1).max(4096),
    mode: ModeSchema,
    created_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

const DIRECTIVES = [
  DirectiveSchema.parse({
    directive_id: 'directive_001',
    session_id: 'session_owner_001',
    prompt: 'Inspect deterministic route state.',
    mode: 'VIEW',
    created_at_epoch_ms: 1_700_000_000_000,
  }),
];

export function GET(): NextResponse {
  try {
    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: GET_REQUEST_ID,
        data: {
          directives: DIRECTIVES,
        },
      }),
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError, GET_REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const directive = DirectiveSchema.parse(
      CreateDirectiveBodySchema.parse(await request.json()),
    );

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: POST_REQUEST_ID,
        data: {
          directive,
        },
      }),
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError, POST_REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}
