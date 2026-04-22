import AgentStatusPanel from '../../components/dashboard/agent-status-panel';
import TaskQueueViewer from '../../components/dashboard/task-queue-viewer';
import TelemetryPanel from '../../components/dashboard/telemetry-panel';
import IncidentListPanel from '../../components/dashboard/incident-list-panel';

const agents = [
  {
    worker_id: 'worker:a',
    status: 'running',
    current_job_id: 'job:12',
    last_heartbeat_epoch_ms: 1710001200000,
  },
  {
    worker_id: 'worker:b',
    status: 'idle',
    last_heartbeat_epoch_ms: 1710001180000,
  },
] as const;

const jobs = [
  { job_id: 'job:12', job_type: 'run', status: 'running', worker_id: 'worker:a' },
  { job_id: 'job:13', job_type: 'verify', status: 'queued' },
] as const;

const incidents = [
  {
    incident_id: 'inc:1',
    severity: 'high',
    status: 'open',
    title: 'Queue drift',
    summary: 'Queued jobs exceed stable threshold.',
  },
] as const;

export default function MonitorPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <AgentStatusPanel agents={agents} locale="en-US" />
      <TaskQueueViewer jobs={jobs} />
      <TelemetryPanel
        generatedAtEpochMs={1710001200000}
        openIncidents={1}
        errorEvents={1}
        warnEvents={3}
        activeWorkers={2}
        queuedJobs={1}
        runningJobs={1}
        locale="en-US"
      />
      <IncidentListPanel incidents={incidents} />
    </main>
  );
}
