import type { ChangeEvent } from 'react';

import type { IntentMode } from '../../lib/types/intent-mode';

export type FrontModeSwitchProps = {
  value: IntentMode;
  disabled: boolean;
  onChange: (nextValue: IntentMode) => void;
};

const OPTIONS: IntentMode[] = ['owner', 'operator', 'viewer', 'unknown'];

export default function FrontModeSwitch(props: FrontModeSwitchProps): JSX.Element {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    props.onChange(event.target.value as IntentMode);
  };

  return (
    <label className="flex flex-col gap-2 text-sm text-slate-100">
      <span className="font-medium">Mode</span>
      <select
        value={props.value}
        disabled={props.disabled}
        onChange={handleChange}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
