import UniverseShell from '../../../../components/universe/universe-shell';
import UniverseQuarantineBanner from '../../../../components/universe/universe-quarantine-banner';
import UniverseHealthCard from '../../../../components/universe/universe-health-card';
import TracePanel from '../../../../components/architect/trace-panel';

type UniverseQuarantinePageProps = {
  params: Promise<{ universeId: string }>;
};

export default async function UniverseQuarantinePage(
  props: UniverseQuarantinePageProps,
): Promise<JSX.Element> {
  const { universeId } = await props.params;

  const traceEntries = [
    {
      id: `${universeId}:trace:1`,
      label: 'Quarantine engaged',
      status: 'active',
      detail: `Deterministic quarantine state enabled for ${universeId}.`,
    },
    {
      id: `${universeId}:trace:2`,
      label: 'Manual review required',
      status: 'pending',
      detail: 'Static review boundary sample remains active.',
    },
  ] as const;

  return (
    <main className="mx-auto min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <UniverseShell
        title={`Universe ${universeId} Quarantine`}
        subtitle="Deterministic quarantine page foundation."
      >
        <UniverseQuarantineBanner
          quarantined={true}
          reason={`Sample quarantine reason for ${universeId}.`}
        />

        <UniverseHealthCard
          universeId={universeId}
          state="quarantined"
          quota="cpu=2, mem=4Gi"
          quarantined={true}
        />

        <TracePanel entries={traceEntries} />
      </UniverseShell>
    </main>
  );
}
