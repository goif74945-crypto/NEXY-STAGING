import { NextResponse } from 'next/server';
import { z } from 'zod';

import { planCompanionReply } from '../../../../lib/dialog/companion';
import { buildReasonSummaryView } from '../../../../lib/dialog/reason-summary';
import { IntentModeSchema } from '../../../../lib/types/intent-mode';
import { TrustLevelSchema } from '../../../../lib/types/trust-level';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const CompanionReplyRouteBodySchema = z
  .object({
    text: z.string().trim().min(1).max(10000),
    mode: IntentModeSchema,
    trust_level: TrustLevelSchema,
    reasons: z.array(z.string().trim().min(1).max(512)),
    max_reason_items: z.number().int().nonnegative(),
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

    const body = CompanionReplyRouteBodySchema.parse(rawBody);
    const plan = planCompanionReply({
      text: body.text,
      mode: body.mode,
      trust_level: body.trust_level,
    });
    const reason_summary = buildReasonSummaryView({
      reasons: body.reasons,
      max_items: body.max_reason_items,
    });

    return NextResponse.json(
      buildSuccessEnvelope({
        plan,
        reason_summary,
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
