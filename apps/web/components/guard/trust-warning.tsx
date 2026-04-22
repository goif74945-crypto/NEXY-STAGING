import type { TrustLevel } from '../../lib/types/trust-level';

export type TrustWarningProps = {
  visible: boolean;
  trustLevel: TrustLevel;
  message: string;
};

function getTrustClasses(trustLevel: TrustLevel): string {
  switch (trustLevel) {
    case 'low':
      return 'border-blue-700 bg-blue-950 text-blue-100';
    case 'medium':
      return 'border-amber-700 bg-amber-950 text-amber-100';
    case 'high':
      return 'border-orange-700 bg-orange-950 text-orange-100';
    case 'critical':
      return 'border-red-800 bg-red-950 text-red-100';
  }
}

export default function TrustWarning(props: TrustWarningProps): JSX.Element | null {
  if (!props.visible) {
    return null;
  }

  return (
    <section
      className={`rounded-xl border px-4 py-3 ${getTrustClasses(props.trustLevel)}`}
      aria-label="Trust warning"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold uppercase tracking-wide">
          Trust Warning
        </div>
        <div className="rounded-full border border-white/10 px-2 py-1 text-xs font-medium">
          {props.trustLevel}
        </div>
      </div>
      <div className="mt-2 text-sm">{props.message}</div>
    </section>
  );
}
