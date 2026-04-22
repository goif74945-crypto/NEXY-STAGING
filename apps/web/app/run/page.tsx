import RunList from '../../components/runs/run-list';
import RunSummaryPanel from '../../components/dashboard/run-summary-panel';
import TelemetryPanel from '../../components/dashboard/telemetry-panel';

const runs = [
  {
    run_id: 'run:alpha',
    status: 'running',
    started_at_epoch_ms: 1710000000000,
    updated_at_epoch_ms: 1710000300000,
  },
  {
    run_id: 'run:beta',
    status: 'stable',
    started_at_epoch_ms: 1710000600000,
    updated_at_epoch_ms: 1710000900000,
  },
] as const;

const runSummaryItems = [
  {
    run_id: 'run:alpha',
    status: 'running',
    started_at_epoch_ms: 1710000000000,
    updated_at_epoch_ms: 1710000300000,
    output_class: 'report',
  },
  {
    run_id: 'run:beta',
    status: 'stable',
    started_at_epoch_ms: 1710000600000,
    updated_at_epoch_ms: 1710000900000,
    output_class: 'output',
    freeze_reason: '',
  },
] as const;

export default function RunPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <RunList runs={runs} locale="en-US" />
      <RunSummaryPanel runs={runSummaryItems} locale="en-US" />
      <TelemetryPanel
        generatedAtEpochMs={1710001200000}
        openIncidents={1}
        errorEvents={2}
        warnEvents={4}
        activeWorkers={3}
        queuedJobs={5}
        runningJobs={2}
        locale="en-US"
      />
    </main>
  );
}
