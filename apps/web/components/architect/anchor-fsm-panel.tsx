export type AnchorFsmStep = {
  id: string;
  label: string;
  active: boolean;
  completed: boolean;
};

export type AnchorFsmPanelProps = {
  steps: readonly AnchorFsmStep[];
};

function getStepClasses(step: AnchorFsmStep): string {
  if (step.active) {
    return 'border-blue-700 bg-blue-950 text-blue-100';
  }

  if (step.completed) {
    return 'border-emerald-700 bg-emerald-950 text-emerald-100';
  }

  return 'border-slate-800 bg-slate-900 text-slate-100';
}

export default function AnchorFsmPanel(props: AnchorFsmPanelProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Anchor FSM panel"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Anchor FSM
      </div>

      {props.steps.length === 0 ? (
        <div className="text-sm text-slate-400">No anchor steps</div>
      ) : (
        <div className="space-y-2">
          {props.steps.map((step, index) => (
            <div
              key={step.id}
              className={`rounded-lg border px-3 py-3 ${getStepClasses(step)}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">
                  {index + 1}. {step.label}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full border border-white/10 px-2 py-1">
                    {step.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="rounded-full border border-white/10 px-2 py-1">
                    {step.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
