import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildReasonSummaryView } from '../../../../lib/dialog/reason-summary';
import { routeDialogReply } from '../../../../lib/dialog/reply-routing';
import { IntentModeSchema } from '../../../../lib/types/intent-mode';
import { TrustLevelSchema } from '../../../../lib/types/trust-level';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const DialogReplyRouteBodySchema = z
  .object({
    text: z.string().trim().min(1).max(10000),
    mode: IntentModeSchema,
    trust_level: TrustLevelSchema,
    has_incidents: z.boolean(),
    first_contact: z.boolean(),
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

    const body = DialogReplyRouteBodySchema.parse(rawBody);

    const routing = routeDialogReply({
      mode: body.mode,
      trust_level: body.trust_level,
      has_incidents: body.has_incidents,
      first_contact: body.first_contact,
    });

    const reason_summary = buildReasonSummaryView({
      reasons: body.reasons,
      max_items: body.max_reason_items,
    });

    return NextResponse.json(
      buildSuccessEnvelope({
        routing,
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
