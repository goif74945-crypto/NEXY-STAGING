export type CommandBarCommand = {
  id: string;
  label: string;
  hint?: string;
  disabled: boolean;
};

export type CommandBarProps = {
  commands: readonly CommandBarCommand[];
  onCommand: (commandId: string) => void;
};

export default function CommandBar(props: CommandBarProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Command bar">
      {props.commands.map((command) => (
        <button
          key={command.id}
          type="button"
          disabled={command.disabled}
          onClick={() => props.onCommand(command.id)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition disabled:cursor-not-allowed disabled:opacity-50"
          title={command.hint}
        >
          <span className="font-medium">{command.label}</span>
          {command.hint ? <span className="ml-2 text-xs text-slate-400">{command.hint}</span> : null}
        </button>
      ))}
    </div>
  );
}
