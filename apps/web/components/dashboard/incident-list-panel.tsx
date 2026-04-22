import { formatIncidentSeverityLabel } from '../../lib/ui/format';

export type IncidentListItem = {
  incident_id: string;
  severity: string;
  status: string;
  title?: string;
  summary?: string;
};

export type IncidentListPanelProps = {
  incidents: readonly IncidentListItem[];
};

export default function IncidentListPanel(props: IncidentListPanelProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Incident list panel"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">Incidents</div>
      <div className="space-y-3">
        {props.incidents.map((incident) => (
          <article
            key={incident.incident_id}
            className="rounded-lg border border-slate-800 bg-slate-900 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold">{incident.title ?? incident.incident_id}</div>
              <div className="text-xs font-medium text-slate-300">
                {formatIncidentSeverityLabel(incident.severity)} • {incident.status}
              </div>
            </div>
            <div className="mt-2 text-sm text-slate-300">
              {incident.summary ?? 'No summary'}
            </div>
          </article>
        ))}
      </div>
      {props.incidents.length === 0 ? (
        <div className="text-sm text-slate-400">No incidents</div>
      ) : null}
    </section>
  );
}
