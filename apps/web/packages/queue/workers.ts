import { z } from 'zod';

import {
  QueueJobIdSchema,
  QueueJobRecordSchema,
  QueueStateSchema,
  getQueuedJobs,
  markJobRunning,
  type QueueJobRecord,
  type QueueState,
} from './jobs';

export const WorkerIdSchema = z.string().trim().min(1).max(128);
export type WorkerId = z.infer<typeof WorkerIdSchema>;

export const WorkerStatusSchema = z.enum(['idle', 'busy', 'offline']);
export type WorkerStatus = z.infer<typeof WorkerStatusSchema>;

export const WorkerRecordSchema = z
  .object({
    worker_id: WorkerIdSchema,
    status: WorkerStatusSchema,
    registered_at_epoch_ms: z.number().int().nonnegative(),
    last_heartbeat_epoch_ms: z.number().int().nonnegative(),
    current_job_id: QueueJobIdSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.last_heartbeat_epoch_ms < value.registered_at_epoch_ms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'last_heartbeat_epoch_ms must be greater than or equal to registered_at_epoch_ms.',
      });
    }

    if (value.status === 'busy' && value.current_job_id === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Busy workers must include current_job_id.',
      });
    }

    if (value.status !== 'busy' && value.current_job_id !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only busy workers may include current_job_id.',
      });
    }
  });
export type WorkerRecord = z.infer<typeof WorkerRecordSchema>;

export const WorkerStateSchema = z
  .object({
    workers: z.array(WorkerRecordSchema),
  })
  .strict();
export type WorkerState = z.infer<typeof WorkerStateSchema>;

export const WorkerClaimResultSchema = z
  .object({
    claimed: z.boolean(),
    reason: z.enum(['claimed', 'worker_not_found', 'worker_not_idle', 'no_queued_jobs']),
    worker_state: WorkerStateSchema,
    queue_state: QueueStateSchema,
    claimed_job: QueueJobRecordSchema.optional(),
  })
  .strict();
export type WorkerClaimResult = z.infer<typeof WorkerClaimResultSchema>;

export const RegisterWorkerInputSchema = z
  .object({
    worker_id: WorkerIdSchema,
    registered_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type RegisterWorkerInput = z.infer<typeof RegisterWorkerInputSchema>;

export const ClaimNextQueuedJobInputSchema = z
  .object({
    worker_id: WorkerIdSchema,
    claimed_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type ClaimNextQueuedJobInput = z.infer<typeof ClaimNextQueuedJobInputSchema>;

export const ReleaseWorkerClaimInputSchema = z
  .object({
    worker_id: WorkerIdSchema,
    released_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type ReleaseWorkerClaimInput = z.infer<typeof ReleaseWorkerClaimInputSchema>;

export const WorkerHeartbeatInputSchema = z
  .object({
    worker_id: WorkerIdSchema,
    heartbeat_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type WorkerHeartbeatInput = z.infer<typeof WorkerHeartbeatInputSchema>;

export const WorkerOfflineInputSchema = z
  .object({
    worker_id: WorkerIdSchema,
    offline_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type WorkerOfflineInput = z.infer<typeof WorkerOfflineInputSchema>;

function compareWorkers(left: WorkerRecord, right: WorkerRecord): -1 | 0 | 1 {
  if (left.worker_id < right.worker_id) {
    return -1;
  }

  if (left.worker_id > right.worker_id) {
    return 1;
  }

  return 0;
}

function sortWorkers(workers: readonly WorkerRecord[]): WorkerRecord[] {
  return [...workers].sort((left, right) => compareWorkers(left, right));
}

function ensureNoDuplicateWorkerIds(workers: readonly WorkerRecord[]): void {
  const seen = new Set<string>();

  for (const worker of workers) {
    if (seen.has(worker.worker_id)) {
      throw new Error(`Duplicate worker id: ${worker.worker_id}`);
    }

    seen.add(worker.worker_id);
  }
}

function parseWorkerStateInternal(input: unknown): WorkerState {
  const state = WorkerStateSchema.parse(input);
  ensureNoDuplicateWorkerIds(state.workers);

  return WorkerStateSchema.parse({
    workers: sortWorkers(state.workers),
  });
}

function replaceWorker(state: WorkerState, nextWorker: WorkerRecord): WorkerState {
  return WorkerStateSchema.parse({
    workers: sortWorkers(
      state.workers.map((worker) =>
        worker.worker_id === nextWorker.worker_id ? nextWorker : worker,
      ),
    ),
  });
}

function findClaimedJob(queueState: QueueState, jobId: string): QueueJobRecord {
  const claimedJob = queueState.jobs.find((job) => job.job_id === jobId);

  if (!claimedJob) {
    throw new Error(`Claimed job not found after transition: ${jobId}`);
  }

  return QueueJobRecordSchema.parse(claimedJob);
}

export function createEmptyWorkerState(): WorkerState {
  return WorkerStateSchema.parse({
    workers: [],
  });
}

export function registerWorker(stateInput: unknown, input: unknown): WorkerState {
  const state = parseWorkerStateInternal(stateInput);
  const registration = RegisterWorkerInputSchema.parse(input);

  if (state.workers.some((worker) => worker.worker_id === registration.worker_id)) {
    throw new Error(`Duplicate worker id: ${registration.worker_id}`);
  }

  const nextWorker = WorkerRecordSchema.parse({
    worker_id: registration.worker_id,
    status: 'idle',
    registered_at_epoch_ms: registration.registered_at_epoch_ms,
    last_heartbeat_epoch_ms: registration.registered_at_epoch_ms,
  });

  return WorkerStateSchema.parse({
    workers: sortWorkers([...state.workers, nextWorker]),
  });
}

export function claimNextQueuedJob(
  workerStateInput: unknown,
  queueStateInput: unknown,
  input: unknown,
): WorkerClaimResult {
  const workerState = parseWorkerStateInternal(workerStateInput);
  const queueState = QueueStateSchema.parse(queueStateInput);
  const claim = ClaimNextQueuedJobInputSchema.parse(input);

  const worker = workerState.workers.find(
    (existingWorker) => existingWorker.worker_id === claim.worker_id,
  );

  if (!worker) {
    return WorkerClaimResultSchema.parse({
      claimed: false,
      reason: 'worker_not_found',
      worker_state: workerState,
      queue_state: queueState,
    });
  }

  if (worker.status !== 'idle') {
    return WorkerClaimResultSchema.parse({
      claimed: false,
      reason: 'worker_not_idle',
      worker_state: workerState,
      queue_state: queueState,
    });
  }

  const queuedJobs = getQueuedJobs(queueState);

  if (queuedJobs.length === 0) {
    return WorkerClaimResultSchema.parse({
      claimed: false,
      reason: 'no_queued_jobs',
      worker_state: workerState,
      queue_state: queueState,
    });
  }

  const claimedJob = queuedJobs[0];
  const nextQueueState = markJobRunning(queueState, {
    job_id: claimedJob.job_id,
    started_at_epoch_ms: claim.claimed_at_epoch_ms,
  });

  const nextWorker = WorkerRecordSchema.parse({
    worker_id: worker.worker_id,
    status: 'busy',
    registered_at_epoch_ms: worker.registered_at_epoch_ms,
    last_heartbeat_epoch_ms: claim.claimed_at_epoch_ms,
    current_job_id: claimedJob.job_id,
  });

  const nextWorkerState = replaceWorker(workerState, nextWorker);

  return WorkerClaimResultSchema.parse({
    claimed: true,
    reason: 'claimed',
    worker_state: nextWorkerState,
    queue_state: nextQueueState,
    claimed_job: findClaimedJob(nextQueueState, claimedJob.job_id),
  });
}

export function releaseWorkerClaim(stateInput: unknown, input: unknown): WorkerState {
  const state = parseWorkerStateInternal(stateInput);
  const release = ReleaseWorkerClaimInputSchema.parse(input);

  const worker = state.workers.find(
    (existingWorker) => existingWorker.worker_id === release.worker_id,
  );

  if (!worker) {
    throw new Error(`Worker not found: ${release.worker_id}`);
  }

  if (release.released_at_epoch_ms < worker.last_heartbeat_epoch_ms) {
    throw new Error(
      'released_at_epoch_ms must be greater than or equal to last_heartbeat_epoch_ms.',
    );
  }

  const nextWorker = WorkerRecordSchema.parse({
    worker_id: worker.worker_id,
    status: 'idle',
    registered_at_epoch_ms: worker.registered_at_epoch_ms,
    last_heartbeat_epoch_ms: release.released_at_epoch_ms,
  });

  return replaceWorker(state, nextWorker);
}

export function heartbeatWorker(stateInput: unknown, input: unknown): WorkerState {
  const state = parseWorkerStateInternal(stateInput);
  const heartbeat = WorkerHeartbeatInputSchema.parse(input);

  const worker = state.workers.find(
    (existingWorker) => existingWorker.worker_id === heartbeat.worker_id,
  );

  if (!worker) {
    throw new Error(`Worker not found: ${heartbeat.worker_id}`);
  }

  if (heartbeat.heartbeat_at_epoch_ms < worker.last_heartbeat_epoch_ms) {
    throw new Error(
      'heartbeat_at_epoch_ms must be greater than or equal to last_heartbeat_epoch_ms.',
    );
  }

  const nextWorker =
    worker.status === 'busy'
      ? WorkerRecordSchema.parse({
          worker_id: worker.worker_id,
          status: 'busy',
          registered_at_epoch_ms: worker.registered_at_epoch_ms,
          last_heartbeat_epoch_ms: heartbeat.heartbeat_at_epoch_ms,
          current_job_id: worker.current_job_id,
        })
      : WorkerRecordSchema.parse({
          worker_id: worker.worker_id,
          status: worker.status,
          registered_at_epoch_ms: worker.registered_at_epoch_ms,
          last_heartbeat_epoch_ms: heartbeat.heartbeat_at_epoch_ms,
        });

  return replaceWorker(state, nextWorker);
}

export function markWorkerOffline(stateInput: unknown, input: unknown): WorkerState {
  const state = parseWorkerStateInternal(stateInput);
  const offline = WorkerOfflineInputSchema.parse(input);

  const worker = state.workers.find(
    (existingWorker) => existingWorker.worker_id === offline.worker_id,
  );

  if (!worker) {
    throw new Error(`Worker not found: ${offline.worker_id}`);
  }

  if (offline.offline_at_epoch_ms < worker.last_heartbeat_epoch_ms) {
    throw new Error(
      'offline_at_epoch_ms must be greater than or equal to last_heartbeat_epoch_ms.',
    );
  }

  const nextWorker = WorkerRecordSchema.parse({
    worker_id: worker.worker_id,
    status: 'offline',
    registered_at_epoch_ms: worker.registered_at_epoch_ms,
    last_heartbeat_epoch_ms: offline.offline_at_epoch_ms,
  });

  return replaceWorker(state, nextWorker);
}

export function getWorkerById(
  stateInput: unknown,
  workerIdInput: unknown,
): WorkerRecord | null {
  const state = parseWorkerStateInternal(stateInput);
  const workerId = WorkerIdSchema.parse(workerIdInput);

  return state.workers.find((worker) => worker.worker_id === workerId) ?? null;
}

export function getActiveWorkers(stateInput: unknown): WorkerRecord[] {
  const state = parseWorkerStateInternal(stateInput);

  return sortWorkers(
    state.workers.filter((worker) => worker.status === 'idle' || worker.status === 'busy'),
  );
}

export function parseWorkerId(input: unknown): WorkerId {
  return WorkerIdSchema.parse(input);
}

export function validateWorkerId(input: unknown): boolean {
  return WorkerIdSchema.safeParse(input).success;
}

export function parseWorkerStatus(input: unknown): WorkerStatus {
  return WorkerStatusSchema.parse(input);
}

export function validateWorkerStatus(input: unknown): boolean {
  return WorkerStatusSchema.safeParse(input).success;
}

export function parseWorkerRecord(input: unknown): WorkerRecord {
  return WorkerRecordSchema.parse(input);
}

export function validateWorkerRecord(input: unknown): boolean {
  return WorkerRecordSchema.safeParse(input).success;
}

export function parseWorkerState(input: unknown): WorkerState {
  return parseWorkerStateInternal(input);
}

export function validateWorkerState(input: unknown): boolean {
  const schemaResult = WorkerStateSchema.safeParse(input);

  if (!schemaResult.success) {
    return false;
  }

  try {
    ensureNoDuplicateWorkerIds(schemaResult.data.workers);
    return true;
  } catch {
    return false;
  }
}

export function parseWorkerClaimResult(input: unknown): WorkerClaimResult {
  return WorkerClaimResultSchema.parse(input);
}

export function validateWorkerClaimResult(input: unknown): boolean {
  return WorkerClaimResultSchema.safeParse(input).success;
}