import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';
import { OutputClassSchema } from '@/lib/types/output-class';

const GET_REQUEST_ID = 'runs_get';
const POST_REQUEST_ID = 'runs_post';

const RunSchema = z
  .object({
    run_id: z.string().trim().min(1).max(256),
    directive_id: z.string().trim().min(1).max(256),
    status: z.string().trim().min(1).max(128),
    started_at_epoch_ms: z.number().int().nonnegative(),
    updated_at_epoch_ms: z.number().int().nonnegative(),
    output_class: OutputClassSchema,
    freeze_reason: z.string().trim().max(4096),
  })
  .strict();

const CreateRunBodySchema = RunSchema;

const RUNS = [
  RunSchema.parse({
    run_id: 'run_001',
    directive_id: 'directive_001',
    status: 'stable',
    started_at_epoch_ms: 1_700_000_000_000,
    updated_at_epoch_ms: 1_700_000_010_000,
    output_class: 'FINAL',
    freeze_reason: '',
  }),
];

export function GET(): NextResponse {
  try {
    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: GET_REQUEST_ID,
        data: {
          runs: RUNS,
        },
      }),
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError, GET_REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const run = RunSchema.parse(CreateRunBodySchema.parse(await request.json()));

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: POST_REQUEST_ID,
        data: {
          run,
        },
      }),
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError, POST_REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}
