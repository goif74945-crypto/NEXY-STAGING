import { z } from 'zod';

import {
  EventLogStateSchema,
  type EventLogState,
} from '../../packages/obs/event-log';
import {
  IncidentStateSchema,
  type IncidentState,
} from '../../packages/obs/incidents';
import { QueueStateSchema, type QueueState } from '../../packages/queue/jobs';
import { WorkerStateSchema, getActiveWorkers, type WorkerState } from '../../packages/queue/workers';
import { listRuns, type RunRepositoryState } from './run-repository';

export const TelemetrySystemSnapshotSchema = z
  .object({
    generated_at_epoch_ms: z.number().int().nonnegative(),
    open_incidents: z.number().int().nonnegative(),
    error_events: z.number().int().nonnegative(),
    warn_events: z.number().int().nonnegative(),
    active_workers: z.number().int().nonnegative(),
    queued_jobs: z.number().int().nonnegative(),
    running_jobs: z.number().int().nonnegative(),
  })
  .strict();
export type TelemetrySystemSnapshot = z.infer<typeof TelemetrySystemSnapshotSchema>;

export const TelemetryRunPointSchema = z
  .object({
    run_id: z.string().trim().min(1).max(128),
    status: z.enum([
      'queued',
      'running',
      'verifying',
      'consensus',
      'stable',
      'freeze',
      'failed',
    ]),
    started_at_epoch_ms: z.number().int().nonnegative(),
    updated_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type TelemetryRunPoint = z.infer<typeof TelemetryRunPointSchema>;

function countOpenIncidents(state: IncidentState): number {
  return state.records.filter(
    (record) =>
      record.status === 'open' ||
      record.status === 'investigating' ||
      record.status === 'mitigated',
  ).length;
}

export function buildTelemetrySystemSnapshot(
  eventStateInput: unknown,
  incidentStateInput: unknown,
  queueStateInput: unknown,
  workerStateInput: unknown,
  generatedAtEpochMsInput: unknown,
): TelemetrySystemSnapshot {
  const eventState = EventLogStateSchema.parse(eventStateInput);
  const incidentState = IncidentStateSchema.parse(incidentStateInput);
  const queueState = QueueStateSchema.parse(queueStateInput);
  const workerState = WorkerStateSchema.parse(workerStateInput);
  const generated_at_epoch_ms = z.number().int().nonnegative().parse(generatedAtEpochMsInput);

  const error_events = eventState.records.filter((record) => record.level === 'error').length;
  const warn_events = eventState.records.filter((record) => record.level === 'warn').length;
  const active_workers = getActiveWorkers(workerState).length;
  const queued_jobs = queueState.jobs.filter((job) => job.status === 'queued').length;
  const running_jobs = queueState.jobs.filter((job) => job.status === 'running').length;

  return TelemetrySystemSnapshotSchema.parse({
    generated_at_epoch_ms,
    open_incidents: countOpenIncidents(incidentState),
    error_events,
    warn_events,
    active_workers,
    queued_jobs,
    running_jobs,
  });
}

export function buildTelemetryRunPoints(
  runStateInput: unknown,
  limitInput?: unknown,
): TelemetryRunPoint[] {
  const runs = listRuns(runStateInput);
  const limit =
    limitInput === undefined ? runs.length : z.number().int().nonnegative().parse(limitInput);

  return runs.slice(0, limit).map((run) =>
    TelemetryRunPointSchema.parse({
      run_id: run.run_id,
      status: run.status,
      started_at_epoch_ms: run.started_at_epoch_ms,
      updated_at_epoch_ms: run.updated_at_epoch_ms,
    }),
  );
}