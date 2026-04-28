import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'runs_id_history_get';

const ParamsSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
  })
  .strict();

const HistoryRecordSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
    run_id: z.string().trim().min(1).max(256),
    label: z.string().trim().min(1).max(256),
    timestamp_epoch_ms: z.number().int().nonnegative(),
    description: z.string().trim().min(1).max(4096),
  })
  .strict();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = ParamsSchema.parse(await context.params);
    const history = [
      HistoryRecordSchema.parse({
        id: `${params.id}:created`,
        run_id: params.id,
        label: 'created',
        timestamp_epoch_ms: 1_700_000_000_000,
        description: 'Run was created deterministically.',
      }),
      HistoryRecordSchema.parse({
        id: `${params.id}:verified`,
        run_id: params.id,
        label: 'verified',
        timestamp_epoch_ms: 1_700_000_010_000,
        description: 'Run verification completed.',
      }),
    ];

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: {
          history,
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
