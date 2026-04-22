import { formatEpochMs } from '../../lib/ui/format';

export type TelemetryPanelProps = {
  generatedAtEpochMs: number;
  openIncidents: number;
  errorEvents: number;
  warnEvents: number;
  activeWorkers: number;
  queuedJobs: number;
  runningJobs: number;
  locale?: string;
};

export default function TelemetryPanel(props: TelemetryPanelProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Telemetry panel"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold uppercase tracking-wide">Telemetry</div>
        <div className="text-xs text-slate-400">
          Generated: {formatEpochMs(props.generatedAtEpochMs, props.locale)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Open Incidents</div>
          <div className="font-semibold">{props.openIncidents}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Error Events</div>
          <div className="font-semibold">{props.errorEvents}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Warn Events</div>
          <div className="font-semibold">{props.warnEvents}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Active Workers</div>
          <div className="font-semibold">{props.activeWorkers}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Queued Jobs</div>
          <div className="font-semibold">{props.queuedJobs}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Running Jobs</div>
          <div className="font-semibold">{props.runningJobs}</div>
        </div>
      </div>
    </section>
  );
}
