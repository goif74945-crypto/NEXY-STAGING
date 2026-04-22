export type ControlStripAction = {
  id: string;
  label: string;
  disabled: boolean;
  active: boolean;
};

export type ControlStripProps = {
  actions: readonly ControlStripAction[];
  onActionSelect: (actionId: string) => void;
};

export default function ControlStrip(props: ControlStripProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Control strip">
      {props.actions.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={action.disabled}
          onClick={() => props.onActionSelect(action.id)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
            action.active
              ? 'border-blue-700 bg-blue-950 text-blue-100'
              : 'border-slate-700 bg-slate-900 text-slate-100'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
