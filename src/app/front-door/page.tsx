import PulsePreview from '@/components/front-door/pulse-preview';
import {
  getDashboardIncidents,
  getDashboardRecentRuns,
  getDashboardSummary,
} from '@/lib/repositories/dashboard-repository';

const frontDoorChecks = [
  'root-src-tree-active',
  'apps-web-excluded-from-root-build',
  'repository-backed-pulse',
  'no-runtime-fetch',
] as const;

export default function FrontDoorPage() {
  const pulse = getDashboardSummary();
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
          NEXY ROOT FRONT DOOR
        </p>

        <h1 style={{ marginTop: 12, marginBottom: 16, fontSize: 40 }}>
          Repository-backed front door is active.
        </h1>

        <p style={{ maxWidth: 760, color: '#cbd5e1', lineHeight: 1.7 }}>
          This root front door renders deterministic repository data through the
          root PulsePreview component without fetch, database calls, filesystem
          calls, or apps/web imports.
        </p>

        <div style={{ marginTop: 32 }}>
          <PulsePreview pulse={pulse} />
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
              padding: 24,
              border: '1px solid #1e293b',
              borderRadius: 16,
              background: '#0f172a',
            }}
          >
            <h2 style={{ marginTop: 0 }}>Root lane checks</h2>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {frontDoorChecks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section
            style={{
              padding: 24,
              border: '1px solid #1e293b',
              borderRadius: 16,
              background: '#0f172a',
            }}
          >
            <h2 style={{ marginTop: 0 }}>Recent runs</h2>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {recentRuns.map((run) => (
                <li key={run.run_id}>
                  {run.run_id} — {run.status} — {run.output_class}
                </li>
              ))}
            </ul>
          </section>

          <section
            style={{
              padding: 24,
              border: '1px solid #1e293b',
              borderRadius: 16,
              background: '#0f172a',
            }}
          >
            <h2 style={{ marginTop: 0 }}>Incidents</h2>
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
