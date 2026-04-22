export type ManualInspectCardProps = {
  required: boolean;
  summary: string;
  onInspect: () => void;
};

export default function ManualInspectCard(props: ManualInspectCardProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Manual inspect card"
    >
      <div className="mb-2 text-sm font-semibold uppercase tracking-wide">
        Manual Inspect
      </div>
      <div className="mb-4 text-sm text-slate-300">{props.summary}</div>
      <div className="mb-4 text-xs text-slate-400">
        Required: {props.required ? 'Yes' : 'No'}
      </div>
      <button
        type="button"
        onClick={props.onInspect}
        className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100"
      >
        Inspect
      </button>
    </section>
  );
}
