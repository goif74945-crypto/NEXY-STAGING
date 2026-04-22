import { formatEpochMs, formatWorkerStatusLabel } from '../../lib/ui/format';

export type AgentStatusItem = {
  worker_id: string;
  status: string;
  current_job_id?: string;
  last_heartbeat_epoch_ms: number;
};

export type AgentStatusPanelProps = {
  agents: readonly AgentStatusItem[];
  locale?: string;
};

export default function AgentStatusPanel(props: AgentStatusPanelProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Agent status panel"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">Agents</div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-slate-400">
              <th className="px-3 py-2 font-medium">Worker</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Current Job</th>
              <th className="px-3 py-2 font-medium">Last Heartbeat</th>
            </tr>
          </thead>
          <tbody>
            {props.agents.map((agent) => (
              <tr key={agent.worker_id} className="border-b border-slate-900 align-top">
                <td className="px-3 py-2 font-medium">{agent.worker_id}</td>
                <td className="px-3 py-2">{formatWorkerStatusLabel(agent.status)}</td>
                <td className="px-3 py-2">{agent.current_job_id ?? '—'}</td>
                <td className="px-3 py-2">
                  {formatEpochMs(agent.last_heartbeat_epoch_ms, props.locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {props.agents.length === 0 ? (
        <div className="mt-3 text-sm text-slate-400">No agents</div>
      ) : null}
    </section>
  );
}
