import MainInput from '../shell/main-input';

export type PromptConsoleProps = {
  value: string;
  placeholder: string;
  disabled: boolean;
  onChange: (nextValue: string) => void;
  onSubmit: () => void;
};

export default function PromptConsole(props: PromptConsoleProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4"
      aria-label="Prompt console"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-100">
        Prompt Console
      </div>

      <MainInput
        value={props.value}
        placeholder={props.placeholder}
        disabled={props.disabled}
        onChange={props.onChange}
        onSubmit={props.onSubmit}
      />
    </section>
  );
}
