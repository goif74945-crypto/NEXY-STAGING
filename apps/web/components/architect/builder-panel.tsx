export type BuilderPanelProps = {
  specHash: string;
  artifactHash: string;
  sealed: boolean;
  reproducible: boolean;
};

function renderBoolean(value: boolean): string {
  return value ? 'Yes' : 'No';
}

export default function BuilderPanel(props: BuilderPanelProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Builder panel"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Builder
      </div>

      <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Spec Hash</div>
          <div className="break-all font-medium">{props.specHash}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Artifact Hash</div>
          <div className="break-all font-medium">{props.artifactHash}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Sealed</div>
          <div className="font-medium">{renderBoolean(props.sealed)}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Reproducible</div>
          <div className="font-medium">{renderBoolean(props.reproducible)}</div>
        </div>
      </div>
    </section>
  );
}
