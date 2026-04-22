import { formatEpochMs } from '../../lib/ui/format';

export type TimelineEntry = {
  id: string;
  label: string;
  timestampEpochMs: number;
  description?: string;
};

export type TimelineViewProps = {
  entries: readonly TimelineEntry[];
  locale?: string;
};

export default function TimelineView(props: TimelineViewProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Timeline view"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Timeline
      </div>

      <div className="space-y-3">
        {props.entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-lg border border-slate-800 bg-slate-900 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold">{entry.label}</div>
              <div className="text-xs text-slate-400">
                {formatEpochMs(entry.timestampEpochMs, props.locale)}
              </div>
            </div>
            <div className="mt-2 text-sm text-slate-300">
              {entry.description?.trim() ? entry.description : '—'}
            </div>
          </article>
        ))}
      </div>

      {props.entries.length === 0 ? (
        <div className="text-sm text-slate-400">No timeline entries</div>
      ) : null}
    </section>
  );
}
