import StatusBar from '../../components/shell/status-bar';
import PulsePreview from '../../components/front/pulse-preview';
import FrontStatusCard from '../../components/front/front-status-card';
import { buildFrontPulseView } from '../../lib/front/pulse';

const pulse = buildFrontPulseView({
  active_sessions: 5,
  open_incidents: 0,
  queued_jobs: 8,
  running_jobs: 3,
  total_runs: 24,
});

export default function PulsePage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <StatusBar
        title="Pulse"
        status="active"
        trustLevel="low"
        activeSessions={pulse.counts.active_sessions}
        openIncidents={pulse.counts.open_incidents}
        queuedJobs={pulse.counts.queued_jobs}
        runningJobs={pulse.counts.running_jobs}
      />

      <PulsePreview pulse={pulse} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <FrontStatusCard
          label="Active Sessions"
          value={pulse.counts.active_sessions}
          tone="good"
        />
        <FrontStatusCard
          label="Open Incidents"
          value={pulse.counts.open_incidents}
          tone="neutral"
        />
        <FrontStatusCard
          label="Queued Jobs"
          value={pulse.counts.queued_jobs}
          tone="warning"
        />
        <FrontStatusCard
          label="Running Jobs"
          value={pulse.counts.running_jobs}
          tone="neutral"
        />
        <FrontStatusCard
          label="Total Runs"
          value={pulse.counts.total_runs}
          tone="good"
        />
      </section>
    </main>
  );
}
