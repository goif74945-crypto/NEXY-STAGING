export type UniverseResourcePanelProps = {
  cpu: string;
  memory: string;
  disk: string;
  network: string;
};

export default function UniverseResourcePanel(
  props: UniverseResourcePanelProps,
): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Universe resource panel"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Universe Resources
      </div>

      <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">CPU</div>
          <div className="font-medium">{props.cpu}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Memory</div>
          <div className="font-medium">{props.memory}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Disk</div>
          <div className="font-medium">{props.disk}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Network</div>
          <div className="font-medium">{props.network}</div>
        </div>
      </div>
    </section>
  );
}
