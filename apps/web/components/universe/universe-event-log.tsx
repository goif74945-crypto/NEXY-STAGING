import { formatEpochMs } from '../../lib/ui/format';

export type UniverseEventLogItem = {
  id: string;
  label: string;
  timestampEpochMs: number;
  detail?: string;
};

export type UniverseEventLogProps = {
  items: readonly UniverseEventLogItem[];
  locale?: string;
};

export default function UniverseEventLog(props: UniverseEventLogProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Universe event log"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Universe Event Log
      </div>

      {props.items.length === 0 ? (
        <div className="text-sm text-slate-400">No events</div>
      ) : (
        <div className="space-y-3">
          {props.items.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-slate-800 bg-slate-900 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="text-xs text-slate-400">
                  {formatEpochMs(item.timestampEpochMs, props.locale)}
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-300">
                {item.detail?.trim() ? item.detail : '—'}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
