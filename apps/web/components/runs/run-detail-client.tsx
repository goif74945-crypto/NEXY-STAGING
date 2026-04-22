import { formatEpochMs, formatRunStatusLabel } from '../../lib/ui/format';

export type RunDetailClientProps = {
  runId: string;
  status: string;
  startedAtEpochMs: number;
  updatedAtEpochMs: number;
  endedAtEpochMs?: number;
  outputClass?: string;
  freezeReason?: string;
  locale?: string;
};

export default function RunDetailClient(props: RunDetailClientProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Run detail"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold uppercase tracking-wide">{props.runId}</div>
        <div className="rounded-full border border-slate-700 px-2 py-1 text-xs font-medium">
          {formatRunStatusLabel(props.status)}
        </div>
      </div>

      <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
        <div>Started: {formatEpochMs(props.startedAtEpochMs, props.locale)}</div>
        <div>Updated: {formatEpochMs(props.updatedAtEpochMs, props.locale)}</div>
        <div>
          Ended:{' '}
          {props.endedAtEpochMs === undefined
            ? '—'
            : formatEpochMs(props.endedAtEpochMs, props.locale)}
        </div>
        <div>Output Class: {props.outputClass ?? '—'}</div>
        <div className="sm:col-span-2">Freeze Reason: {props.freezeReason ?? '—'}</div>
      </div>
    </section>
  );
}
