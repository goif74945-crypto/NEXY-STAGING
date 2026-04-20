import { z } from 'zod';

const QueuePrimitiveValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

export const QueueJobIdSchema = z.string().trim().min(1).max(128);
export type QueueJobId = z.infer<typeof QueueJobIdSchema>;

export const QueueJobTypeSchema = z.string().trim().min(1).max(128);
export type QueueJobType = z.infer<typeof QueueJobTypeSchema>;

export const QueueJobStatusSchema = z.enum(['queued', 'running', 'completed', 'failed']);
export type QueueJobStatus = z.infer<typeof QueueJobStatusSchema>;

export const QueueJobPayloadSchema = z.record(QueuePrimitiveValueSchema);
export type QueueJobPayload = z.infer<typeof QueueJobPayloadSchema>;

export const QueueJobRecordSchema = z
  .object({
    job_id: QueueJobIdSchema,
    job_type: QueueJobTypeSchema,
    entity_id: z.string().trim().min(1).max(256),
    status: QueueJobStatusSchema,
    payload: QueueJobPayloadSchema,
    created_at_epoch_ms: z.number().int().nonnegative(),
    updated_at_epoch_ms: z.number().int().nonnegative(),
    available_at_epoch_ms: z.number().int().nonnegative(),
    started_at_epoch_ms: z.number().int().nonnegative().optional(),
    completed_at_epoch_ms: z.number().int().nonnegative().optional(),
    failed_at_epoch_ms: z.number().int().nonnegative().optional(),
    failure_reason: z.string().trim().min(1).max(1024).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.updated_at_epoch_ms < value.created_at_epoch_ms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'updated_at_epoch_ms must be greater than or equal to created_at_epoch_ms.',
      });
    }

    if (value.available_at_epoch_ms < value.created_at_epoch_ms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'available_at_epoch_ms must be greater than or equal to created_at_epoch_ms.',
      });
    }

    if (value.status === 'running' && value.started_at_epoch_ms === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Running jobs must include started_at_epoch_ms.',
      });
    }

    if (value.status !== 'running' && value.started_at_epoch_ms !== undefined && value.status === 'queued') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Queued jobs cannot include started_at_epoch_ms.',
      });
    }

    if (value.status === 'completed' && value.completed_at_epoch_ms === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Completed jobs must include completed_at_epoch_ms.',
      });
    }

    if (value.status !== 'completed' && value.completed_at_epoch_ms !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only completed jobs may include completed_at_epoch_ms.',
      });
    }

    if (value.status === 'failed' && value.failed_at_epoch_ms === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Failed jobs must include failed_at_epoch_ms.',
      });
    }

    if (value.status !== 'failed' && value.failed_at_epoch_ms !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only failed jobs may include failed_at_epoch_ms.',
      });
    }

    if (value.status === 'failed' && value.failure_reason === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Failed jobs must include failure_reason.',
      });
    }

    if (value.status !== 'failed' && value.failure_reason !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only failed jobs may include failure_reason.',
      });
    }
  });
export type QueueJobRecord = z.infer<typeof QueueJobRecordSchema>;

export const QueueStateSchema = z
  .object({
    jobs: z.array(QueueJobRecordSchema),
  })
  .strict();
export type QueueState = z.infer<typeof QueueStateSchema>;

export const CreateQueueJobRecordInputSchema = z
  .object({
    job_id: QueueJobIdSchema,
    job_type: QueueJobTypeSchema,
    entity_id: z.string().trim().min(1).max(256),
    payload: QueueJobPayloadSchema,
    created_at_epoch_ms: z.number().int().nonnegative(),
    available_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type CreateQueueJobRecordInput = z.infer<typeof CreateQueueJobRecordInputSchema>;

export const QueueJobRunningInputSchema = z
  .object({
    job_id: QueueJobIdSchema,
    started_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type QueueJobRunningInput = z.infer<typeof QueueJobRunningInputSchema>;

export const QueueJobCompletedInputSchema = z
  .object({
    job_id: QueueJobIdSchema,
    completed_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type QueueJobCompletedInput = z.infer<typeof QueueJobCompletedInputSchema>;

export const QueueJobFailedInputSchema = z
  .object({
    job_id: QueueJobIdSchema,
    failed_at_epoch_ms: z.number().int().nonnegative(),
    failure_reason: z.string().trim().min(1).max(1024),
  })
  .strict();
export type QueueJobFailedInput = z.infer<typeof QueueJobFailedInputSchema>;

function compareJobs(left: QueueJobRecord, right: QueueJobRecord): -1 | 0 | 1 {
  if (left.available_at_epoch_ms < right.available_at_epoch_ms) {
    return -1;
  }

  if (left.available_at_epoch_ms > right.available_at_epoch_ms) {
    return 1;
  }

  if (left.created_at_epoch_ms < right.created_at_epoch_ms) {
    return -1;
  }

  if (left.created_at_epoch_ms > right.created_at_epoch_ms) {
    return 1;
  }

  if (left.job_id < right.job_id) {
    return -1;
  }

  if (left.job_id > right.job_id) {
    return 1;
  }

  return 0;
}

function sortJobs(jobs: readonly QueueJobRecord[]): QueueJobRecord[] {
  return [...jobs].sort((left, right) => compareJobs(left, right));
}

function ensureNoDuplicateJobIds(jobs: readonly QueueJobRecord[]): void {
  const seen = new Set<string>();

  for (const job of jobs) {
    if (seen.has(job.job_id)) {
      throw new Error(`Duplicate job id: ${job.job_id}`);
    }

    seen.add(job.job_id);
  }
}

function parseStateInternal(input: unknown): QueueState {
  const state = QueueStateSchema.parse(input);
  ensureNoDuplicateJobIds(state.jobs);

  return QueueStateSchema.parse({
    jobs: sortJobs(state.jobs),
  });
}

function replaceJob(state: QueueState, nextJob: QueueJobRecord): QueueState {
  return QueueStateSchema.parse({
    jobs: sortJobs(
      state.jobs.map((job) => (job.job_id === nextJob.job_id ? nextJob : job)),
    ),
  });
}

export function createEmptyQueueState(): QueueState {
  return QueueStateSchema.parse({
    jobs: [],
  });
}

export function createQueueJobRecord(input: unknown): QueueJobRecord {
  const parsed = CreateQueueJobRecordInputSchema.parse(input);

  return QueueJobRecordSchema.parse({
    job_id: parsed.job_id,
    job_type: parsed.job_type,
    entity_id: parsed.entity_id,
    status: 'queued',
    payload: parsed.payload,
    created_at_epoch_ms: parsed.created_at_epoch_ms,
    updated_at_epoch_ms: parsed.created_at_epoch_ms,
    available_at_epoch_ms: parsed.available_at_epoch_ms,
  });
}

export function enqueueJob(stateInput: unknown, recordInput: unknown): QueueState {
  const state = parseStateInternal(stateInput);
  const record = QueueJobRecordSchema.parse(recordInput);

  if (record.status !== 'queued') {
    throw new Error('enqueueJob requires a job record with status "queued".');
  }

  if (state.jobs.some((job) => job.job_id === record.job_id)) {
    throw new Error(`Duplicate job id: ${record.job_id}`);
  }

  return QueueStateSchema.parse({
    jobs: sortJobs([...state.jobs, record]),
  });
}

export function markJobRunning(stateInput: unknown, input: unknown): QueueState {
  const state = parseStateInternal(stateInput);
  const update = QueueJobRunningInputSchema.parse(input);

  const job = state.jobs.find((existingJob) => existingJob.job_id === update.job_id);

  if (!job) {
    throw new Error(`Job not found: ${update.job_id}`);
  }

  if (job.status !== 'queued') {
    throw new Error(`Job ${update.job_id} cannot transition from ${job.status} to running.`);
  }

  if (update.started_at_epoch_ms < job.available_at_epoch_ms) {
    throw new Error('started_at_epoch_ms must be greater than or equal to available_at_epoch_ms.');
  }

  const nextJob = QueueJobRecordSchema.parse({
    ...job,
    status: 'running',
    updated_at_epoch_ms: update.started_at_epoch_ms,
    started_at_epoch_ms: update.started_at_epoch_ms,
  });

  return replaceJob(state, nextJob);
}

export function markJobCompleted(stateInput: unknown, input: unknown): QueueState {
  const state = parseStateInternal(stateInput);
  const update = QueueJobCompletedInputSchema.parse(input);

  const job = state.jobs.find((existingJob) => existingJob.job_id === update.job_id);

  if (!job) {
    throw new Error(`Job not found: ${update.job_id}`);
  }

  if (job.status !== 'running') {
    throw new Error(`Job ${update.job_id} cannot transition from ${job.status} to completed.`);
  }

  if (job.started_at_epoch_ms === undefined || update.completed_at_epoch_ms < job.started_at_epoch_ms) {
    throw new Error('completed_at_epoch_ms must be greater than or equal to started_at_epoch_ms.');
  }

  const nextJob = QueueJobRecordSchema.parse({
    ...job,
    status: 'completed',
    updated_at_epoch_ms: update.completed_at_epoch_ms,
    completed_at_epoch_ms: update.completed_at_epoch_ms,
  });

  return replaceJob(state, nextJob);
}

export function markJobFailed(stateInput: unknown, input: unknown): QueueState {
  const state = parseStateInternal(stateInput);
  const update = QueueJobFailedInputSchema.parse(input);

  const job = state.jobs.find((existingJob) => existingJob.job_id === update.job_id);

  if (!job) {
    throw new Error(`Job not found: ${update.job_id}`);
  }

  if (job.status !== 'queued' && job.status !== 'running') {
    throw new Error(`Job ${update.job_id} cannot transition from ${job.status} to failed.`);
  }

  if (job.status === 'running' && job.started_at_epoch_ms !== undefined && update.failed_at_epoch_ms < job.started_at_epoch_ms) {
    throw new Error('failed_at_epoch_ms must be greater than or equal to started_at_epoch_ms.');
  }

  if (job.status === 'queued' && update.failed_at_epoch_ms < job.available_at_epoch_ms) {
    throw new Error('failed_at_epoch_ms must be greater than or equal to available_at_epoch_ms.');
  }

  const nextJob = QueueJobRecordSchema.parse({
    ...job,
    status: 'failed',
    updated_at_epoch_ms: update.failed_at_epoch_ms,
    failed_at_epoch_ms: update.failed_at_epoch_ms,
    failure_reason: update.failure_reason,
    ...(job.status === 'queued' ? { started_at_epoch_ms: undefined } : {}),
  });

  return replaceJob(state, nextJob);
}

export function getQueuedJobs(stateInput: unknown): QueueJobRecord[] {
  const state = parseStateInternal(stateInput);

  return sortJobs(
    state.jobs.filter((job) => job.status === 'queued'),
  );
}

export function getJobsByType(stateInput: unknown, jobTypeInput: unknown): QueueJobRecord[] {
  const state = parseStateInternal(stateInput);
  const jobType = QueueJobTypeSchema.parse(jobTypeInput);

  return sortJobs(
    state.jobs.filter((job) => job.job_type === jobType),
  );
}

export function parseQueueJobId(input: unknown): QueueJobId {
  return QueueJobIdSchema.parse(input);
}

export function validateQueueJobId(input: unknown): boolean {
  return QueueJobIdSchema.safeParse(input).success;
}

export function parseQueueJobType(input: unknown): QueueJobType {
  return QueueJobTypeSchema.parse(input);
}

export function validateQueueJobType(input: unknown): boolean {
  return QueueJobTypeSchema.safeParse(input).success;
}

export function parseQueueJobStatus(input: unknown): QueueJobStatus {
  return QueueJobStatusSchema.parse(input);
}

export function validateQueueJobStatus(input: unknown): boolean {
  return QueueJobStatusSchema.safeParse(input).success;
}

export function parseQueueJobRecord(input: unknown): QueueJobRecord {
  return QueueJobRecordSchema.parse(input);
}

export function validateQueueJobRecord(input: unknown): boolean {
  return QueueJobRecordSchema.safeParse(input).success;
}

export function parseQueueState(input: unknown): QueueState {
  return parseStateInternal(input);
}

export function validateQueueState(input: unknown): boolean {
  const schemaResult = QueueStateSchema.safeParse(input);

  if (!schemaResult.success) {
    return false;
  }

  try {
    ensureNoDuplicateJobIds(schemaResult.data.jobs);
    return true;
  } catch {
    return false;
  }
}