import UniverseShell from '../../../../components/universe/universe-shell';
import UniverseEventLog from '../../../../components/universe/universe-event-log';

type UniverseEventsPageProps = {
  params: Promise<{ universeId: string }>;
};

export default async function UniverseEventsPage(
  props: UniverseEventsPageProps,
): Promise<JSX.Element> {
  const { universeId } = await props.params;

  const items = [
    {
      id: `${universeId}:event:1`,
      label: 'Universe boot completed',
      timestampEpochMs: 1712300000000,
      detail: `Deterministic event log sample for ${universeId}.`,
    },
    {
      id: `${universeId}:event:2`,
      label: 'Quota applied',
      timestampEpochMs: 1712300300000,
      detail: 'Static resource allocation sample attached to this universe.',
    },
    {
      id: `${universeId}:event:3`,
      label: 'Health check passed',
      timestampEpochMs: 1712300600000,
      detail: 'Deterministic sample health event rendered on the page.',
    },
  ] as const;

  return (
    <main className="mx-auto min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <UniverseShell
        title={`Universe ${universeId} Events`}
        subtitle="Deterministic universe events page foundation."
      >
        <UniverseEventLog items={items} locale="en-US" />
      </UniverseShell>
    </main>
  );
}
