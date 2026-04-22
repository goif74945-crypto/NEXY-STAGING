type FrontStatusTone = 'neutral' | 'good' | 'warning' | 'critical';

export type FrontStatusCardProps = {
  label: string;
  value: string | number;
  tone: FrontStatusTone;
};

function getToneClasses(tone: FrontStatusTone): string {
  switch (tone) {
    case 'neutral':
      return 'border-slate-800 bg-slate-950 text-slate-100';
    case 'good':
      return 'border-emerald-800 bg-emerald-950 text-emerald-100';
    case 'warning':
      return 'border-amber-800 bg-amber-950 text-amber-100';
    case 'critical':
      return 'border-red-800 bg-red-950 text-red-100';
  }
}

export default function FrontStatusCard(props: FrontStatusCardProps): JSX.Element {
  return (
    <div className={`rounded-xl border p-4 ${getToneClasses(props.tone)}`} aria-label={props.label}>
      <div className="text-xs uppercase tracking-wide opacity-80">{props.label}</div>
      <div className="mt-2 text-2xl font-semibold">{props.value}</div>
    </div>
  );
}
