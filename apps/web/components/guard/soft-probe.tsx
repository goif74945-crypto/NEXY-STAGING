export type SoftProbeComponentProps = {
  askProbe: boolean;
  message: string;
  reason: string;
};

export default function SoftProbe(props: SoftProbeComponentProps): JSX.Element {
  return (
    <section
      className={`rounded-xl border p-4 ${
        props.askProbe
          ? 'border-blue-800 bg-blue-950 text-blue-100'
          : 'border-slate-800 bg-slate-950 text-slate-100'
      }`}
      aria-label="Soft probe"
    >
      <div className="mb-2 text-sm font-semibold uppercase tracking-wide">
        Soft Probe
      </div>
      <div className="space-y-2 text-sm">
        <div>
          Ask Probe: <span className="font-medium">{props.askProbe ? 'Yes' : 'No'}</span>
        </div>
        <div>
          Message: <span className="font-medium">{props.message.trim() ? props.message : '—'}</span>
        </div>
        <div>
          Reason: <span className="font-medium">{props.reason.trim() ? props.reason : '—'}</span>
        </div>
      </div>
    </section>
  );
}
