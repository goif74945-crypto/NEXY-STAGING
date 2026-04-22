import { z } from 'zod';

export const FrontPulseInputSchema = z
  .object({
    active_sessions: z.number().int().nonnegative(),
    open_incidents: z.number().int().nonnegative(),
    queued_jobs: z.number().int().nonnegative(),
    running_jobs: z.number().int().nonnegative(),
    total_runs: z.number().int().nonnegative(),
  })
  .strict();
export type FrontPulseInput = z.infer<typeof FrontPulseInputSchema>;

const FrontPulseStatusSchema = z.enum(['calm', 'busy', 'warning', 'critical']);
export type FrontPulseStatus = z.infer<typeof FrontPulseStatusSchema>;

const FrontPulseCountsSchema = z
  .object({
    active_sessions: z.number().int().nonnegative(),
    open_incidents: z.number().int().nonnegative(),
    queued_jobs: z.number().int().nonnegative(),
    running_jobs: z.number().int().nonnegative(),
    total_runs: z.number().int().nonnegative(),
  })
  .strict();
export type FrontPulseCounts = z.infer<typeof FrontPulseCountsSchema>;

export const FrontPulseViewSchema = z
  .object({
    status: FrontPulseStatusSchema,
    headline: z.string().trim().min(1).max(512),
    counts: FrontPulseCountsSchema,
  })
  .strict();
export type FrontPulseView = z.infer<typeof FrontPulseViewSchema>;

function inferStatus(input: FrontPulseInput): FrontPulseStatus {
  if (input.open_incidents >= 3 || (input.open_incidents > 0 && input.running_jobs > 0)) {
    return 'critical';
  }

  if (input.open_incidents > 0 || input.queued_jobs >= 20) {
    return 'warning';
  }

  if (
    input.running_jobs > 0 ||
    input.queued_jobs > 0 ||
    input.total_runs > 0 ||
    input.active_sessions > 0
  ) {
    return 'busy';
  }

  return 'calm';
}

function buildHeadline(input: FrontPulseInput, status: FrontPulseStatus): string {
  switch (status) {
    case 'critical':
      return `Critical load: ${input.open_incidents} incidents and ${input.running_jobs} running jobs`;
    case 'warning':
      return `Warning state: ${input.open_incidents} incidents and ${input.queued_jobs} queued jobs`;
    case 'busy':
      return `System active: ${input.active_sessions} sessions and ${input.total_runs} runs tracked`;
    case 'calm':
      return 'System calm: no incidents and no active workload';
  }
}

export function buildFrontPulseView(input: unknown): FrontPulseView {
  const parsed = FrontPulseInputSchema.parse(input);
  const status = inferStatus(parsed);

  return FrontPulseViewSchema.parse({
    status,
    headline: buildHeadline(parsed, status),
    counts: parsed,
  });
}
