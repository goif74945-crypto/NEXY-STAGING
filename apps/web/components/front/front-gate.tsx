import type { IntentMode } from '../../lib/types/intent-mode';

export type FrontGateProps = {
  firstContact: boolean;
  mode: IntentMode;
  confidence: number;
  onContinue: () => void;
};

export default function FrontGate(props: FrontGateProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Front gate"
    >
      <div className="mb-2 text-sm font-semibold uppercase tracking-wide">Front Gate</div>
      <div className="space-y-2 text-sm">
        <div>
          First contact:{' '}
          <span className="font-medium">{props.firstContact ? 'Yes' : 'No'}</span>
        </div>
        <div>
          Suggested mode: <span className="font-medium">{props.mode}</span>
        </div>
        <div>
          Confidence: <span className="font-medium">{props.confidence}%</span>
        </div>
      </div>
      <button
        type="button"
        onClick={props.onContinue}
        className="mt-4 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100"
      >
        Continue
      </button>
    </section>
  );
}
