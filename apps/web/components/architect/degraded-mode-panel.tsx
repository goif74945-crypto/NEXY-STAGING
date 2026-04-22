export type DegradedModePanelProps = {
  enabled: boolean;
  reason: string;
  boundary: string;
};

export default function DegradedModePanel(props: DegradedModePanelProps): JSX.Element {
  return (
    <section
      className={`rounded-xl border p-4 ${
        props.enabled
          ? 'border-amber-800 bg-amber-950 text-amber-100'
          : 'border-slate-800 bg-slate-950 text-slate-100'
      }`}
      aria-label="Degraded mode panel"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Degraded Mode
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
          <div className="text-xs opacity-80">Enabled</div>
          <div className="font-medium">{props.enabled ? 'Yes' : 'No'}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
          <div className="text-xs opacity-80">Reason</div>
          <div className="font-medium">{props.reason.trim() ? props.reason : '—'}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
          <div className="text-xs opacity-80">Boundary</div>
          <div className="font-medium">{props.boundary.trim() ? props.boundary : '—'}</div>
        </div>
      </div>
    </section>
  );
}
