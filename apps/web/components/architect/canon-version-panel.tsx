export type CanonVersionPanelProps = {
  version: string;
  branch: string;
  amendmentCount: number;
  forked: boolean;
};

export default function CanonVersionPanel(props: CanonVersionPanelProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Canon version panel"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Canon Version
      </div>

      <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Version</div>
          <div className="font-medium">{props.version}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Branch</div>
          <div className="font-medium">{props.branch}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Amendments</div>
          <div className="font-medium">{props.amendmentCount}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Forked</div>
          <div className="font-medium">{props.forked ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </section>
  );
}
