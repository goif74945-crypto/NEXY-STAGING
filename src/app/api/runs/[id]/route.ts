import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';
import { OutputClassSchema } from '@/lib/types/output-class';

const REQUEST_ID = 'runs_id_get';

const ParamsSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
  })
  .strict();

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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = ParamsSchema.parse(await context.params);
    const run = RUNS.find((item) => item.run_id === params.id) ?? null;

    if (run === null) {
      throw createRouteError('not_found', 'Run was not found.', {
        run_id: params.id,
      });
    }

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
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

    return NextResponse.json(toRouteErrorEnvelope(routeError, REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}
