export type UniverseHealthCardProps = {
  universeId: string;
  state: string;
  quota: string;
  quarantined: boolean;
};

export default function UniverseHealthCard(
  props: UniverseHealthCardProps,
): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Universe health card"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold uppercase tracking-wide">
          {props.universeId}
        </div>
        <div
          className={`rounded-full border px-2 py-1 text-xs font-medium ${
            props.quarantined
              ? 'border-red-700 bg-red-950 text-red-100'
              : 'border-emerald-700 bg-emerald-950 text-emerald-100'
          }`}
        >
          {props.quarantined ? 'Quarantined' : 'Healthy'}
        </div>
      </div>

      <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">State</div>
          <div className="font-medium">{props.state}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Quota</div>
          <div className="font-medium">{props.quota}</div>
        </div>
      </div>
    </section>
  );
}
