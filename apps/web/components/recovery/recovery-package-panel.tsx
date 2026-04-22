import { formatEpochMs } from '../../lib/ui/format';

export type RecoveryPackagePanelProps = {
  packageId: string;
  universeId: string;
  createdAtEpochMs: number;
  summary: string;
  locale?: string;
};

export default function RecoveryPackagePanel(
  props: RecoveryPackagePanelProps,
): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Recovery package panel"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Recovery Package
      </div>

      <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
        <div>Package ID: {props.packageId}</div>
        <div>Universe ID: {props.universeId}</div>
        <div className="sm:col-span-2">
          Created: {formatEpochMs(props.createdAtEpochMs, props.locale)}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-200">
        {props.summary}
      </div>
    </section>
  );
}
