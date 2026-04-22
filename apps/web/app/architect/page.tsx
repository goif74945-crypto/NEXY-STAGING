import TracePanel from '../../components/architect/trace-panel';
import UniverseStatusTable from '../../components/architect/universe-status-table';
import BuilderPanel from '../../components/architect/builder-panel';
import CanonVersionPanel from '../../components/architect/canon-version-panel';
import DegradedModePanel from '../../components/architect/degraded-mode-panel';

const traceEntries = [
  {
    id: 'trace:1',
    label: 'Precheck locked',
    status: 'stable',
    detail: 'All deterministic constraints remain active.',
  },
  {
    id: 'trace:2',
    label: 'Builder evaluated',
    status: 'stable',
    detail: 'Artifact reproducibility was confirmed from sample inputs.',
  },
] as const;

const universeRows = [
  {
    universe_id: 'universe:alpha',
    state: 'running',
    quota: 'cpu=2, mem=4Gi',
    quarantined: false,
  },
  {
    universe_id: 'universe:beta',
    state: 'paused',
    quota: 'cpu=1, mem=2Gi',
    quarantined: true,
  },
] as const;

export default function ArchitectOverviewPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <TracePanel entries={traceEntries} />
      <UniverseStatusTable rows={universeRows} />
      <BuilderPanel
        specHash="spec:architect:0001"
        artifactHash="artifact:architect:0001"
        sealed={true}
        reproducible={true}
      />
      <CanonVersionPanel
        version="1.2.0"
        branch="main"
        amendmentCount={3}
        forked={false}
      />
      <DegradedModePanel
        enabled={false}
        reason="No degraded mode active."
        boundary="normal_operation"
      />
    </main>
  );
}
