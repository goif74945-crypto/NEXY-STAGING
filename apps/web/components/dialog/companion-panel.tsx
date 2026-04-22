type CompanionTone = 'neutral' | 'gentle' | 'firm';

export type CompanionPanelProps = {
  tone: CompanionTone;
  showReasonSummary: boolean;
  showSoftProbe: boolean;
};

export default function CompanionPanel(props: CompanionPanelProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Companion panel"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">Companion Plan</div>
      <div className="grid gap-2 text-sm">
        <div>
          Tone: <span className="font-medium">{props.tone}</span>
        </div>
        <div>
          Reason Summary:{' '}
          <span className="font-medium">{props.showReasonSummary ? 'Shown' : 'Hidden'}</span>
        </div>
        <div>
          Soft Probe: <span className="font-medium">{props.showSoftProbe ? 'Shown' : 'Hidden'}</span>
        </div>
      </div>
    </section>
  );
}
