import { z } from 'zod';

import {
  listActiveSessions,
  type SessionRepositoryState,
} from './session-repository';
import {
  listIncidentRecordsByStatus,
  type IncidentState,
} from './incident-repository';
import {
  listRuns,
  type RunRecord,
  type RunRepositoryState,
} from './run-repository';
import { QueueStateSchema, type QueueState } from '../../packages/queue/jobs';
import { WorkerStateSchema, type WorkerState } from '../../packages/queue/workers';

export const DashboardSummarySchema = z
  .object({
    active_sessions: z.number().int().nonnegative(),
    open_incidents: z.number().int().nonnegative(),
    queued_jobs: z.number().int().nonnegative(),
    running_jobs: z.number().int().nonnegative(),
    total_runs: z.number().int().nonnegative(),
  })
  .strict();
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;

export const DashboardAgentStatusSchema = z
  .object({
    worker_id: z.string().trim().min(1).max(128),
    status: z.enum(['idle', 'busy', 'offline']),
    current_job_id: z.string().trim().min(1).max(128).optional(),
    last_heartbeat_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type DashboardAgentStatus = z.infer<typeof DashboardAgentStatusSchema>;

export const DashboardRecentRunItemSchema = z
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
export type DashboardRecentRunItem = z.infer<typeof DashboardRecentRunItemSchema>;

function countOpenIncidents(incidentState: IncidentState): number {
  const open = listIncidentRecordsByStatus(incidentState, 'open').length;
  const investigating = listIncidentRecordsByStatus(incidentState, 'investigating').length;
  const mitigated = listIncidentRecordsByStatus(incidentState, 'mitigated').length;

  return open + investigating + mitigated;
}

export function buildDashboardSummary(
  sessionStateInput: unknown,
  incidentStateInput: unknown,
  queueStateInput: unknown,
  runStateInput: unknown,
  currentEpochMsInput: unknown,
): DashboardSummary {
  const sessionState = sessionStateInput as SessionRepositoryState;
  const incidentState = incidentStateInput as IncidentState;
  const queueState = QueueStateSchema.parse(queueStateInput);
  const runState = runStateInput as RunRepositoryState;
  const current_epoch_ms = z.number().int().nonnegative().parse(currentEpochMsInput);

  const active_sessions = listActiveSessions(sessionState, current_epoch_ms).length;
  const open_incidents = countOpenIncidents(incidentState);
  const queued_jobs = queueState.jobs.filter((job) => job.status === 'queued').length;
  const running_jobs = queueState.jobs.filter((job) => job.status === 'running').length;
  const total_runs = listRuns(runState).length;

  return DashboardSummarySchema.parse({
    active_sessions,
    open_incidents,
    queued_jobs,
    running_jobs,
    total_runs,
  });
}

export function buildDashboardAgentStatuses(
  workerStateInput: unknown,
): DashboardAgentStatus[] {
  const workerState = WorkerStateSchema.parse(workerStateInput);

  return workerState.workers
    .map((worker) =>
      DashboardAgentStatusSchema.parse({
        worker_id: worker.worker_id,
        status: worker.status,
        ...(worker.current_job_id !== undefined
          ? { current_job_id: worker.current_job_id }
          : {}),
        last_heartbeat_epoch_ms: worker.last_heartbeat_epoch_ms,
      }),
    )
    .sort((left, right) => {
      if (left.worker_id < right.worker_id) {
        return -1;
      }

      if (left.worker_id > right.worker_id) {
        return 1;
      }

      return 0;
    });
}

export function buildDashboardRecentRuns(
  runStateInput: unknown,
  limitInput?: unknown,
): DashboardRecentRunItem[] {
  const runs = listRuns(runStateInput);
  const limit =
    limitInput === undefined ? runs.length : z.number().int().nonnegative().parse(limitInput);

  return runs.slice(0, limit).map((run) =>
    DashboardRecentRunItemSchema.parse({
      run_id: run.run_id,
      status: run.status,
      started_at_epoch_ms: run.started_at_epoch_ms,
      updated_at_epoch_ms: run.updated_at_epoch_ms,
    }),
  );
}