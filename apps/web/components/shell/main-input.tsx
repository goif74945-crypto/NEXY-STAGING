import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';

export type MainInputProps = {
  value: string;
  placeholder: string;
  disabled: boolean;
  onChange: (nextValue: string) => void;
  onSubmit: () => void;
};

export default function MainInput(props: MainInputProps): JSX.Element {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    props.onChange(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (props.disabled) {
      return;
    }

    props.onSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (props.disabled) {
      return;
    }

    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      props.onSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4"
      aria-label="Main command input"
    >
      <label className="text-sm font-medium text-slate-200" htmlFor="main-input-textarea">
        Command Input
      </label>
      <textarea
        id="main-input-textarea"
        value={props.value}
        placeholder={props.placeholder}
        disabled={props.disabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={6}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400">Press Ctrl+Enter or Cmd+Enter to submit</div>
        <button
          type="submit"
          disabled={props.disabled}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
