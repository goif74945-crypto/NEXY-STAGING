import { formatJobStatusLabel } from '../../lib/ui/format';

export type TaskQueueItem = {
  job_id: string;
  job_type: string;
  status: string;
  worker_id?: string;
};

export type TaskQueueViewerProps = {
  jobs: readonly TaskQueueItem[];
};

export default function TaskQueueViewer(props: TaskQueueViewerProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Task queue viewer"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">Task Queue</div>
      <div className="space-y-3">
        {props.jobs.map((job) => (
          <article key={job.job_id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold">{job.job_id}</div>
              <div className="rounded-full border border-slate-700 px-2 py-1 text-xs font-medium">
                {formatJobStatusLabel(job.status)}
              </div>
            </div>
            <div className="mt-2 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              <div>Type: {job.job_type}</div>
              <div>Worker: {job.worker_id ?? '—'}</div>
            </div>
          </article>
        ))}
      </div>
      {props.jobs.length === 0 ? <div className="text-sm text-slate-400">No jobs</div> : null}
    </section>
  );
}
