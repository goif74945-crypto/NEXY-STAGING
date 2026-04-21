import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  RunRecordSchema,
  RunRepositoryStateSchema,
  getRunById,
  insertRunRecord,
} from '../../../lib/repositories/run-repository';
import { buildSuccessEnvelope } from '../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../lib/http/route-error';

const RunsRouteBodySchema = z
  .object({
    state: RunRepositoryStateSchema,
    record: RunRecordSchema,
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

    const body = RunsRouteBodySchema.parse(rawBody);

    if (getRunById(body.state, body.record.run_id)) {
      throw createRouteError('conflict', `Run already exists: ${body.record.run_id}`);
    }

    const state = insertRunRecord(body.state, body.record);
    const run = getRunById(state, body.record.run_id);

    if (!run) {
      throw createRouteError('internal_error', `Inserted run not found: ${body.record.run_id}`);
    }

    return NextResponse.json(
      buildSuccessEnvelope({
        state,
        run,
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
