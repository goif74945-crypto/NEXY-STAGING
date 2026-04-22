import { formatEpochMs, formatRunStatusLabel } from '../../lib/ui/format';

export type RunSummaryItem = {
  run_id: string;
  status: string;
  started_at_epoch_ms: number;
  updated_at_epoch_ms: number;
  output_class?: string;
  freeze_reason?: string;
};

export type RunSummaryPanelProps = {
  runs: readonly RunSummaryItem[];
  locale?: string;
};

export default function RunSummaryPanel(props: RunSummaryPanelProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Run summary panel"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">Run Summary</div>
      <div className="space-y-3">
        {props.runs.map((run) => (
          <article
            key={run.run_id}
            className="rounded-lg border border-slate-800 bg-slate-900 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold">{run.run_id}</div>
              <div className="rounded-full border border-slate-700 px-2 py-1 text-xs font-medium">
                {formatRunStatusLabel(run.status)}
              </div>
            </div>
            <div className="mt-2 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              <div>Started: {formatEpochMs(run.started_at_epoch_ms, props.locale)}</div>
              <div>Updated: {formatEpochMs(run.updated_at_epoch_ms, props.locale)}</div>
              <div>Output Class: {run.output_class ?? '—'}</div>
              <div>Freeze Reason: {run.freeze_reason ?? '—'}</div>
            </div>
          </article>
        ))}
      </div>
      {props.runs.length === 0 ? (
        <div className="text-sm text-slate-400">No runs</div>
      ) : null}
    </section>
  );
}
