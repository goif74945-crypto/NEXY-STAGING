import { NextResponse } from 'next/server';
import { z } from 'zod';

import { classifyFirstContact } from '../../../../lib/front/first-contact';
import { inferFrontIntent } from '../../../../lib/front/intent-engine';
import { IntentModeSchema } from '../../../../lib/types/intent-mode';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const FrontIntentRouteBodySchema = z
  .object({
    text: z.string().trim().min(1).max(10000),
    session_role: IntentModeSchema.optional(),
    session_known: z.boolean(),
    has_history: z.boolean(),
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

    const body = FrontIntentRouteBodySchema.parse(rawBody);

    const first_contact = classifyFirstContact({
      text: body.text,
      session_known: body.session_known,
      has_history: body.has_history,
    });

    const intent = inferFrontIntent({
      text: body.text,
      session_role: body.session_role,
      first_contact: first_contact.first_contact,
    });

    return NextResponse.json(
      buildSuccessEnvelope({
        first_contact,
        intent,
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
