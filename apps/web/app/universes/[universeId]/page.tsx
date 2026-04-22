import UniverseShell from '../../../components/universe/universe-shell';
import UniverseHealthCard from '../../../components/universe/universe-health-card';
import UniverseQuarantineBanner from '../../../components/universe/universe-quarantine-banner';
import UniverseResourcePanel from '../../../components/universe/universe-resource-panel';
import UniverseEventLog from '../../../components/universe/universe-event-log';

type UniverseDetailPageProps = {
  params: Promise<{ universeId: string }>;
};

export default async function UniverseDetailPage(
  props: UniverseDetailPageProps,
): Promise<JSX.Element> {
  const { universeId } = await props.params;

  const eventItems = [
    {
      id: `${universeId}:event:1`,
      label: 'Universe started',
      timestampEpochMs: 1712200000000,
      detail: 'Sample universe boot sequence completed.',
    },
    {
      id: `${universeId}:event:2`,
      label: 'Quota applied',
      timestampEpochMs: 1712200300000,
      detail: 'Resource quota sample was attached to the universe.',
    },
  ] as const;

  return (
    <main className="mx-auto min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <UniverseShell
        title={`Universe ${universeId}`}
        subtitle="Deterministic universe detail page foundation."
      >
        <UniverseHealthCard
          universeId={universeId}
          state="running"
          quota="cpu=4, mem=8Gi"
          quarantined={false}
        />

        <UniverseQuarantineBanner
          quarantined={false}
          reason="No quarantine is active for this deterministic sample."
        />

        <UniverseResourcePanel
          cpu="4 vCPU"
          memory="8 GiB"
          disk="120 GiB"
          network="1 Gbps"
        />

        <UniverseEventLog items={eventItems} locale="en-US" />
      </UniverseShell>
    </main>
  );
}
