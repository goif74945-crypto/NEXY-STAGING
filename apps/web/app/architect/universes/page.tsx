import UniverseStatusTable from '../../../components/architect/universe-status-table';
import QuarantinePanel from '../../../components/architect/quarantine-panel';

const universeRows = [
  {
    universe_id: 'universe:alpha',
    state: 'running',
    quota: 'cpu=2, mem=4Gi',
    quarantined: false,
  },
  {
    universe_id: 'universe:beta',
    state: 'quarantined',
    quota: 'cpu=1, mem=2Gi',
    quarantined: true,
  },
  {
    universe_id: 'universe:gamma',
    state: 'paused',
    quota: 'cpu=4, mem=8Gi',
    quarantined: false,
  },
] as const;

const quarantineItems = [
  {
    universe_id: 'universe:beta',
    reason: 'Sample isolation boundary was triggered.',
    active: true,
  },
] as const;

export default function ArchitectUniversesPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <UniverseStatusTable rows={universeRows} />
      <QuarantinePanel items={quarantineItems} />
    </main>
  );
}
