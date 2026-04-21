import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  RequestOtacPayloadSchema,
  buildOtacPublicView,
  createOtacRecordFromPayload,
} from '../../../../lib/auth/otac';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';

const RequestOtacRouteBodySchema = z
  .object({
    payload: RequestOtacPayloadSchema,
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

    const body = RequestOtacRouteBodySchema.parse(rawBody);
    const record = createOtacRecordFromPayload(body.payload);
    const public_view = buildOtacPublicView(record);

    return NextResponse.json(
      buildSuccessEnvelope({
        record,
        public_view,
      }),
      { status: 200 },
    );
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}