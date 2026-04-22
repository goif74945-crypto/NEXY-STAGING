import { NextResponse } from 'next/server';
import { z } from 'zod';

import { assessSocialEngineeringSignals } from '../../../../lib/guard/social-engineering';
import { evaluateHardStop } from '../../../../lib/guard/hard-stop';
import { IntentModeSchema } from '../../../../lib/types/intent-mode';
import { TrustLevelSchema } from '../../../../lib/types/trust-level';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const GuardCheckRouteBodySchema = z
  .object({
    text: z.string().trim().min(1).max(10000),
    trust_level: TrustLevelSchema,
    session_role: IntentModeSchema,
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

    const body = GuardCheckRouteBodySchema.parse(rawBody);
    const assessment = assessSocialEngineeringSignals(body.text);
    const credential_request = assessment.signals.includes('credential_request');
    const result = evaluateHardStop({
      trust_level: body.trust_level,
      signals: assessment.signals,
      credential_request,
      session_role: body.session_role,
    });

    return NextResponse.json(
      buildSuccessEnvelope({
        assessment,
        result,
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
