import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildSuccessEnvelope } from '../../../../lib/http/envelope';
import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '../../../../lib/http/route-error';
import { QueueStateSchema } from '../../../../packages/queue/jobs';
import { WorkerStateSchema, getActiveWorkers } from '../../../../packages/queue/workers';

const QueueStatusRouteBodySchema = z
  .object({
    queue_state: QueueStateSchema,
    worker_state: WorkerStateSchema,
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

    const body = QueueStatusRouteBodySchema.parse(rawBody);

    const queued_jobs = body.queue_state.jobs.filter((job) => job.status === 'queued').length;
    const running_jobs = body.queue_state.jobs.filter((job) => job.status === 'running').length;
    const failed_jobs = body.queue_state.jobs.filter((job) => job.status === 'failed').length;
    const completed_jobs = body.queue_state.jobs.filter((job) => job.status === 'completed').length;

    const active_workers = getActiveWorkers(body.worker_state).length;
    const idle_workers = body.worker_state.workers.filter((worker) => worker.status === 'idle').length;
    const busy_workers = body.worker_state.workers.filter((worker) => worker.status === 'busy').length;
    const offline_workers = body.worker_state.workers.filter((worker) => worker.status === 'offline').length;

    return NextResponse.json(
      buildSuccessEnvelope({
        queued_jobs,
        running_jobs,
        failed_jobs,
        completed_jobs,
        active_workers,
        idle_workers,
        busy_workers,
        offline_workers,
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