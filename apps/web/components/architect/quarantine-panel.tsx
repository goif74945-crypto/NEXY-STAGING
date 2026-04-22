export type QuarantinePanelItem = {
  universe_id: string;
  reason: string;
  active: boolean;
};

export type QuarantinePanelProps = {
  items: readonly QuarantinePanelItem[];
};

export default function QuarantinePanel(props: QuarantinePanelProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Quarantine panel"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Quarantine
      </div>

      {props.items.length === 0 ? (
        <div className="text-sm text-slate-400">No quarantine items</div>
      ) : (
        <div className="space-y-3">
          {props.items.map((item) => (
            <article
              key={item.universe_id}
              className={`rounded-lg border p-3 ${
                item.active
                  ? 'border-amber-800 bg-amber-950 text-amber-100'
                  : 'border-slate-800 bg-slate-900 text-slate-100'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">{item.universe_id}</div>
                <div className="rounded-full border border-white/10 px-2 py-1 text-xs font-medium">
                  {item.active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="mt-2 text-sm">
                {item.reason.trim() ? item.reason : 'No reason provided'}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
