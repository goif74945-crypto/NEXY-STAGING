export type IncidentListItem = {
  incident_id: string;
  severity: 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
  status: 'open' | 'investigating' | 'resolved';
  title: string;
};

export type IncidentListPanelProps = {
  incidents?: IncidentListItem[];
};

const DEFAULT_INCIDENTS: IncidentListItem[] = [
  {
    incident_id: 'incident_001',
    severity: 'S2',
    status: 'open',
    title: 'Deterministic queue pressure',
  },
  {
    incident_id: 'incident_002',
    severity: 'S1',
    status: 'investigating',
    title: 'Telemetry warning threshold',
  },
];

export default function IncidentListPanel({
  incidents = DEFAULT_INCIDENTS,
}: IncidentListPanelProps) {
  return (
    <section
      aria-label="Incident list"
      style={{
        border: '1px solid #d4d4d8',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h2>Incidents</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {incidents.map((incident) => (
          <article
            key={incident.incident_id}
            style={{
              border: '1px solid #e4e4e7',
              borderRadius: 10,
              padding: 12,
            }}
          >
            <strong>{incident.title}</strong>
            <dl>
              <dt>ID</dt>
              <dd>{incident.incident_id}</dd>
              <dt>Severity</dt>
              <dd>{incident.severity}</dd>
              <dt>Status</dt>
              <dd>{incident.status}</dd>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
