import {
  getDashboardIncidents,
  getDashboardRecentRuns,
} from '@/lib/repositories/dashboard-repository';
import { listRecentRuns } from '@/lib/repositories/run-repository';

const releaseStates = [
  {
    label: 'Output review',
    value: 'repository-backed',
  },
  {
    label: 'Release state',
    value: 'deterministic',
  },
  {
    label: 'Deployability',
    value: 'NOT VERIFIED',
  },
] as const;

export default function ViewPage() {
  const dashboardRuns = getDashboardRecentRuns();
  const repositoryRuns = listRecentRuns();
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
          NEXY VIEW
        </p>

        <h1 style={{ marginTop: 12, marginBottom: 16, fontSize: 40 }}>
          Deterministic output review surface.
        </h1>

        <p style={{ maxWidth: 760, color: '#cbd5e1', lineHeight: 1.7 }}>
          This page reviews output and release state from deterministic root
          repositories without runtime fetch, database access, or legacy
          apps/web imports.
        </p>

        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            marginTop: 32,
          }}
        >
          {releaseStates.map((state) => (
            <article
              key={state.label}
              style={{
                border: '1px solid #1e293b',
                borderRadius: 16,
                background: '#0f172a',
                padding: 20,
              }}
            >
              <strong>{state.label}</strong>
              <p style={{ marginBottom: 0, color: '#cbd5e1' }}>{state.value}</p>
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
          <section
            style={{
              border: '1px solid #1e293b',
              borderRadius: 16,
              background: '#0f172a',
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Dashboard output classes</h2>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {dashboardRuns.map((run) => (
                <li key={run.run_id}>
                  {run.run_id} — {run.output_class} — {run.status}
                </li>
              ))}
            </ul>
          </section>

          <section
            style={{
              border: '1px solid #1e293b',
              borderRadius: 16,
              background: '#0f172a',
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Recent repository runs</h2>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {repositoryRuns.map((run) => (
                <li key={run.run_id}>
                  {run.run_id} — {run.status} — {run.output_class}
                </li>
              ))}
            </ul>
          </section>

          <section
            style={{
              border: '1px solid #1e293b',
              borderRadius: 16,
              background: '#0f172a',
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Release blockers</h2>
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
    </main>
  );
}
