export type TracePanelEntry = {
  id: string;
  label: string;
  status: string;
  detail?: string;
};

export type TracePanelProps = {
  entries: readonly TracePanelEntry[];
};

export default function TracePanel(props: TracePanelProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Trace panel"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Trace
      </div>

      <div className="space-y-3">
        {props.entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-lg border border-slate-800 bg-slate-900 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold">{entry.label}</div>
              <div className="rounded-full border border-slate-700 px-2 py-1 text-xs font-medium">
                {entry.status}
              </div>
            </div>
            <div className="mt-2 text-sm text-slate-300">
              {entry.detail?.trim() ? entry.detail : '—'}
            </div>
          </article>
        ))}
      </div>

      {props.entries.length === 0 ? (
        <div className="text-sm text-slate-400">No trace entries</div>
      ) : null}
    </section>
  );
}
