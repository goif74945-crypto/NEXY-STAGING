import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  VerifyOtacPayloadSchema,
  verifyOtacRecordAttempt,
} from '../../../../lib/auth/otac';
import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';
import { OtacRecordSchema } from '../../../../packages/auth/otac';

const VerifyOtacRouteBodySchema = z
  .object({
    record: OtacRecordSchema,
    verification: VerifyOtacPayloadSchema,
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

    const body = VerifyOtacRouteBodySchema.parse(rawBody);
    const result = verifyOtacRecordAttempt(body.record, body.verification);

    return NextResponse.json(buildSuccessEnvelope(result), {
      status: 200,
    });
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}