import { formatRunStatusLabel } from '../../lib/ui/format';

export type RunCompareClientProps = {
  leftRunId: string;
  rightRunId: string;
  sameStatus: boolean;
  sameOutputClass: boolean;
  leftStatus: string;
  rightStatus: string;
  leftOutputClass?: string;
  rightOutputClass?: string;
};

function renderComparisonFlag(value: boolean): string {
  return value ? 'Yes' : 'No';
}

export default function RunCompareClient(props: RunCompareClientProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Run compare"
    >
      <div className="mb-4 text-sm font-semibold uppercase tracking-wide">Run Compare</div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="mb-2 text-sm font-semibold">{props.leftRunId}</div>
          <div className="text-sm text-slate-300">
            Status: {formatRunStatusLabel(props.leftStatus)}
          </div>
          <div className="mt-1 text-sm text-slate-300">
            Output Class: {props.leftOutputClass ?? '—'}
          </div>
        </article>

        <article className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="mb-2 text-sm font-semibold">{props.rightRunId}</div>
          <div className="text-sm text-slate-300">
            Status: {formatRunStatusLabel(props.rightStatus)}
          </div>
          <div className="mt-1 text-sm text-slate-300">
            Output Class: {props.rightOutputClass ?? '—'}
          </div>
        </article>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          Same Status: <span className="font-medium">{renderComparisonFlag(props.sameStatus)}</span>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          Same Output Class:{' '}
          <span className="font-medium">{renderComparisonFlag(props.sameOutputClass)}</span>
        </div>
      </div>
    </section>
  );
}
