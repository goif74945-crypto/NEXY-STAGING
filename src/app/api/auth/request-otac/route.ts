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

const RequestOtacRoleSchema = z.enum(SESSION_ROLES);

const RequestOtacPayloadSchema = z
  .object({
    user_id: z.string().trim().min(1).max(256),
    email: z.string().trim().email(),
    role: RequestOtacRoleSchema,
    device_id: z.string().trim().min(1).max(256),
  })
  .strict();

type RequestOtacPayload = z.infer<typeof RequestOtacPayloadSchema>;

const RequestOtacRecordSchema = z
  .object({
    otac_id: z.string().trim().min(1).max(256),
    user_id: z.string().trim().min(1).max(256),
    email: z.string().trim().email(),
    role: RequestOtacRoleSchema,
    device_id: z.string().trim().min(1).max(256),
    consumed: z.literal(false),
    replay_detected: z.literal(false),
  })
  .strict();

function reduceSeed(seed: string): string {
  let hash = 2166136261;

  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  return `otac_${hash.toString(16).padStart(8, '0')}`;
}

function buildRequestOtacRecord(payload: RequestOtacPayload) {
  const otac_id = reduceSeed(
    `${payload.user_id}|${payload.email}|${payload.role}|${payload.device_id}`,
  );

  return RequestOtacRecordSchema.parse({
    otac_id,
    user_id: payload.user_id,
    email: payload.email,
    role: payload.role,
    device_id: payload.device_id,
    consumed: false,
    replay_detected: false,
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw createRouteError('bad_request', 'Invalid JSON body.');
    }

    const payload = RequestOtacPayloadSchema.parse(rawBody);
    const record = buildRequestOtacRecord(payload);

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: record.otac_id,
        traceId: record.otac_id,
        data: {
          record,
          public_view: {
            otac_id: record.otac_id,
            role: record.role,
            device_id: record.device_id,
          },
        },
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
