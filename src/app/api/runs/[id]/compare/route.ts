import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'runs_id_compare_get';

const ParamsSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
  })
  .strict();

const CompareResultSchema = z
  .object({
    left_run_id: z.string().trim().min(1).max(256),
    right_run_id: z.string().trim().min(1).max(256),
    same_status: z.boolean(),
    same_output_class: z.boolean(),
  })
  .strict();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = ParamsSchema.parse(await context.params);
    const result = CompareResultSchema.parse({
      left_run_id: params.id,
      right_run_id: 'run_001',
      same_status: params.id === 'run_001',
      same_output_class: params.id === 'run_001',
    });

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          compare: result,
        },
      }),
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError, REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}
