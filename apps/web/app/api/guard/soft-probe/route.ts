import { NextResponse } from 'next/server';
import { z } from 'zod';

import { planSoftProbe } from '../../../../lib/guard/soft-probe';
import { SocialEngineeringSignalSchema } from '../../../../lib/guard/social-engineering';
import { TrustLevelSchema } from '../../../../lib/types/trust-level';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const GuardSoftProbeRouteBodySchema = z
  .object({
    text: z.string().trim().min(1).max(10000),
    trust_level: TrustLevelSchema,
    signals: z.array(SocialEngineeringSignalSchema),
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

    const body = GuardSoftProbeRouteBodySchema.parse(rawBody);
    const probe = planSoftProbe(body);

    return NextResponse.json(
      buildSuccessEnvelope({
        probe,
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
