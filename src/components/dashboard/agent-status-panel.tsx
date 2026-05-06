export type AgentStatus = 'online' | 'idle' | 'offline' | 'blocked';

export type AgentStatusItem = {
  agent_id: string;
  label: string;
  status: AgentStatus;
  current_run_id: string;
};

export type AgentStatusPanelProps = {
  agents?: AgentStatusItem[];
};

const DEFAULT_AGENTS: AgentStatusItem[] = [
  {
    agent_id: 'agent_001',
    label: 'Judge agent',
    status: 'online',
    current_run_id: 'run_004',
  },
  {
    agent_id: 'agent_002',
    label: 'Swarm agent',
    status: 'idle',
    current_run_id: 'none',
  },
];

export default function AgentStatusPanel({
  agents = DEFAULT_AGENTS,
}: AgentStatusPanelProps) {
  return (
    <section
      aria-label="Agent status"
      style={{
        border: '1px solid #d4d4d8',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h2>Agents</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {agents.map((agent) => (
          <article
            key={agent.agent_id}
            style={{
              border: '1px solid #e4e4e7',
              borderRadius: 10,
              padding: 12,
            }}
          >
            <strong>{agent.label}</strong>
            <dl>
              <dt>ID</dt>
              <dd>{agent.agent_id}</dd>
              <dt>Status</dt>
              <dd>{agent.status}</dd>
              <dt>Current run</dt>
              <dd>{agent.current_run_id}</dd>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
