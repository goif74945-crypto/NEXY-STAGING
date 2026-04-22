type RecoveryMode = 'exact_replay' | 'clean_reboot' | 'manual_inspect';

export type RecoveryGateProps = {
  blocked: boolean;
  reason: string;
  mode: RecoveryMode;
};

function getModeLabel(mode: RecoveryMode): string {
  switch (mode) {
    case 'exact_replay':
      return 'Exact Replay';
    case 'clean_reboot':
      return 'Clean Reboot';
    case 'manual_inspect':
      return 'Manual Inspect';
  }
}

export default function RecoveryGate(props: RecoveryGateProps): JSX.Element {
  return (
    <section
      className={`rounded-xl border p-4 ${
        props.blocked
          ? 'border-amber-800 bg-amber-950 text-amber-100'
          : 'border-slate-800 bg-slate-950 text-slate-100'
      }`}
      aria-label="Recovery gate"
    >
      <div className="mb-2 text-sm font-semibold uppercase tracking-wide">
        Recovery Gate
      </div>
      <div className="space-y-2 text-sm">
        <div>
          Blocked: <span className="font-medium">{props.blocked ? 'Yes' : 'No'}</span>
        </div>
        <div>
          Mode: <span className="font-medium">{getModeLabel(props.mode)}</span>
        </div>
        <div>
          Reason: <span className="font-medium">{props.reason || '—'}</span>
        </div>
      </div>
    </section>
  );
}
