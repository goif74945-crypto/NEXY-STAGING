import UniverseHealthCard from '../../../components/universe/universe-health-card';
import CrashDiffViewer from '../../../components/recovery/crash-diff-viewer';
import TracePanel from '../../../components/architect/trace-panel';

type InspectUniversePageProps = {
  params: Promise<{ universeId: string }>;
};

export default async function InspectUniversePage(
  props: InspectUniversePageProps,
): Promise<JSX.Element> {
  const { universeId } = await props.params;

  const traceEntries = [
    {
      id: `${universeId}:trace:1`,
      label: 'Inspect started',
      status: 'stable',
      detail: `Inspection sample is locked to ${universeId}.`,
    },
    {
      id: `${universeId}:trace:2`,
      label: 'Crash diff rendered',
      status: 'stable',
      detail: 'Before/after text was prepared from deterministic sample values.',
    },
  ] as const;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <UniverseHealthCard
        universeId={universeId}
        state="paused"
        quota="cpu=2, mem=4Gi"
        quarantined={true}
      />

      <CrashDiffViewer
        beforeText={'health=running\nquarantine=false\nreview=pending'}
        afterText={'health=paused\nquarantine=true\nreview=required'}
        summary={{
          added_lines: 1,
          removed_lines: 1,
          changed: true,
        }}
      />

      <TracePanel entries={traceEntries} />
    </main>
  );
}
