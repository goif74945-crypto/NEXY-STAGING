export type ReasonSummaryPanelProps = {
  items: readonly string[];
  truncated: boolean;
};

export default function ReasonSummaryPanel(props: ReasonSummaryPanelProps): JSX.Element {
  if (props.items.length === 0) {
    return (
      <section
        className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
        aria-label="Reason summary"
      >
        <div className="text-sm">No reasons</div>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Reason summary"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">Reason Summary</div>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {props.items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
      {props.truncated ? (
        <div className="mt-3 text-xs text-slate-400">Additional reasons are hidden.</div>
      ) : null}
    </section>
  );
}
