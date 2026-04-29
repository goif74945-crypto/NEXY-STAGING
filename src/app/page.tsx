import AgentStatusPanel from '@/components/dashboard/agent-status-panel';
import SessionTools from '@/components/dashboard/session-tools';
import PulsePreview from '@/components/front-door/pulse-preview';
import {
  getDashboardAgents,
  getDashboardIncidents,
  getDashboardRecentRuns,
  getDashboardSummary,
} from '@/lib/repositories/dashboard-repository';

const rootSetStatus = [
  {
    id: 'SET ROOT-05',
    status: 'VERIFIED',
  },
  {
    id: 'SET ROOT-06',
    status: 'VERIFIED',
  },
  {
    id: 'SET ROOT-07',
    status: 'VERIFIED',
  },
  {
    id: 'SET ROOT-08',
    status: 'active',
  },
  {
    id: 'GLOBAL DEPLOYABILITY',
    status: 'NOT VERIFIED',
  },
] as const;

export default function HomePage(): JSX.Element {
  const summary = getDashboardSummary();
  const agents = getDashboardAgents();
  const recentRuns = getDashboardRecentRuns();
  const incidents = getDashboardIncidents();

  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <section style={{ maxWidth: 1120, margin: '0 auto' }}>
        <p
          style={{
            margin: 0,
            color: '#38bdf8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          NEXY-STAGING
        </p>

        <h1 style={{ marginTop: 12, marginBottom: 16, fontSize: 40 }}>
          Root UI integration is active.
        </h1>

        <p style={{ maxWidth: 760, color: '#cbd5e1', lineHeight: 1.7 }}>
          This root dashboard uses deterministic src repository data and root
          components only. The global deployability state remains not verified
          until real command logs are available.
        </p>

        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            marginTop: 32,
          }}
        >
          {rootSetStatus.map((item) => (
            <article
              key={item.id}
              style={{
                border: '1px solid #1e293b',
                borderRadius: 16,
                background: '#0f172a',
                padding: 20,
              }}
            >
              <strong>{item.id}</strong>
              <p style={{ marginBottom: 0, color: '#cbd5e1' }}>{item.status}</p>
            </article>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gap: 24,
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            marginTop: 32,
          }}
        >
          <PulsePreview pulse={summary} />
          <AgentStatusPanel agents={agents} />
          <SessionTools />
        </div>

        <section
          aria-label="Recent repository state"
          style={{
            marginTop: 32,
            border: '1px solid #1e293b',
            borderRadius: 16,
            background: '#0f172a',
            padding: 24,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Repository-backed UI state</h2>

          <div
            style={{
              display: 'grid',
              gap: 24,
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            }}
          >
            <section>
              <h3>Recent runs</h3>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                {recentRuns.map((run) => (
                  <li key={run.run_id}>
                    {run.run_id} — {run.status} — {run.output_class}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3>Incidents</h3>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                {incidents.map((incident) => (
                  <li key={incident.incident_id}>
                    {incident.incident_id} — {incident.severity} — {incident.status}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
