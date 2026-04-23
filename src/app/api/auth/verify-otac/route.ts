import { NextResponse } from 'next/server';
import { z } from 'zod';

import { SESSION_ROLES } from '@/lib/auth/session-types';
import { makeEnvelope } from '@/lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const VerifyOtacRoleSchema = z.enum(SESSION_ROLES);

const VerifyOtacRecordSchema = z
  .object({
    otac_id: z.string().trim().min(1).max(256),
    user_id: z.string().trim().min(1).max(256),
    email: z.string().trim().email(),
    role: VerifyOtacRoleSchema,
    device_id: z.string().trim().min(1).max(256),
    consumed: z.boolean(),
    replay_detected: z.boolean(),
  })
  .strict();

const VerifyOtacPayloadSchema = z
  .object({
    user_id: z.string().trim().min(1).max(256),
    email: z.string().trim().email(),
    role: VerifyOtacRoleSchema,
    device_id: z.string().trim().min(1).max(256),
  })
  .strict();

const VerifyOtacRouteBodySchema = z
  .object({
    record: VerifyOtacRecordSchema,
    verification: VerifyOtacPayloadSchema,
  })
  .strict();

function buildVerificationResult(body: z.infer<typeof VerifyOtacRouteBodySchema>) {
  const mismatch_fields: string[] = [];

  if (body.record.user_id !== body.verification.user_id) {
    mismatch_fields.push('user_id');
  }

  if (body.record.email !== body.verification.email) {
    mismatch_fields.push('email');
  }

  if (body.record.role !== body.verification.role) {
    mismatch_fields.push('role');
  }

  if (body.record.device_id !== body.verification.device_id) {
    mismatch_fields.push('device_id');
  }

  const replay_detected = body.record.consumed || body.record.replay_detected;
  const verified = mismatch_fields.length === 0 && replay_detected === false;

  return {
    verified,
    mismatch_fields,
    replay_detected,
    record: {
      otac_id: body.record.otac_id,
      user_id: body.record.user_id,
      email: body.record.email,
      role: body.record.role,
      device_id: body.record.device_id,
      consumed: verified,
      replay_detected,
    },
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const body = VerifyOtacRouteBodySchema.parse(rawBody);
    const result = buildVerificationResult(body);

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: body.record.otac_id,
        traceId: body.record.otac_id,
        data: result,
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
