import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildFrontPulseView } from '../../../../lib/front/pulse';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const FrontPulseSummarySchema = z
  .object({
    active_sessions: z.number().int().nonnegative(),
    open_incidents: z.number().int().nonnegative(),
    queued_jobs: z.number().int().nonnegative(),
    running_jobs: z.number().int().nonnegative(),
    total_runs: z.number().int().nonnegative(),
  })
  .strict();

const FrontPulseRouteBodySchema = z
  .object({
    summary: FrontPulseSummarySchema,
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

    const body = FrontPulseRouteBodySchema.parse(rawBody);
    const pulse = buildFrontPulseView(body.summary);

    return NextResponse.json(
      buildSuccessEnvelope({
        pulse,
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
